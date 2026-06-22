import express from 'express';
import Stripe from 'stripe';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBlockedRanges, overlapsBlocked } from './server/airbnb.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 8080);
const contactTo = process.env.CONTACT_TO_EMAIL || 'listingsbyd@gmail.com';
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL || 'Iris & J Holdings <onboarding@resend.dev>';
const canonicalHost = 'www.irisjholdings.com';
const apexHost = 'irisjholdings.com';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const booking = {
  icalUrl: process.env.AIRBNB_ICAL_URL || '',
  currency: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
  nightlyRateCents: Number(process.env.VACATION_RENTAL_NIGHTLY_RATE_CENTS || 0),
  cleaningFeeCents: Number(process.env.VACATION_RENTAL_CLEANING_FEE_CENTS || 0),
  successUrl: process.env.STRIPE_SUCCESS_URL || '',
  cancelUrl: process.env.STRIPE_CANCEL_URL || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

const newsletter = {
  audienceId: process.env.RESEND_AUDIENCE_ID || '',
  adminToken: process.env.NEWSLETTER_ADMIN_TOKEN || '',
};

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  const host = forwardedHost.split(',')[0].split(':')[0].toLowerCase();

  if ((req.method === 'GET' || req.method === 'HEAD') && host === apexHost) {
    return res.redirect(301, `https://${canonicalHost}${req.originalUrl}`);
  }

  return next();
});

// Stripe webhook needs the raw request body for signature verification, so it
// must be registered before the JSON body parser below.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !booking.webhookSecret) {
    return res.status(503).end();
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], booking.webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    bookedCache = { at: 0, ranges: [] }; // a new paid booking — refresh availability
    try {
      await notifyBooking(event.data.object);
    } catch (notifyError) {
      console.error('Booking notification failed:', notifyError);
    }
  }

  return res.json({ received: true });
});

app.use(express.json({ limit: '100kb' }));

