import express from 'express';
import Stripe from 'stripe';
import crypto from 'node:crypto';
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
  icalUrls: process.env.AIRBNB_ICAL_URLS || process.env.AIRBNB_ICAL_URL || '',
  currency: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
  nightlyRateCents: Number(process.env.VACATION_RENTAL_NIGHTLY_RATE_CENTS || 0),
  cleaningFeeCents: Number(process.env.VACATION_RENTAL_CLEANING_FEE_CENTS || 0),
  successUrl: process.env.STRIPE_SUCCESS_URL || '',
  cancelUrl: process.env.STRIPE_CANCEL_URL || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

const notary = {
  currency: (process.env.NOTARY_CURRENCY || process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
  bookingFeeCents: Number(process.env.NOTARY_BOOKING_FEE_CENTS || 0),
  successUrl: process.env.NOTARY_SUCCESS_URL || '',
  cancelUrl: process.env.NOTARY_CANCEL_URL || '',
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
    const session = event.data.object;

    try {
      if (session.metadata?.type === 'notary') {
        await notifyNotaryBookingV2(session);
      } else {
        bookedCache = { at: 0, ranges: [] }; // vacation booking — refresh website/Airbnb availability merge
        await notifyBookingV2(session);
      }
    } catch (notifyError) {
      console.error('Checkout notification failed:', notifyError);
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

function metadataValue(value) {
  return clean(value).slice(0, 500);
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

function buildOrigin(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function managementSecret() {
  return booking.webhookSecret || process.env.MANAGE_BOOKING_SECRET || process.env.STRIPE_SECRET_KEY || 'iris-j-manage-booking';
}

function createManageToken(sessionId) {
  return crypto.createHmac('sha256', managementSecret()).update(sessionId).digest('hex');
}

function verifyManageToken(sessionId, token) {
  if (!sessionId || !token) return false;
  const expected = createManageToken(sessionId);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(clean(token));
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function manageUrl(origin, sessionId) {
  const params = new URLSearchParams({ session_id: sessionId, token: createManageToken(sessionId) });
  return `${origin}/manage-booking?${params.toString()}`;
}

function formatTimeLabel(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(clean(value));
  if (!match) return clean(value);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function summarizeGuestList(primaryGuest, additionalGuests) {
  const lines = [];
  const allGuests = [primaryGuest, ...additionalGuests].filter(Boolean);

  for (const [index, guest] of allGuests.entries()) {
    const label = index === 0 ? 'Primary Guest #1' : `Guest #${index + 1}`;
    const parts = [clean(guest.fullName)];
    if (clean(guest.email)) parts.push(`email: ${clean(guest.email)}`);
    if (clean(guest.phone)) parts.push(`phone: ${clean(guest.phone)}`);
    lines.push(`${label}: ${parts.filter(Boolean).join(' | ')}`);
  }

  return lines.join('\n');
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
    getBlockedRanges(booking.icalUrls),
    getWebsiteBookedRanges(),
  ]);
  return [...airbnb, ...website];
}

async function notifyBooking(session) {
  const { checkIn = '', checkOut = '' } = session.metadata || {};
  const guestEmail = session.customer_details?.email || session.customer_email || session.metadata?.email || '';
  const amount = money(session.amount_total ?? 0, session.currency || 'usd');

  await sendResendEmail({
    to: contactTo,
    subject: `New vacation rental booking — ${checkIn} to ${checkOut}`,
    text: `A vacation rental booking was paid through Stripe.\n\nDates: ${checkIn} to ${checkOut}\nGuest: ${guestEmail || 'unknown'}\nAmount: ${amount}\nStripe session: ${session.id}`,
    html: `<h2>New vacation rental booking</h2><p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}<br><strong>Guest:</strong> ${escapeHtml(guestEmail || 'unknown')}<br><strong>Amount:</strong> ${escapeHtml(amount)}<br><strong>Stripe session:</strong> ${escapeHtml(session.id)}</p>`,
  });

  if (guestEmail) {
    await sendResendEmail({
      to: guestEmail,
      replyTo: contactTo,
      subject: 'Your Orlando vacation rental booking is confirmed',
      text:
        `Hi,\n\n` +
        `Your Orlando vacation rental booking has been paid and received.\n\n` +
        `Dates: ${checkIn} to ${checkOut}\n` +
        `Amount paid: ${amount}\n\n` +
        `A Stripe receipt should arrive separately by email. Daiana will follow up with the booking details, house rules, and check-in information.\n\n` +
        `— Iris & J Holdings`,
      html:
        `<p>Hi,</p>` +
        `<p>Your Orlando vacation rental booking has been paid and received.</p>` +
        `<p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}<br>` +
        `<strong>Amount paid:</strong> ${escapeHtml(amount)}</p>` +
        `<p>A Stripe receipt should arrive separately by email. Daiana will follow up with the booking details, house rules, and check-in information.</p>` +
        `<p>— Iris &amp; J Holdings</p>`,
    });
  }
}

async function notifyNotaryBooking(session) {
  const {
    name = '',
    email = '',
    phone = '',
    city = '',
    appointmentDate = '',
    appointmentTime = '',
    documentType = '',
    notes = '',
  } = session.metadata || {};
  const amount = money(session.amount_total ?? 0, session.currency || 'usd');

  await sendResendEmail({
    to: contactTo,
    replyTo: email || undefined,
    subject: `Paid notary booking fee — ${appointmentDate} at ${appointmentTime}`,
    text:
      `A notary booking fee was paid through Stripe.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `City / Town: ${city}\n` +
      `Preferred date: ${appointmentDate}\n` +
      `Preferred time: ${appointmentTime}\n` +
      `Document type: ${documentType}\n` +
      `Notes: ${notes}\n` +
      `Amount: ${amount}\n` +
      `Stripe session: ${session.id}`,
    html:
      `<h2>Paid notary booking fee</h2>` +
      `<p><strong>Name:</strong> ${escapeHtml(name)}<br>` +
      `<strong>Email:</strong> ${escapeHtml(email)}<br>` +
      `<strong>Phone:</strong> ${escapeHtml(phone)}<br>` +
      `<strong>City / Town:</strong> ${escapeHtml(city)}<br>` +
      `<strong>Preferred date:</strong> ${escapeHtml(appointmentDate)}<br>` +
      `<strong>Preferred time:</strong> ${escapeHtml(appointmentTime)}<br>` +
      `<strong>Document type:</strong> ${escapeHtml(documentType)}<br>` +
      `<strong>Notes:</strong> ${escapeHtml(notes)}<br>` +
      `<strong>Amount:</strong> ${escapeHtml(amount)}<br>` +
      `<strong>Stripe session:</strong> ${escapeHtml(session.id)}</p>`,
  });

  if (email) {
    await sendResendEmail({
      to: email,
      replyTo: contactTo,
      subject: 'Your mobile notary booking fee was received',
      text:
        `Hi ${name || 'there'},\n\n` +
        `Your mobile notary travel / booking fee has been paid and received.\n\n` +
        `Preferred appointment: ${appointmentDate} at ${appointmentTime}\n` +
        `Document type: ${documentType || 'Not provided'}\n` +
        `Amount paid: ${amount}\n\n` +
        `A Stripe receipt should arrive separately by email. Daiana will follow up to confirm the appointment time, service area, signer requirements, and any separate notary fees.\n\n` +
        `Payment does not guarantee that a notarial act can be completed if legal, signer, document, or identification requirements cannot be satisfied.\n\n` +
        `— Iris & J Holdings`,
      html:
        `<p>Hi ${escapeHtml(name || 'there')},</p>` +
        `<p>Your mobile notary travel / booking fee has been paid and received.</p>` +
        `<p><strong>Preferred appointment:</strong> ${escapeHtml(appointmentDate)} at ${escapeHtml(appointmentTime)}<br>` +
        `<strong>Document type:</strong> ${escapeHtml(documentType || 'Not provided')}<br>` +
        `<strong>Amount paid:</strong> ${escapeHtml(amount)}</p>` +
        `<p>A Stripe receipt should arrive separately by email. Daiana will follow up to confirm the appointment time, service area, signer requirements, and any separate notary fees.</p>` +
        `<p>Payment does not guarantee that a notarial act can be completed if legal, signer, document, or identification requirements cannot be satisfied.</p>` +
        `<p>— Iris &amp; J Holdings</p>`,
    });
  }
}

async function notifyBookingV2(session) {
  const {
    checkIn = '',
    checkOut = '',
    email = '',
    primaryName = '',
    primaryPhone = '',
    guestCount = '',
    guestList = '',
    origin = `https://${canonicalHost}`,
  } = session.metadata || {};
  const guestEmail = session.customer_details?.email || session.customer_email || email || '';
  const amount = money(session.amount_total ?? 0, session.currency || 'usd');
  const link = manageUrl(origin, session.id);

  await sendResendEmail({
    to: contactTo,
    subject: `New vacation rental booking - ${checkIn} to ${checkOut}`,
    text:
      `A vacation rental booking was paid through Stripe.\n\n` +
      `Dates: ${checkIn} to ${checkOut}\n` +
      `Primary guest: ${primaryName || 'unknown'}\n` +
      `Email: ${guestEmail || 'unknown'}\n` +
      `Phone: ${primaryPhone || 'Not provided'}\n` +
      `Guest count: ${guestCount || 'unknown'}\n\n` +
      `Guest list:\n${guestList || 'Not provided'}\n\n` +
      `Amount: ${amount}\n` +
      `Manage link: ${link}\n` +
      `Stripe session: ${session.id}`,
    html:
      `<h2>New vacation rental booking</h2>` +
      `<p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}<br>` +
      `<strong>Primary guest:</strong> ${escapeHtml(primaryName || 'unknown')}<br>` +
      `<strong>Email:</strong> ${escapeHtml(guestEmail || 'unknown')}<br>` +
      `<strong>Phone:</strong> ${escapeHtml(primaryPhone || 'Not provided')}<br>` +
      `<strong>Guest count:</strong> ${escapeHtml(guestCount || 'unknown')}<br>` +
      `<strong>Amount:</strong> ${escapeHtml(amount)}<br>` +
      `<strong>Manage link:</strong> <a href="${escapeHtml(link)}">${escapeHtml(link)}</a><br>` +
      `<strong>Stripe session:</strong> ${escapeHtml(session.id)}</p>` +
      `<p><strong>Guest list</strong><br>${escapeHtml(guestList || 'Not provided').replace(/\n/g, '<br>')}</p>`,
  });

  if (!guestEmail) return;

  await sendResendEmail({
    to: guestEmail,
    replyTo: contactTo,
    subject: 'Your Orlando vacation rental booking is confirmed',
    text:
      `Hi ${primaryName || 'there'},\n\n` +
      `Your Orlando vacation rental booking has been paid and received.\n\n` +
      `Dates: ${checkIn} to ${checkOut}\n` +
      `Amount paid: ${amount}\n\n` +
      `A Stripe receipt should arrive separately by email.\n` +
      `Manage your booking here: ${link}\n\n` +
      `Date changes and cancellation requests are reviewed manually and are not confirmed automatically.\n\n` +
      `- Iris & J Holdings`,
    html:
      `<p>Hi ${escapeHtml(primaryName || 'there')},</p>` +
      `<p>Your Orlando vacation rental booking has been paid and received.</p>` +
      `<p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}<br>` +
      `<strong>Amount paid:</strong> ${escapeHtml(amount)}</p>` +
      `<p>A Stripe receipt should arrive separately by email.</p>` +
      `<p><a href="${escapeHtml(link)}">Request a cancellation or date change</a></p>` +
      `<p>Date changes and cancellation requests are reviewed manually and are not confirmed automatically.</p>` +
      `<p>- Iris &amp; J Holdings</p>`,
  });
}

async function notifyNotaryBookingV2(session) {
  const {
    name = '',
    email = '',
    phone = '',
    city = '',
    appointmentDate = '',
    appointmentTime = '',
    documentType = '',
    notes = '',
    origin = `https://${canonicalHost}`,
  } = session.metadata || {};
  const amount = money(session.amount_total ?? 0, session.currency || 'usd');
  const formattedTime = formatTimeLabel(appointmentTime);
  const link = manageUrl(origin, session.id);

  await sendResendEmail({
    to: contactTo,
    replyTo: email || undefined,
    subject: `Paid notary booking fee - ${appointmentDate} at ${formattedTime}`,
    text:
      `A notary booking fee was paid through Stripe.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `City / Town: ${city}\n` +
      `Preferred date: ${appointmentDate}\n` +
      `Preferred time: ${formattedTime}\n` +
      `Document type: ${documentType}\n` +
      `Notes: ${notes}\n` +
      `Amount: ${amount}\n` +
      `Manage link: ${link}\n` +
      `Stripe session: ${session.id}`,
    html:
      `<h2>Paid notary booking fee</h2>` +
      `<p><strong>Name:</strong> ${escapeHtml(name)}<br>` +
      `<strong>Email:</strong> ${escapeHtml(email)}<br>` +
      `<strong>Phone:</strong> ${escapeHtml(phone)}<br>` +
      `<strong>City / Town:</strong> ${escapeHtml(city)}<br>` +
      `<strong>Preferred date:</strong> ${escapeHtml(appointmentDate)}<br>` +
      `<strong>Preferred time:</strong> ${escapeHtml(formattedTime)}<br>` +
      `<strong>Document type:</strong> ${escapeHtml(documentType)}<br>` +
      `<strong>Notes:</strong> ${escapeHtml(notes)}<br>` +
      `<strong>Amount:</strong> ${escapeHtml(amount)}<br>` +
      `<strong>Manage link:</strong> <a href="${escapeHtml(link)}">${escapeHtml(link)}</a><br>` +
      `<strong>Stripe session:</strong> ${escapeHtml(session.id)}</p>`,
  });

  if (!email) return;

  await sendResendEmail({
    to: email,
    replyTo: contactTo,
    subject: 'Your mobile notary booking fee was received',
    text:
      `Hi ${name || 'there'},\n\n` +
      `Your mobile notary travel / booking fee has been paid and received.\n\n` +
      `Preferred appointment: ${appointmentDate} at ${formattedTime}\n` +
      `Document type: ${documentType || 'Not provided'}\n` +
      `Amount paid: ${amount}\n\n` +
      `A Stripe receipt should arrive separately by email.\n` +
      `Request a cancellation or schedule change here: ${link}\n\n` +
      `Daiana will follow up to confirm the appointment time, service area, signer requirements, and any separate notary fees.\n\n` +
      `Payment does not guarantee that a notarial act can be completed if legal, signer, document, or identification requirements cannot be satisfied.\n\n` +
      `- Iris & J Holdings`,
    html:
      `<p>Hi ${escapeHtml(name || 'there')},</p>` +
      `<p>Your mobile notary travel / booking fee has been paid and received.</p>` +
      `<p><strong>Preferred appointment:</strong> ${escapeHtml(appointmentDate)} at ${escapeHtml(formattedTime)}<br>` +
      `<strong>Document type:</strong> ${escapeHtml(documentType || 'Not provided')}<br>` +
      `<strong>Amount paid:</strong> ${escapeHtml(amount)}</p>` +
      `<p>A Stripe receipt should arrive separately by email.</p>` +
      `<p><a href="${escapeHtml(link)}">Request a cancellation or schedule change</a></p>` +
      `<p>Daiana will follow up to confirm the appointment time, service area, signer requirements, and any separate notary fees.</p>` +
      `<p>Payment does not guarantee that a notarial act can be completed if legal, signer, document, or identification requirements cannot be satisfied.</p>` +
      `<p>- Iris &amp; J Holdings</p>`,
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
    airbnbSyncEnabled: Boolean(booking.icalUrls),
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
    const primaryGuest = req.body?.primaryGuest && typeof req.body.primaryGuest === 'object' ? req.body.primaryGuest : {};
    const additionalGuestsRaw = Array.isArray(req.body?.additionalGuests) ? req.body.additionalGuests : [];
    const additionalGuests = additionalGuestsRaw.slice(0, 9).map((guest) => ({
      fullName: clean(guest?.fullName),
      email: clean(guest?.email),
      phone: clean(guest?.phone),
    }));
    const primaryName = clean(primaryGuest?.fullName);
    const email = clean(primaryGuest?.email);
    const primaryPhone = clean(primaryGuest?.phone);
    const houseRulesAgreed = Boolean(req.body?.houseRulesAgreed);
    const termsAgreed = Boolean(req.body?.termsAgreed);

    if (!primaryName || !email || !primaryPhone) {
      return res.status(400).json({ message: 'Primary Guest #1 must include full name, email, and phone number.' });
    }
    if (additionalGuests.some((guest) => !guest.fullName)) {
      return res.status(400).json({ message: 'Each added guest must include a full name.' });
    }
    if (!houseRulesAgreed || !termsAgreed) {
      return res.status(400).json({ message: 'You must agree to the terms, house rules, and cancellation policy before checkout.' });
    }

    const stay = validateStay(checkIn, checkOut);
    if (!stay.ok) {
      return res.status(400).json({ message: stay.message });
    }

    const blocked = await getAllBlockedRanges();
    if (overlapsBlocked(checkIn, checkOut, blocked)) {
      return res.status(409).json({ message: 'Some of those nights are no longer available. Please choose different dates.' });
    }

    const origin = buildOrigin(req);
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

    const guestList = summarizeGuestList({ fullName: primaryName, email, phone: primaryPhone }, additionalGuests);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: booking.successUrl || `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: booking.cancelUrl || `${origin}/vacation-rentals`,
      customer_email: email,
      payment_intent_data: { receipt_email: email },
      metadata: {
        type: 'vacation',
        origin: metadataValue(origin),
        checkIn,
        checkOut,
        nights: String(stay.nights),
        email: metadataValue(email),
        primaryName: metadataValue(primaryName),
        primaryPhone: metadataValue(primaryPhone),
        guestCount: String(additionalGuests.length + 1),
        guestList: metadataValue(guestList),
        houseRulesAgreed: 'true',
        termsAgreed: 'true',
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout failed:', error);
    return res.status(500).json({ message: 'Could not start checkout. Please try again.' });
  }
});

app.post('/api/notary-checkout', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Online payment is not available yet. Please send the request instead.' });
    }

    if (!(notary.bookingFeeCents > 0)) {
      return res.status(503).json({ message: 'Notary booking fee is not configured yet.' });
    }

    const name = clean(req.body?.name);
    const email = clean(req.body?.email);
    const phone = clean(req.body?.phone);
    const city = clean(req.body?.city);
    const appointmentDate = clean(req.body?.appointmentDate);
    const appointmentTime = clean(req.body?.appointmentTime);
    const documentType = clean(req.body?.documentType);
    const notes = clean(req.body?.notes);

    if (!name || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Name, email, preferred date, and preferred time are required.' });
    }

    if (!/^([0][9]|1[0-7]):(00|15|30|45)$|^18:00$/.test(appointmentTime)) {
      return res.status(400).json({ message: 'Preferred time must be between 9:00 AM and 6:00 PM in 15-minute increments.' });
    }

    const origin = buildOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: notary.currency,
            unit_amount: notary.bookingFeeCents,
            product_data: {
              name: 'Mobile notary travel / booking fee',
              description: `${appointmentDate} at ${appointmentTime}`,
            },
          },
        },
      ],
      success_url: notary.successUrl || `${origin}/notary-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: notary.cancelUrl || `${origin}/mobile-notary`,
      customer_email: email,
      payment_intent_data: { receipt_email: email },
      metadata: {
        type: 'notary',
        origin: metadataValue(origin),
        name: metadataValue(name),
        email: metadataValue(email),
        phone: metadataValue(phone),
        city: metadataValue(city),
        appointmentDate: metadataValue(appointmentDate),
        appointmentTime: metadataValue(appointmentTime),
        documentType: metadataValue(documentType),
        notes: metadataValue(notes),
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Notary checkout failed:', error);
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
      type: session.metadata?.type || 'vacation',
      checkIn: session.metadata?.checkIn || '',
      checkOut: session.metadata?.checkOut || '',
      email: session.customer_details?.email || session.customer_email || session.metadata?.email || '',
      name: session.metadata?.name || '',
      phone: session.metadata?.phone || '',
      city: session.metadata?.city || '',
      appointmentDate: session.metadata?.appointmentDate || '',
      appointmentTime: session.metadata?.appointmentTime || '',
      documentType: session.metadata?.documentType || '',
    });
  } catch (error) {
    console.error('Checkout session lookup failed:', error);
    return res.status(404).json({ message: 'Booking not found.' });
  }
});

app.get('/api/manage-booking-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Not available.' });
    }

    const sessionId = clean(req.query?.session_id);
    const token = clean(req.query?.token);
    if (!verifyManageToken(sessionId, token)) {
      return res.status(403).json({ message: 'Invalid booking link.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return res.json({
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      type: session.metadata?.type || 'vacation',
      checkIn: session.metadata?.checkIn || '',
      checkOut: session.metadata?.checkOut || '',
      email: session.customer_details?.email || session.customer_email || session.metadata?.email || '',
      name: session.metadata?.name || session.metadata?.primaryName || '',
      appointmentDate: session.metadata?.appointmentDate || '',
      appointmentTime: session.metadata?.appointmentTime ? formatTimeLabel(session.metadata.appointmentTime) : '',
      documentType: session.metadata?.documentType || '',
    });
  } catch (error) {
    console.error('Manage booking session lookup failed:', error);
    return res.status(404).json({ message: 'Booking not found.' });
  }
});

app.post('/api/manage-booking-request', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ message: 'Not available.' });
    }

    const sessionId = clean(req.body?.sessionId);
    const token = clean(req.body?.token);
    if (!verifyManageToken(sessionId, token)) {
      return res.status(403).json({ message: 'Invalid booking link.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const requestType = clean(req.body?.action);
    const newDate = clean(req.body?.newDate);
    const newTime = clean(req.body?.newTime);
    const newCheckIn = clean(req.body?.newCheckIn);
    const newCheckOut = clean(req.body?.newCheckOut);
    const message = clean(req.body?.message);
    const bookingType = session.metadata?.type || 'vacation';
    const requesterEmail = session.customer_details?.email || session.customer_email || session.metadata?.email || '';
    const requesterName = session.metadata?.name || session.metadata?.primaryName || 'Guest';
    const origin = session.metadata?.origin || `https://${canonicalHost}`;
    const link = manageUrl(origin, sessionId);

    if (!requestType) {
      return res.status(400).json({ message: 'Request type is required.' });
    }
    if (bookingType === 'notary' && requestType === 'reschedule' && !newDate && !newTime) {
      return res.status(400).json({ message: 'Add a new date, a new time, or both.' });
    }
    if (bookingType === 'vacation' && requestType === 'change-dates' && (!newCheckIn || !newCheckOut)) {
      return res.status(400).json({ message: 'Add both the requested new check-in and check-out dates.' });
    }

    const currentBooking = bookingType === 'notary'
      ? `${session.metadata?.appointmentDate || ''} at ${formatTimeLabel(session.metadata?.appointmentTime || '')}`
      : `${session.metadata?.checkIn || ''} to ${session.metadata?.checkOut || ''}`;

    await sendResendEmail({
      to: contactTo,
      replyTo: requesterEmail || undefined,
      subject: `${bookingType === 'notary' ? 'Notary' : 'Vacation'} booking change request - ${requestType}`,
      text:
        `A booking management request was submitted.\n\n` +
        `Type: ${bookingType}\n` +
        `Request: ${requestType}\n` +
        `Current booking: ${currentBooking}\n` +
        `Name: ${requesterName}\n` +
        `Email: ${requesterEmail || 'unknown'}\n` +
        `${newDate ? `Requested new date: ${newDate}\n` : ''}` +
        `${newTime ? `Requested new time: ${formatTimeLabel(newTime)}\n` : ''}` +
        `${newCheckIn ? `Requested check-in: ${newCheckIn}\n` : ''}` +
        `${newCheckOut ? `Requested check-out: ${newCheckOut}\n` : ''}` +
        `Message: ${message || 'None'}\n` +
        `Manage link: ${link}\n` +
        `Stripe session: ${sessionId}`,
      html:
        `<h2>Booking management request</h2>` +
        `<p><strong>Type:</strong> ${escapeHtml(bookingType)}<br>` +
        `<strong>Request:</strong> ${escapeHtml(requestType)}<br>` +
        `<strong>Current booking:</strong> ${escapeHtml(currentBooking)}<br>` +
        `<strong>Name:</strong> ${escapeHtml(requesterName)}<br>` +
        `<strong>Email:</strong> ${escapeHtml(requesterEmail || 'unknown')}<br>` +
        `${newDate ? `<strong>Requested new date:</strong> ${escapeHtml(newDate)}<br>` : ''}` +
        `${newTime ? `<strong>Requested new time:</strong> ${escapeHtml(formatTimeLabel(newTime))}<br>` : ''}` +
        `${newCheckIn ? `<strong>Requested check-in:</strong> ${escapeHtml(newCheckIn)}<br>` : ''}` +
        `${newCheckOut ? `<strong>Requested check-out:</strong> ${escapeHtml(newCheckOut)}<br>` : ''}` +
        `<strong>Message:</strong> ${escapeHtml(message || 'None')}<br>` +
        `<strong>Manage link:</strong> <a href="${escapeHtml(link)}">${escapeHtml(link)}</a><br>` +
        `<strong>Stripe session:</strong> ${escapeHtml(sessionId)}</p>`,
    });

    if (requesterEmail) {
      await sendResendEmail({
        to: requesterEmail,
        replyTo: contactTo,
        subject: 'We received your booking change request',
        text:
          `Hi ${requesterName || 'there'},\n\n` +
          `We received your ${requestType} request for ${currentBooking}.\n` +
          `Daiana will review it and follow up by email.\n\n` +
          `Manage link: ${link}\n\n` +
          `- Iris & J Holdings`,
        html:
          `<p>Hi ${escapeHtml(requesterName || 'there')},</p>` +
          `<p>We received your ${escapeHtml(requestType)} request for ${escapeHtml(currentBooking)}.</p>` +
          `<p>Daiana will review it and follow up by email.</p>` +
          `<p><a href="${escapeHtml(link)}">View your booking request page</a></p>` +
          `<p>- Iris &amp; J Holdings</p>`,
      });
    }

    return res.status(200).json({ message: 'Request sent.' });
  } catch (error) {
    console.error('Manage booking request failed:', error);
    return res.status(500).json({ message: 'Could not send the request.' });
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

    const rows = Object.entries(fields || {})
      .filter(([key]) => !key.startsWith('_'))
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
