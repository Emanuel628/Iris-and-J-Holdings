import express from 'express';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getBlockedRanges, overlapsBlocked } from './server/airbnb.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 8080);
const contactTo = process.env.CONTACT_TO_EMAIL || 'listingsbyd@gmail.com';

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

app.set('trust proxy', 1);

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

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT || 465);

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured.');
  }

  return nodemailer.createTransport({
    host,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user, pass },
  });
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

async function notifyBooking(session) {
  const transporter = getTransporter();
  const { checkIn = '', checkOut = '' } = session.metadata || {};
  const guestEmail = session.customer_details?.email || session.customer_email || 'unknown';
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: contactTo,
    subject: `New vacation rental booking — ${checkIn} to ${checkOut}`,
    text: `A vacation rental booking was paid through Stripe.\n\nDates: ${checkIn} to ${checkOut}\nGuest: ${guestEmail}\nAmount: ${money(session.amount_total ?? 0, session.currency || 'usd')}\nStripe session: ${session.id}`,
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/availability', async (_req, res) => {
  const blocked = await getBlockedRanges(booking.icalUrl);
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

    const blocked = await getBlockedRanges(booking.icalUrl);
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
    const name = clean(fields?.Name || fields?.name || fields?.FullName || fields?.fullName);
    const email = clean(fields?.Email || fields?.email);

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const rows = Object.entries(fields || {})
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => [key, clean(value)])
      .filter(([, value]) => value.length > 0);

    const text = rows.map(([key, value]) => `${key}: ${value}`).join('\n');
    const htmlRows = rows
      .map(([key, value]) => `<tr><th align="left">${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`)
      .join('');

    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: fromAddress,
      to: contactTo,
      replyTo: email,
      subject,
      text: `${text}\n\nSource: Iris & J Holdings website`,
      html: `<h2>${escapeHtml(subject)}</h2><table cellpadding="6" cellspacing="0">${htmlRows}</table><p><strong>Source:</strong> Iris &amp; J Holdings website</p>`,
    });

    // Send the visitor a confirmation. A failure here must not fail the request.
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: 'We received your message — Iris & J Holdings',
        text: `Hi ${name},\n\nThanks for reaching out to Iris & J Holdings. Daiana received your message and will follow up by email soon.\n\nIf your request is time-sensitive, you can call (908) 499-6320.\n\n— Iris & J Holdings`,
        html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for reaching out to Iris &amp; J Holdings. Daiana received your message and will follow up by email soon.</p><p>If your request is time-sensitive, you can call <a href="tel:19084996320">(908) 499-6320</a>.</p><p>— Iris &amp; J Holdings</p>`,
      });
    } catch (confirmError) {
      console.error('Confirmation email failed:', confirmError);
    }

    return res.status(200).json({ message: 'Message sent.' });
  } catch (error) {
    console.error('Contact email failed:', error);
    return res.status(500).json({ message: 'Message could not be sent.' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Iris & J Holdings server listening on ${port}`);
});