// Simple in-memory rate limit for the public contact endpoint.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const rateHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateHits.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateHits.set(ip, { start: now, count: 1 });
    if (rateHits.size > 5000) {
      for (const [key, value] of rateHits) {
        if (now - value.start > RATE_LIMIT_WINDOW_MS) rateHits.delete(key);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function clean(value) {
  return String(value ?? '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendResendEmail({ to, replyTo, subject, text, html }) {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom,
      to,
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${errorText}`);
  }
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function nightsBetween(checkIn, checkOut) {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function validateStay(checkIn, checkOut) {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) {
    return { ok: false, message: 'Please choose valid check-in and check-out dates.' };
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { ok: false, message: 'Check-out must be after check-in.' };
  if (nights > 30) return { ok: false, message: 'Please choose a stay of 30 nights or fewer.' };
  if (checkIn < todayIso()) return { ok: false, message: 'Check-in cannot be in the past.' };
  return { ok: true, nights };
}

function money(cents, currency) {
  return `${(cents / 100).toFixed(2)} ${String(currency).toUpperCase()}`;
}

// Website bookings are stored in Stripe itself: any paid Checkout Session carries
// the booked dates in its metadata. We read those back and treat them as blocked,
// so a date booked on the site grays out just like an Airbnb-blocked date.
let bookedCache = { at: 0, ranges: [] };
const BOOKED_CACHE_TTL_MS = 5 * 60 * 1000;

async function getWebsiteBookedRanges() {
  if (!stripe) return [];

  const now = Date.now();
  if (now - bookedCache.at < BOOKED_CACHE_TTL_MS) {
    return bookedCache.ranges;
  }

  try {
    const ranges = [];
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    for (const session of sessions.data) {
      const { checkIn, checkOut } = session.metadata || {};
      if (session.payment_status === 'paid' && checkIn && checkOut) {
        ranges.push({ start: checkIn, end: checkOut });
      }
    }
    bookedCache = { at: now, ranges };
    return ranges;
  } catch (error) {
    console.error('Failed to load website bookings from Stripe:', error);
    return bookedCache.ranges;
  }
}

async function getAllBlockedRanges() {
  const [airbnb, website] = await Promise.all([
    getBlockedRanges(booking.icalUrl),
    getWebsiteBookedRanges(),
  ]);
  return [...airbnb, ...website];
}

async function notifyBooking(session) {
  const { checkIn = '', checkOut = '' } = session.metadata || {};
  const guestEmail = session.customer_details?.email || session.customer_email || 'unknown';
  await sendResendEmail({
    to: contactTo,
    subject: `New vacation rental booking — ${checkIn} to ${checkOut}`,
    text: `A vacation rental booking was paid through Stripe.\n\nDates: ${checkIn} to ${checkOut}\nGuest: ${guestEmail}\nAmount: ${money(session.amount_total ?? 0, session.currency || 'usd')}\nStripe session: ${session.id}`,
    html: `<h2>New vacation rental booking</h2><p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}<br><strong>Guest:</strong> ${escapeHtml(guestEmail)}<br><strong>Amount:</strong> ${escapeHtml(money(session.amount_total ?? 0, session.currency || 'usd'))}<br><strong>Stripe session:</strong> ${escapeHtml(session.id)}</p>`,
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/availability', async (_req, res) => {
  const blocked = await getAllBlockedRanges();
  res.json({
    blocked,
    nightlyRateCents: booking.nightlyRateCents,
    cleaningFeeCents: booking.cleaningFeeCents,
    currency: booking.currency,
    bookingEnabled: Boolean(stripe && booking.nightlyRateCents > 0),
  });
});

app.post('/api/checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Online booking isn’t available yet. Please join the interest list.' });
    }
    if (!(booking.nightlyRateCents > 0)) {
      return res.status(503).json({ message: 'Pricing isn’t set up yet. Please join the interest list.' });
    }

    const checkIn = clean(req.body?.checkIn);
    const checkOut = clean(req.body?.checkOut);
    const email = clean(req.body?.email);

    const stay = validateStay(checkIn, checkOut);
    if (!stay.ok) {
      return res.status(400).json({ message: stay.message });
    }

    const blocked = await getAllBlockedRanges();
    if (overlapsBlocked(checkIn, checkOut, blocked)) {
      return res.status(409).json({ message: 'Some of those nights are no longer available. Please choose different dates.' });
    }

    const origin = `${req.protocol}://${req.get('host')}`;
    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: booking.currency,
          unit_amount: booking.nightlyRateCents * stay.nights,
          product_data: {
            name: `Orlando vacation rental — ${stay.nights} night${stay.nights > 1 ? 's' : ''}`,
            description: `${checkIn} to ${checkOut}`,
          },
        },
      },
    ];
    if (booking.cleaningFeeCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: booking.currency,
          unit_amount: booking.cleaningFeeCents,
          product_data: { name: 'Cleaning fee' },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: booking.successUrl || `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: booking.cancelUrl || `${origin}/vacation-rentals`,
      customer_email: email || undefined,
      metadata: { checkIn, checkOut, nights: String(stay.nights) },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout failed:', error);
    return res.status(500).json({ message: 'Could not start checkout. Please try again.' });
  }
});

app.get('/api/checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Not available.' });
    }
    const id = clean(req.query?.session_id);
    if (!id) {
      return res.status(400).json({ message: 'Missing session id.' });
    }
    const session = await stripe.checkout.sessions.retrieve(id);
    return res.json({
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      checkIn: session.metadata?.checkIn || '',
      checkOut: session.metadata?.checkOut || '',
      email: session.customer_details?.email || session.customer_email || '',
    });
  } catch (error) {
    console.error('Checkout session lookup failed:', error);
    return res.status(404).json({ message: 'Booking not found.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ message: 'Too many requests. Please try again in a little while.' });
    }

    const subject = clean(req.body?.subject) || 'Iris & J Holdings Website Request';
    const fields = req.body?.fields && typeof req.body.fields === 'object' ? req.body.fields : req.body;
    const name = clean(fields?.Name || fields?.['Full Name'] || fields?.name || fields?.FullName || fields?.fullName);
    const email = clean(fields?.Email || fields?.email);

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const wantsNewsletter = clean(fields?.['Newsletter Opt In'] || fields?.Newsletter || fields?.newsletterOptIn).length > 0;

    const rows = Object.entries(fields || {})
      .filter(([key]) => !key.startsWith('_') && key !== 'Newsletter Opt In' && key !== 'Newsletter')
      .map(([key, value]) => [key, clean(value)])
      .filter(([, value]) => value.length > 0);

    const text = rows.map(([key, value]) => `${key}: ${value}`).join('\n');
    const htmlRows = rows
      .map(([key, value]) => `<tr><th align="left">${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`)
      .join('');

    await sendResendEmail({
      to: contactTo,
      replyTo: email,
      subject,
      text: `${text}\n\nSource: Iris & J Holdings website`,
      html: `<h2>${escapeHtml(subject)}</h2><table cellpadding="6" cellspacing="0">${htmlRows}</table><p><strong>Source:</strong> Iris &amp; J Holdings website</p>`,
    });

    // Send the visitor a confirmation. A failure here must not fail the request.
    try {
      await sendResendEmail({
        to: email,
        replyTo: contactTo,
        subject: 'We received your message — Iris & J Holdings',
        text: `Hi ${name},\n\nThanks for reaching out to Iris & J Holdings. Daiana received your message and will follow up by email soon.\n\nIf your request is time-sensitive, you can call (908) 499-6320.\n\n— Iris & J Holdings`,
        html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for reaching out to Iris &amp; J Holdings. Daiana received your message and will follow up by email soon.</p><p>If your request is time-sensitive, you can call <a href="tel:19084996320">(908) 499-6320</a>.</p><p>— Iris &amp; J Holdings</p>`,
      });
    } catch (confirmError) {
      console.error('Confirmation email failed:', confirmError);
    }

    if (wantsNewsletter) {
      subscribeEmail(email, name).catch((subErr) => console.error('Newsletter subscribe failed:', subErr));
    }

    return res.status(200).json({ message: 'Message sent.' });
  } catch (error) {
    console.error('Contact email failed:', error);
    return res.status(500).json({ message: 'Message could not be sent.' });
  }
});

// ---- Newsletter: subscribers via Resend Audiences, sending via Broadcasts ----
async function resendRequest(apiPath, method, body) {
  if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured.');
  const response = await fetch(`https://api.resend.com${apiPath}`, {
    method,
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

// Resend keeps one contact per email per audience, so re-adding an existing
// email never creates a duplicate — a subscriber can't be subscribed twice.
async function subscribeEmail(email, name) {
  if (!resendApiKey || !newsletter.audienceId) {
    throw new Error('Newsletter is not configured.');
  }
  const firstName = clean(name).split(' ')[0] || undefined;
  const result = await resendRequest(`/audiences/${newsletter.audienceId}/contacts`, 'POST', {
    email: clean(email).toLowerCase(),
    first_name: firstName,
    unsubscribed: false,
  });
  const already = !result.ok && /exist|already/i.test(JSON.stringify(result.data));
  return { ok: result.ok || already, already };
}

function newsletterHtml({ title, date, body, images = [], listings = [] }) {
  const s = (value) => escapeHtml(value);
  const paragraphs = clean(body)
    .split(/\n{2,}/)
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;color:#3f4650">${s(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  const imageHtml = images
    .filter((img) => clean(img?.url))
    .map((img) => `<figure style="margin:0 0 18px"><img src="${s(img.url)}" alt="${s(img.caption || '')}" style="width:100%;border-radius:8px"/>${img.caption ? `<figcaption style="font-size:13px;color:#6f747b;margin-top:6px">${s(img.caption)}</figcaption>` : ''}</figure>`)
    .join('');
  const listingHtml = listings
    .filter((l) => clean(l?.title) || clean(l?.url))
    .map((l) => `<table width="100%" style="margin:0 0 16px;border:1px solid #e7dfd4;border-radius:8px"><tr><td style="padding:14px">${l.image ? `<img src="${s(l.image)}" alt="${s(l.title || '')}" style="width:100%;border-radius:6px;margin-bottom:10px"/>` : ''}<strong style="font-size:16px;color:#121820">${s(l.title || 'Listing')}</strong>${l.description ? `<p style="margin:6px 0 10px;color:#3f4650">${s(l.description)}</p>` : ''}${l.url ? `<a href="${s(l.url)}" style="color:#a77931;font-weight:700">View listing &rarr;</a>` : ''}</td></tr></table>`)
    .join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fbfaf7">
    <h1 style="font-family:Georgia,'Times New Roman',serif;color:#121820;font-size:26px;margin:0 0 4px">${s(title || 'Iris & J Holdings')}</h1>
    <p style="color:#a77931;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:12px;margin:0 0 20px">${s(date || '')}</p>
    ${paragraphs}${imageHtml}${listingHtml}
    <hr style="border:none;border-top:1px solid #e7dfd4;margin:24px 0"/>
    <p style="font-size:12px;color:#6f747b">Iris &amp; J Holdings &middot; Real estate through All Star Real Estate Agency &middot; Mobile notary &amp; Orlando vacation rentals.<br>You are receiving this because you subscribed at irisjholdings.com. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#6f747b">Unsubscribe</a>.</p>
  </div>`;
}

app.post('/api/subscribe', async (req, res) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    const email = clean(req.body?.email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (!resendApiKey || !newsletter.audienceId) {
      return res.status(503).json({ message: 'The newsletter isn’t available yet.' });
    }
    const result = await subscribeEmail(email, clean(req.body?.name));
    return res.status(200).json({ subscribed: true, already: result.already });
  } catch (error) {
    console.error('Subscribe failed:', error);
    return res.status(500).json({ message: 'Could not subscribe right now. Please try again.' });
  }
});

app.get('/api/newsletter/config', (_req, res) => {
  res.json({ enabled: Boolean(resendApiKey && newsletter.audienceId) });
});

app.post('/api/newsletter/send', async (req, res) => {
  try {
    if (!resendApiKey || !newsletter.audienceId) {
      return res.status(503).json({ message: 'Newsletter is not configured.' });
    }
    if (!newsletter.adminToken || req.get('x-admin-token') !== newsletter.adminToken) {
      return res.status(401).json({ message: 'Not authorized.' });
    }
    const title = clean(req.body?.title) || 'Iris & J Holdings Newsletter';
    const date = clean(req.body?.date);
    const body = clean(req.body?.body);
    const subject = clean(req.body?.subject) || title;
    const images = Array.isArray(req.body?.images) ? req.body.images.slice(0, 12) : [];
    const listings = Array.isArray(req.body?.listings) ? req.body.listings.slice(0, 20) : [];
    if (!body && images.length === 0 && listings.length === 0) {
      return res.status(400).json({ message: 'Add some content before sending.' });
    }
    const html = newsletterHtml({ title, date, body, images, listings });
    const created = await resendRequest('/broadcasts', 'POST', {
      audience_id: newsletter.audienceId,
      from: resendFrom,
      subject,
      html,
    });
    if (!created.ok || !created.data?.id) {
      throw new Error(`Broadcast create failed: ${created.status} ${JSON.stringify(created.data)}`);
    }
    const sent = await resendRequest(`/broadcasts/${created.data.id}/send`, 'POST', {});
    if (!sent.ok) {
      throw new Error(`Broadcast send failed: ${sent.status} ${JSON.stringify(sent.data)}`);
    }
    return res.status(200).json({ ok: true, broadcastId: created.data.id });
  } catch (error) {
    console.error('Newsletter send failed:', error);
    return res.status(500).json({ message: 'Could not send the newsletter. Check the server logs.' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Iris & J Holdings server listening on ${port}`);
});
