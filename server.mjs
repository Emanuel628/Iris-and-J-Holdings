import express from 'express';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import Stripe from 'stripe';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { getBlockedRanges, overlapsBlocked } from './server/airbnb.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
const app = express();
const port = Number(process.env.PORT || 8080);
const contactTo = process.env.CONTACT_TO_EMAIL || 'listingsbyd@gmail.com';
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL || 'Iris & J Holdings <onboarding@resend.dev>';
const canonicalHost = 'www.irisjholdings.com';
const apexHost = 'irisjholdings.com';
const sessionCookieName = 'ijh_admin_session';
const databaseUrl = process.env.DATABASE_URL || '';
const adminSessionDays = Number(process.env.ADMIN_SESSION_DAYS || 14);
const secureCookies = process.env.NODE_ENV === 'production';
const rentcastApiKey = process.env.RENTCAST_API_KEY || '';
const RENTCAST_MONTHLY_FREE_LIMIT = 50;
const RENTCAST_OVERAGE_COST_USD = 0.2;
const RENTCAST_INITIAL_USED_THIS_MONTH = 3;
const siteUrl = 'https://www.irisjholdings.com';
const defaultSeoImage = `${siteUrl}/images/site/contact-hero.jpg`;

const notaryFaqSeo = [
  ['Which areas do you serve?', 'Primarily Union, Middlesex, and Essex Counties, with additional areas available by request based on distance and scheduling.'],
  ['What should I have ready before the appointment?', 'Share the city, document type, number of signers, your preferred time, and any notes. Bring a valid, unexpired government-issued photo ID for every signer, and leave documents unsigned until we meet.'],
  ['Is a fee required to book?', 'Yes. The travel or booking fee is paid through secure checkout when you submit the request. Notary fees are separate and depend on the document type and number of notarizations. Daiana confirms the details by email.'],
  ['What types of documents can you notarize?', 'General notarizations, real estate documents, affidavits, and consent forms, among others. Share the document type when booking so Daiana can confirm.'],
];

const vacationFaqSeo = [
  ['Where is the rental located?', 'In the Orlando and Central Florida area, close to the major theme parks. The exact address is shared after booking.'],
  ['How do I book?', 'Pick your dates on the availability calendar, continue to the guest intake page, review the house rules, and check out securely. A stay is confirmed after payment is completed and a booking confirmation is issued by email.'],
  ['What is included in the price?', 'The nightly rate plus a one-time cleaning fee is shown on the calendar before checkout. Any additional property-specific terms, fees, or house rules are confirmed before booking.'],
  ['Have a question before booking?', 'Use the question form on the page and Daiana will get back to you by email about dates, the property, or anything else.'],
];

const publicSeoRoutes = {
  '/': {
    title: 'Iris & J Holdings | New Jersey Real Estate, Mobile Notary & Orlando Rentals',
    description: 'Iris & J Holdings helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex, and Essex Counties, and provides Orlando vacation rental booking.',
    image: `${siteUrl}/images/site/contact-hero.jpg`,
    breadcrumb: 'Home',
  },
  '/buy': {
    title: 'Buy a Home in New Jersey | Iris & J Holdings',
    description: 'Buyer consultation and home search guidance in New Jersey, including budget review, pre-approval, offers, inspections, attorney review, and closing next steps.',
    image: `${siteUrl}/images/site/buy-hero.jpg`,
    breadcrumb: 'Buy',
  },
  '/sell': {
    title: 'Sell Your Home in New Jersey | Iris & J Holdings',
    description: 'Seller strategy guidance in New Jersey for pricing, preparation, marketing, negotiation, attorney review, and closing through All Star Real Estate Agency.',
    image: `${siteUrl}/images/site/sell-hero.jpg`,
    breadcrumb: 'Sell',
  },
  '/home-value': {
    title: 'New Jersey Home Value Review | Iris & J Holdings',
    description: 'Request a New Jersey home value review using recent comparable sales, nearby listings, condition, updates, and local market activity. Not a formal appraisal.',
    image: `${siteUrl}/images/site/home-value-hero.jpg`,
    breadcrumb: 'Home Value',
  },
  '/mobile-notary': {
    title: 'Mobile Notary in Union, Middlesex and Essex Counties | Iris & J Holdings',
    description: 'Mobile notary appointments for Union County, Middlesex County, and Essex County, NJ, including general notarizations, real estate documents, affidavits, and consent forms.',
    image: `${siteUrl}/images/site/notary-hero.jpg`,
    breadcrumb: 'Mobile Notary',
  },
  '/resources': {
    title: 'Real Estate Resources for NJ Buyers and Sellers | Iris & J Holdings',
    description: 'Plain-language New Jersey buyer guides, seller guides, and local market updates for people preparing to buy, sell, or request a home value review.',
    image: `${siteUrl}/images/site/contact-hero.jpg`,
    breadcrumb: 'Resources',
  },
  '/about': {
    title: 'About Daiana Castro, REALTOR | Iris & J Holdings',
    description: 'Meet Daiana Castro, REALTOR and mobile notary serving New Jersey buyers, sellers, and notary clients through Iris & J Holdings and All Star Real Estate Agency.',
    image: `${siteUrl}/images/site/daiana-portrait.jpg`,
    breadcrumb: 'About',
  },
  '/book': {
    title: 'Book a Consultation or Notary Appointment | Iris & J Holdings',
    description: 'Contact Daiana Castro to schedule a New Jersey buyer consultation, seller strategy call, home value review, mobile notary appointment, or general question.',
    image: `${siteUrl}/images/site/contact-hero.jpg`,
    breadcrumb: 'Book',
  },
  '/contact': {
    title: 'Book a Consultation or Notary Appointment | Iris & J Holdings',
    description: 'Contact Daiana Castro to schedule a New Jersey buyer consultation, seller strategy call, home value review, mobile notary appointment, or general question.',
    image: `${siteUrl}/images/site/contact-hero.jpg`,
    breadcrumb: 'Book',
    canonicalPath: '/book',
  },
  '/vacation-rentals': {
    title: 'Orlando Vacation Rental Near Theme Parks | Iris & J Holdings',
    description: 'Check availability and book an Orlando vacation rental in Central Florida near major theme parks with secure checkout, amenities, FAQs, and booking questions.',
    image: `${siteUrl}/images/site/vacation-hero.jpg`,
    breadcrumb: 'Vacation Rentals',
  },
  '/refund-cancellation-policy': {
    title: 'Refund and Cancellation Policy | Iris & J Holdings',
    description: 'Refund, cancellation, rescheduling, and no-show policy for Iris & J Holdings mobile notary booking fees and Orlando vacation rental bookings.',
    image: defaultSeoImage,
    breadcrumb: 'Refund and Cancellation Policy',
  },
  '/privacy': {
    title: 'Privacy Policy | Iris & J Holdings',
    description: 'Privacy Policy for Iris & J Holdings, including website forms, contact requests, mobile notary appointment requests, home value requests, and vacation rental inquiries.',
    image: defaultSeoImage,
    breadcrumb: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms of Use | Iris & J Holdings',
    description: 'Terms of Use for Iris & J Holdings, including real estate service disclosures, mobile notary notices, vacation rental terms, and website use rules.',
    image: defaultSeoImage,
    breadcrumb: 'Terms of Use',
  },
  '/accessibility': {
    title: 'Accessibility and Fair Housing | Iris & J Holdings',
    description: 'Accessibility statement and fair housing commitment for Iris & J Holdings and real estate services provided through All Star Real Estate Agency in New Jersey.',
    image: defaultSeoImage,
    breadcrumb: 'Accessibility and Fair Housing',
  },
  '/house-rules': {
    title: 'Vacation Rental House Rules | Iris & J Holdings',
    description: 'House rules for Orlando vacation rental bookings through Iris & J Holdings, including occupancy, parking, quiet hours, and guest list requirements.',
    image: `${siteUrl}/images/site/vacation-hero.jpg`,
    breadcrumb: 'House Rules',
  },
};

const pgPool = databaseUrl ? new pg.Pool({ connectionString: databaseUrl, ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false } }) : null;

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
        await persistNotaryRequest(session);
        await notifyNotaryBookingV2(session);
      } else if (session.metadata?.type === 'invoice') {
        await markInvoicePaidFromSession(session);
      } else {
        bookedCache = { at: 0, ranges: [] }; // vacation booking - refresh website/Airbnb availability merge
        await persistVacationBooking(session);
        await notifyBookingV2(session);
      }
    } catch (notifyError) {
      console.error('Checkout notification failed:', notifyError);
    }
  }

  return res.json({ received: true });
});

app.post('/api/admin/upload-image', express.raw({ type: () => true, limit: '40mb' }), async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const filename = clean(req.query?.filename || req.headers['x-upload-filename']) || 'image';
    const contentType = clean(req.headers['content-type'] || '').toLowerCase();
    const extension = extensionFromMime(contentType) || filename.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'heic', 'heif']);

    if ((!contentType.startsWith('image/') && contentType !== 'application/octet-stream') || !allowedExtensions.has(extension)) {
      return res.status(400).json({ message: 'Supported image types include PNG, JPG, JPEG, WebP, GIF, SVG, AVIF, HEIC, and HEIF.' });
    }
    if (!Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ message: 'Image file data is missing.' });
    }

    const stem = slugify(filename.replace(/\.[a-z0-9]+$/i, '')) || 'image';
    const normalizedExtension = extension === 'jpeg' ? 'jpg' : extension;
    const uniqueName = `${Date.now()}-${randomBytes(6).toString('hex')}-${stem}.${normalizedExtension}`;
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, uniqueName), req.body);

    return res.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error('Admin image upload failed:', error);
    return res.status(500).json({ message: 'Could not upload image.' });
  }
});

app.use(express.json({ limit: '25mb' }));

// Simple in-memory rate limit for the public contact endpoint.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
const rateHits = new Map();
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 5;
const adminLoginHits = new Map();

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

function adminLoginKey(ip, email) {
  return `${clean(ip || 'unknown')}::${clean(email || '').toLowerCase() || 'unknown'}`;
}

function pruneAttemptMap(store, windowMs) {
  const now = Date.now();
  if (store.size <= 5000) return;
  for (const [key, value] of store) {
    if (now - value.start > windowMs) {
      store.delete(key);
    }
  }
}

function isAdminLoginRateLimited(ip, email) {
  const key = adminLoginKey(ip, email);
  const now = Date.now();
  const entry = adminLoginHits.get(key);

  if (!entry || now - entry.start > ADMIN_LOGIN_WINDOW_MS) {
    return false;
  }

  return entry.count >= ADMIN_LOGIN_MAX_ATTEMPTS;
}

function recordAdminLoginFailure(ip, email) {
  const key = adminLoginKey(ip, email);
  const now = Date.now();
  const entry = adminLoginHits.get(key);

  if (!entry || now - entry.start > ADMIN_LOGIN_WINDOW_MS) {
    adminLoginHits.set(key, { start: now, count: 1 });
    pruneAttemptMap(adminLoginHits, ADMIN_LOGIN_WINDOW_MS);
    return;
  }

  entry.count += 1;
}

function clearAdminLoginFailures(ip, email) {
  adminLoginHits.delete(adminLoginKey(ip, email));
}

function clean(value) {
  return String(value ?? '').trim();
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCookies(req) {
  const header = String(req.headers.cookie || '');
  const cookies = {};
  for (const pair of header.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly !== false) parts.push('HttpOnly');
  parts.push('Path=/');
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.secure) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0, secure: secureCookies });
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

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function normalizedSeoPath(pathname) {
  const cleaned = clean(pathname || '/');
  if (!cleaned || cleaned === '/') return '/';
  return cleaned.replace(/\/+$/, '') || '/';
}

function pageTypeForPath(pathname) {
  if (pathname === '/about') return 'AboutPage';
  if (pathname === '/book' || pathname === '/contact') return 'ContactPage';
  if (pathname === '/resources') return 'CollectionPage';
  return 'WebPage';
}

function canonicalPathForSeo(pathname) {
  const route = publicSeoRoutes[pathname];
  return route?.canonicalPath || pathname;
}

function breadcrumbSchema(pathname, label) {
  if (pathname === '/') return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: label,
        item: `${siteUrl}${canonicalPathForSeo(pathname)}`,
      },
    ],
  };
}

function faqSchema(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

function serviceSchema(pathname) {
  if (pathname === '/buy') {
    return {
      '@type': 'Service',
      name: 'New Jersey Buyer Consultation',
      serviceType: 'Real estate buyer consultation',
      areaServed: 'New Jersey',
      provider: { '@id': `${siteUrl}/#organization` },
    };
  }
  if (pathname === '/sell') {
    return {
      '@type': 'Service',
      name: 'New Jersey Seller Strategy',
      serviceType: 'Real estate seller consultation',
      areaServed: 'New Jersey',
      provider: { '@id': `${siteUrl}/#organization` },
    };
  }
  if (pathname === '/home-value') {
    return {
      '@type': 'Service',
      name: 'New Jersey Home Value Review',
      serviceType: 'Home value estimate and comparative market review',
      areaServed: 'New Jersey',
      provider: { '@id': `${siteUrl}/#organization` },
    };
  }
  if (pathname === '/mobile-notary') {
    return {
      '@type': 'Service',
      name: 'Mobile Notary Service',
      serviceType: 'Mobile notary',
      areaServed: ['Union County, NJ', 'Middlesex County, NJ', 'Essex County, NJ'],
      provider: { '@id': `${siteUrl}/#organization` },
    };
  }
  if (pathname === '/vacation-rentals') {
    return {
      '@type': 'Service',
      name: 'Orlando Vacation Rental Booking',
      serviceType: 'Vacation rental accommodations',
      areaServed: 'Orlando, FL',
      provider: { '@id': `${siteUrl}/#organization` },
    };
  }
  return null;
}

function baseStructuredData() {
  return [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'Iris & J Holdings',
      url: `${siteUrl}/`,
      description: 'New Jersey real estate guidance, mobile notary appointments, and Orlando vacation rental booking.',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Iris & J Holdings',
      url: `${siteUrl}/`,
      telephone: '+1-908-499-6320',
      email: 'listingsbyd@gmail.com',
      image: `${siteUrl}/images/site/daiana-portrait.jpg`,
      description: 'Marketing site for New Jersey real estate services provided by Daiana Castro through All Star Real Estate Agency, plus mobile notary services and Orlando vacation rentals through Iris & J Holdings.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1416B Morris Ave',
        addressLocality: 'Union',
        addressRegion: 'NJ',
        postalCode: '07083',
        addressCountry: 'US',
      },
      areaServed: ['New Jersey', 'Union County, NJ', 'Middlesex County, NJ', 'Essex County, NJ', 'Orlando, FL'],
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#daiana-castro`,
      name: 'Daiana Castro',
      jobTitle: 'REALTOR and Mobile Notary',
      telephone: '+1-908-499-6320',
      email: 'listingsbyd@gmail.com',
      image: `${siteUrl}/images/site/daiana-portrait.jpg`,
      worksFor: {
        '@type': 'RealEstateAgent',
        name: 'All Star Real Estate Agency',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1416B Morris Ave',
          addressLocality: 'Union',
          addressRegion: 'NJ',
          postalCode: '07083',
          addressCountry: 'US',
        },
        telephone: '+1-908-964-5005',
      },
    },
  ];
}

function structuredDataForPath(pathname, seo) {
  const graph = baseStructuredData();
  graph.push({
    '@type': pageTypeForPath(pathname),
    '@id': `${siteUrl}${canonicalPathForSeo(pathname)}#webpage`,
    url: `${siteUrl}${canonicalPathForSeo(pathname)}`,
    name: seo.title,
    description: seo.description,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#organization` },
    primaryImageOfPage: seo.image,
  });

  const breadcrumb = breadcrumbSchema(pathname, seo.breadcrumb || 'Page');
  if (breadcrumb) graph.push(breadcrumb);

  const service = serviceSchema(pathname);
  if (service) graph.push(service);

  if (pathname === '/mobile-notary') {
    graph.push(faqSchema(notaryFaqSeo));
  } else if (pathname === '/vacation-rentals') {
    graph.push(faqSchema(vacationFaqSeo));
  } else if (pathname === '/about') {
    graph.push({
      '@type': 'ProfilePage',
      mainEntity: { '@id': `${siteUrl}/#daiana-castro` },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, hashed] = String(stored || '').split(':');
  if (!salt || !hashed) return false;
  const derived = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(derived), Buffer.from(hashed));
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function passwordResetUrl(origin, token) {
  return `${origin}/admin/reset-password?token=${encodeURIComponent(token)}`;
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

async function ensureAdminTables() {
  if (!pgPool) return;
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id SERIAL PRIMARY KEY,
      admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
      id SERIAL PRIMARY KEY,
      admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS admin_email_change_tokens (
      id SERIAL PRIMARY KEY,
      admin_user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      new_email TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS rentals (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      location_label TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      nightly_rate_cents INTEGER NOT NULL DEFAULT 0,
      cleaning_fee_cents INTEGER NOT NULL DEFAULT 0,
      max_guests INTEGER NOT NULL DEFAULT 10,
      hero_image_url TEXT NOT NULL DEFAULT '',
      hero_image_captions JSONB NOT NULL DEFAULT '[]'::jsonb,
      gallery_image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      gallery_image_captions JSONB NOT NULL DEFAULT '[]'::jsonb,
      amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`ALTER TABLE rentals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`);
  await pgPool.query(`ALTER TABLE rentals ADD COLUMN IF NOT EXISTS hero_image_captions JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  await pgPool.query(`ALTER TABLE rentals ADD COLUMN IF NOT EXISTS gallery_image_captions JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS blocked_dates (
      id SERIAL PRIMARY KEY,
      rental_id INTEGER NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id SERIAL PRIMARY KEY,
      page_key TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      hero_image_url TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS vacation_bookings (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT NOT NULL UNIQUE,
      rental_id INTEGER REFERENCES rentals(id) ON DELETE SET NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL DEFAULT '',
      guest_count INTEGER NOT NULL DEFAULT 1,
      guest_list_text TEXT NOT NULL DEFAULT '',
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      amount_total_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'paid',
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`ALTER TABLE vacation_bookings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS notary_requests (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      appointment_date DATE NOT NULL,
      appointment_time TEXT NOT NULL,
      document_type TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      amount_total_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'paid',
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`ALTER TABLE notary_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS admin_invoices (
      id SERIAL PRIMARY KEY,
      service_type TEXT NOT NULL,
      recipient_name TEXT NOT NULL DEFAULT '',
      recipient_email TEXT NOT NULL DEFAULT '',
      recipient_phone TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      amount_total_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'draft',
      rental_id INTEGER REFERENCES rentals(id) ON DELETE SET NULL,
      check_in DATE,
      check_out DATE,
      guest_count INTEGER NOT NULL DEFAULT 1,
      guest_list_text TEXT NOT NULL DEFAULT '',
      appointment_date DATE,
      appointment_time TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      document_type TEXT NOT NULL DEFAULT '',
      stripe_session_id TEXT UNIQUE,
      stripe_checkout_url TEXT NOT NULL DEFAULT '',
      vacation_booking_id INTEGER REFERENCES vacation_bookings(id) ON DELETE SET NULL,
      notary_request_id INTEGER REFERENCES notary_requests(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`ALTER TABLE admin_invoices ALTER COLUMN stripe_session_id DROP NOT NULL;`).catch(() => undefined);
  await pgPool.query(`ALTER TABLE admin_invoices ALTER COLUMN stripe_session_id DROP DEFAULT;`).catch(() => undefined);
  await pgPool.query(`UPDATE admin_invoices SET stripe_session_id = NULL WHERE stripe_session_id = '';`).catch(() => undefined);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS buyer_leads (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      target_areas TEXT NOT NULL DEFAULT '',
      budget_min INTEGER NOT NULL DEFAULT 0,
      budget_max INTEGER NOT NULL DEFAULT 0,
      timeline TEXT NOT NULL DEFAULT '',
      financing_status TEXT NOT NULL DEFAULT '',
      approval_status TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    ALTER TABLE buyer_leads
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT '';
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS seller_leads (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      property_address TEXT NOT NULL DEFAULT '',
      target_price INTEGER NOT NULL DEFAULT 0,
      timeline TEXT NOT NULL DEFAULT '',
      occupancy_status TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS home_value_estimates (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL DEFAULT '',
      subject_address TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      state TEXT NOT NULL DEFAULT '',
      zip_code TEXT NOT NULL DEFAULT '',
      property_type TEXT NOT NULL DEFAULT '',
      bedrooms NUMERIC NOT NULL DEFAULT 0,
      bathrooms NUMERIC NOT NULL DEFAULT 0,
      square_footage INTEGER NOT NULL DEFAULT 0,
      estimated_value NUMERIC NOT NULL DEFAULT 0,
      low_range NUMERIC NOT NULL DEFAULT 0,
      high_range NUMERIC NOT NULL DEFAULT 0,
      result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await seedControlCenterData();
}

async function seedControlCenterData() {
  if (!pgPool) return;
  const settings = await readAppSettings();
  if (settings.initial_rental_seeded !== 'true') {
    await pgPool.query(
      `INSERT INTO rentals (slug, title, location_label, description, nightly_rate_cents, cleaning_fee_cents, max_guests)
       VALUES ('orlando-vacation-rental', 'Orlando Vacation Rental', 'Orlando / Central Florida', 'Primary Orlando vacation rental listing.', $1, $2, 10)
       ON CONFLICT (slug) DO NOTHING`,
      [booking.nightlyRateCents, booking.cleaningFeeCents],
    );
    await upsertAppSetting('initial_rental_seeded', 'true');
  }
  const defaultPages = [
    ['home', 'Home'],
    ['buy', 'Buy'],
    ['sell', 'Sell'],
    ['home-value', 'Home Value'],
    ['book', 'Book / Contact'],
    ['about', 'About'],
    ['resources', 'Resources'],
    ['terms', 'Terms & Conditions'],
    ['privacy', 'Privacy Policy'],
    ['accessibility', 'Accessibility & Fair Housing'],
    ['house-rules', 'House Rules'],
    ['refund-cancellation-policy', 'Refund & Cancellation Policy'],
    ['mobile-notary', 'Mobile Notary Page'],
    ['vacation-rentals', 'Vacation Rentals Page'],
  ];
  for (const [pageKey, title] of defaultPages) {
    await pgPool.query(
      `INSERT INTO site_content (page_key, title)
       VALUES ($1, $2)
       ON CONFLICT (page_key) DO NOTHING`,
      [pageKey, title],
    );
  }
  const defaultSettings = [
    ['home_value_provider', 'rentcast'],
    ['home_value_default_radius', '3'],
    ['home_value_default_days_old', '180'],
    ['home_value_default_comp_count', '12'],
  ];
  for (const [key, value] of defaultSettings) {
    await pgPool.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`,
      [key, value],
    );
  }
}

async function readAppSettings() {
  if (!pgPool) return {};
  const result = await pgPool.query('SELECT key, value FROM app_settings');
  return Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
}

function currentUsageMonth() {
  return new Date().toISOString().slice(0, 7);
}

function isoDateFromLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function usageResetDate() {
  const reset = new Date();
  reset.setMonth(reset.getMonth() + 1);
  return isoDateFromLocal(reset);
}

async function upsertAppSetting(key, value) {
  if (!pgPool) return;
  await pgPool.query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value, updated_at = NOW()`,
    [clean(key), clean(value)],
  );
}

async function getRentcastUsageStatus() {
  const month = currentUsageMonth();
  let settings = await readAppSettings();
  let trackedMonth = settings.rentcast_usage_month || '';
  let usedThisMonth = Number(settings.rentcast_usage_count || 0);

  if (trackedMonth !== month) {
    trackedMonth = month;
    usedThisMonth = 0;
    await upsertAppSetting('rentcast_usage_month', month);
    await upsertAppSetting('rentcast_usage_count', '0');
    await upsertAppSetting('rentcast_usage_seeded_month', '');
    settings = await readAppSettings();
  } else if (!settings.rentcast_usage_count) {
    usedThisMonth = RENTCAST_INITIAL_USED_THIS_MONTH;
    await upsertAppSetting('rentcast_usage_count', String(usedThisMonth));
    await upsertAppSetting('rentcast_usage_seeded_month', month);
    settings = await readAppSettings();
  } else if (Number(settings.rentcast_usage_count || 0) === 0 && settings.rentcast_usage_seeded_month !== month) {
    usedThisMonth = RENTCAST_INITIAL_USED_THIS_MONTH;
    await upsertAppSetting('rentcast_usage_count', String(usedThisMonth));
    await upsertAppSetting('rentcast_usage_seeded_month', month);
    settings = await readAppSettings();
  }

  usedThisMonth = Number(settings.rentcast_usage_count || usedThisMonth || 0);

  return {
    monthlyLimit: RENTCAST_MONTHLY_FREE_LIMIT,
    usedThisMonth,
    remainingThisMonth: Math.max(0, RENTCAST_MONTHLY_FREE_LIMIT - usedThisMonth),
    resetsOn: usageResetDate(),
    overageCostPerHitUsd: RENTCAST_OVERAGE_COST_USD,
  };
}

async function incrementRentcastUsage() {
  const usage = await getRentcastUsageStatus();
  const next = usage.usedThisMonth + 1;
  await upsertAppSetting('rentcast_usage_count', String(next));
  return {
    ...usage,
    usedThisMonth: next,
    remainingThisMonth: Math.max(0, usage.monthlyLimit - next),
  };
}

async function adminUserCount() {
  if (!pgPool) return 0;
  const result = await pgPool.query('SELECT COUNT(*)::int AS count FROM admin_users');
  return result.rows[0]?.count || 0;
}

async function createAdminSession(res, adminUserId) {
  if (!pgPool) throw new Error('DATABASE_URL is not configured.');
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + adminSessionDays * 24 * 60 * 60 * 1000);
  await pgPool.query(
    'INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [adminUserId, tokenHash, expiresAt],
  );
  setCookie(res, sessionCookieName, token, {
    maxAge: adminSessionDays * 24 * 60 * 60,
    sameSite: 'Strict',
    secure: secureCookies,
  });
}

async function getAdminSession(req) {
  if (!pgPool) return null;
  const token = parseCookies(req)[sessionCookieName];
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const result = await pgPool.query(
    `SELECT u.id, u.email, u.full_name, u.created_at
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );
  return result.rows[0] || null;
}

async function destroyAdminSession(req, res) {
  if (pgPool) {
    const token = parseCookies(req)[sessionCookieName];
    if (token) {
      await pgPool.query('DELETE FROM admin_sessions WHERE token_hash = $1', [hashSessionToken(token)]).catch(() => undefined);
    }
  }
  clearCookie(res, sessionCookieName);
}

async function requireAdmin(req, res) {
  if (!pgPool) {
    res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    return null;
  }
  const session = await getAdminSession(req);
  if (!session) {
    res.status(401).json({ message: 'Not signed in.' });
    return null;
  }
  return session;
}

function parseJsonArray(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => clean(entry)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((entry) => clean(entry))
      .filter(Boolean);
  }
  return [];
}

function extensionFromMime(mimeType) {
  const normalized = clean(mimeType).toLowerCase();
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'jpg';
  if (normalized === 'image/png') return 'png';
  if (normalized === 'image/webp') return 'webp';
  if (normalized === 'image/gif') return 'gif';
  if (normalized === 'image/svg+xml') return 'svg';
  if (normalized === 'image/avif') return 'avif';
  if (normalized === 'image/heic') return 'heic';
  if (normalized === 'image/heif') return 'heif';
  return '';
}

// Website bookings are stored in Stripe itself: any paid Checkout Session carries
// the booked dates in its metadata. We read those back and treat them as blocked,
// so a date booked on the site grays out just like an Airbnb-blocked date.
let bookedCache = { at: 0, ranges: [] };
const BOOKED_CACHE_TTL_MS = 5 * 60 * 1000;

async function getWebsiteBookedRanges() {
  if (pgPool) {
    const result = await pgPool.query(
      `SELECT check_in::text AS start, check_out::text AS end
       FROM vacation_bookings
       WHERE deleted_at IS NULL AND status <> 'cancelled'
       ORDER BY check_in ASC`,
    );
    return result.rows;
  }

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

async function getManualBlockedRanges() {
  if (!pgPool) return [];
  const result = await pgPool.query(
    `SELECT start_date::text AS start, end_date::text AS end
     FROM blocked_dates
     ORDER BY start_date ASC`,
  );
  return result.rows;
}

async function getRentalBlockedRanges(rentalId) {
  if (!pgPool || !rentalId) return [];
  const [manual, bookingsResult] = await Promise.all([
    pgPool.query(
      `SELECT start_date::text AS start, end_date::text AS end
       FROM blocked_dates
       WHERE rental_id = $1
       ORDER BY start_date ASC`,
      [rentalId],
    ),
    pgPool.query(
      `SELECT check_in::text AS start, check_out::text AS end
       FROM vacation_bookings
       WHERE rental_id = $1 AND deleted_at IS NULL AND status <> 'cancelled'
       ORDER BY check_in ASC`,
      [rentalId],
    ),
  ]);
  return [...manual.rows, ...bookingsResult.rows];
}

async function getAllBlockedRanges() {
  const [airbnb, website, manual] = await Promise.all([
    getBlockedRanges(booking.icalUrls),
    getWebsiteBookedRanges(),
    getManualBlockedRanges(),
  ]);
  return [...airbnb, ...website, ...manual];
}

async function notifyBooking(session) {
  const { checkIn = '', checkOut = '' } = session.metadata || {};
  const guestEmail = session.customer_details?.email || session.customer_email || session.metadata?.email || '';
  const amount = money(session.amount_total ?? 0, session.currency || 'usd');

  await sendResendEmail({
    to: contactTo,
    subject: `New vacation rental booking - ${checkIn} to ${checkOut}`,
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
        `- Iris & J Holdings`,
      html:
        `<p>Hi,</p>` +
        `<p>Your Orlando vacation rental booking has been paid and received.</p>` +
        `<p><strong>Dates:</strong> ${escapeHtml(checkIn)} to ${escapeHtml(checkOut)}<br>` +
        `<strong>Amount paid:</strong> ${escapeHtml(amount)}</p>` +
        `<p>A Stripe receipt should arrive separately by email. Daiana will follow up with the booking details, house rules, and check-in information.</p>` +
        `<p>- Iris &amp; J Holdings</p>`,
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
    subject: `Paid notary booking fee - ${appointmentDate} at ${appointmentTime}`,
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
        `- Iris & J Holdings`,
      html:
        `<p>Hi ${escapeHtml(name || 'there')},</p>` +
        `<p>Your mobile notary travel / booking fee has been paid and received.</p>` +
        `<p><strong>Preferred appointment:</strong> ${escapeHtml(appointmentDate)} at ${escapeHtml(appointmentTime)}<br>` +
        `<strong>Document type:</strong> ${escapeHtml(documentType || 'Not provided')}<br>` +
        `<strong>Amount paid:</strong> ${escapeHtml(amount)}</p>` +
        `<p>A Stripe receipt should arrive separately by email. Daiana will follow up to confirm the appointment time, service area, signer requirements, and any separate notary fees.</p>` +
        `<p>Payment does not guarantee that a notarial act can be completed if legal, signer, document, or identification requirements cannot be satisfied.</p>` +
        `<p>- Iris &amp; J Holdings</p>`,
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

async function persistVacationBooking(session) {
  if (!pgPool) return;
  const rentalId = Number(session.metadata?.rentalId || 0) || null;
  await pgPool.query(
    `INSERT INTO vacation_bookings (
      stripe_session_id, rental_id, guest_name, guest_email, guest_phone, guest_count,
      guest_list_text, check_in, check_out, amount_total_cents, currency, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11, 'paid')
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      guest_name = EXCLUDED.guest_name,
      guest_email = EXCLUDED.guest_email,
      guest_phone = EXCLUDED.guest_phone,
      guest_count = EXCLUDED.guest_count,
      guest_list_text = EXCLUDED.guest_list_text,
      check_in = EXCLUDED.check_in,
      check_out = EXCLUDED.check_out,
      amount_total_cents = EXCLUDED.amount_total_cents,
      currency = EXCLUDED.currency,
      status = EXCLUDED.status`,
    [
      session.id,
      rentalId,
      session.metadata?.primaryName || 'Guest',
      session.customer_details?.email || session.customer_email || session.metadata?.email || '',
      session.metadata?.primaryPhone || '',
      Number(session.metadata?.guestCount || 1),
      session.metadata?.guestList || '',
      session.metadata?.checkIn,
      session.metadata?.checkOut,
      session.amount_total ?? 0,
      session.currency || 'usd',
    ],
  );
}

async function persistNotaryRequest(session) {
  if (!pgPool) return;
  await pgPool.query(
    `INSERT INTO notary_requests (
      stripe_session_id, full_name, email, phone, city, appointment_date, appointment_time,
      document_type, notes, amount_total_cents, currency, status
    )
    VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, $9, $10, $11, 'paid')
    ON CONFLICT (stripe_session_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      city = EXCLUDED.city,
      appointment_date = EXCLUDED.appointment_date,
      appointment_time = EXCLUDED.appointment_time,
      document_type = EXCLUDED.document_type,
      notes = EXCLUDED.notes,
      amount_total_cents = EXCLUDED.amount_total_cents,
      currency = EXCLUDED.currency,
      status = EXCLUDED.status`,
    [
      session.id,
      session.metadata?.name || '',
      session.customer_details?.email || session.customer_email || session.metadata?.email || '',
      session.metadata?.phone || '',
      session.metadata?.city || '',
      session.metadata?.appointmentDate,
      session.metadata?.appointmentTime || '',
      session.metadata?.documentType || '',
      session.metadata?.notes || '',
      session.amount_total ?? 0,
      session.currency || 'usd',
    ],
  );
}

async function markInvoicePaidFromSession(session) {
  if (!pgPool) return;
  const invoiceId = Number(session.metadata?.invoiceId || 0);
  if (!invoiceId) return;
  await pgPool.query(
    `UPDATE admin_invoices
     SET status = CASE WHEN status = 'approved' THEN 'approved' ELSE 'paid' END,
         stripe_session_id = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [invoiceId, session.id],
  );
}

async function createInvoiceStripeSession(req, invoiceRecord) {
  if (!stripe) {
    throw new Error('Stripe is not configured.');
  }
  const origin = buildOrigin(req);
  const serviceLabel = invoiceRecord.service_type === 'vacation' ? 'Vacation rental' : 'Notary appointment';
  const detailLabel = invoiceRecord.service_type === 'vacation'
    ? `${invoiceRecord.check_in || ''} to ${invoiceRecord.check_out || ''}`
    : `${invoiceRecord.appointment_date || ''} at ${invoiceRecord.appointment_time || ''}`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: invoiceRecord.currency,
          unit_amount: invoiceRecord.amount_total_cents,
          product_data: {
            name: `${serviceLabel} invoice`,
            description: detailLabel || invoiceRecord.description || serviceLabel,
          },
        },
      },
    ],
    success_url: `${origin}/invoice-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: invoiceRecord.service_type === 'vacation' ? `${origin}/vacation-rentals` : `${origin}/mobile-notary`,
    customer_email: invoiceRecord.recipient_email,
    payment_intent_data: { receipt_email: invoiceRecord.recipient_email || undefined },
    metadata: {
      type: 'invoice',
      invoiceId: String(invoiceRecord.id),
      serviceType: metadataValue(invoiceRecord.service_type),
      recipientName: metadataValue(invoiceRecord.recipient_name),
      recipientEmail: metadataValue(invoiceRecord.recipient_email),
      recipientPhone: metadataValue(invoiceRecord.recipient_phone),
      description: metadataValue(invoiceRecord.description),
      notes: metadataValue(invoiceRecord.notes),
      rentalId: String(invoiceRecord.rental_id || ''),
      rentalTitle: metadataValue(invoiceRecord.rental_title || ''),
      checkIn: metadataValue(invoiceRecord.check_in || ''),
      checkOut: metadataValue(invoiceRecord.check_out || ''),
      guestCount: String(invoiceRecord.guest_count || 1),
      guestList: metadataValue(invoiceRecord.guest_list_text || ''),
      appointmentDate: metadataValue(invoiceRecord.appointment_date || ''),
      appointmentTime: metadataValue(invoiceRecord.appointment_time || ''),
      city: metadataValue(invoiceRecord.city || ''),
      documentType: metadataValue(invoiceRecord.document_type || ''),
      origin: metadataValue(origin),
    },
  });

  return session;
}

async function approveInvoice(invoiceId) {
  if (!pgPool) throw new Error('DATABASE_URL is not configured.');
  const result = await pgPool.query(
    `SELECT i.*, r.title AS rental_title
     FROM admin_invoices i
     LEFT JOIN rentals r ON r.id = i.rental_id
     WHERE i.id = $1
     LIMIT 1`,
    [invoiceId],
  );
  const invoice = result.rows[0];
  if (!invoice) {
    throw new Error('Invoice not found.');
  }
  if (invoice.status === 'approved') {
    return invoice;
  }
  if (invoice.status === 'cancelled') {
    throw new Error('Cancelled invoices cannot be approved.');
  }
  if (invoice.service_type === 'vacation') {
    if (!invoice.check_in || !invoice.check_out || !invoice.recipient_email || !invoice.recipient_name) {
      throw new Error('Vacation invoice is missing required booking details.');
    }
    const upsert = await pgPool.query(
      `INSERT INTO vacation_bookings (
        stripe_session_id, rental_id, guest_name, guest_email, guest_phone, guest_count,
        guest_list_text, check_in, check_out, amount_total_cents, currency, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11, 'approved')
      ON CONFLICT (stripe_session_id) DO UPDATE SET
        rental_id = EXCLUDED.rental_id,
        guest_name = EXCLUDED.guest_name,
        guest_email = EXCLUDED.guest_email,
        guest_phone = EXCLUDED.guest_phone,
        guest_count = EXCLUDED.guest_count,
        guest_list_text = EXCLUDED.guest_list_text,
        check_in = EXCLUDED.check_in,
        check_out = EXCLUDED.check_out,
        amount_total_cents = EXCLUDED.amount_total_cents,
        currency = EXCLUDED.currency,
        status = 'approved'
      RETURNING id`,
      [
        invoice.stripe_session_id || `invoice-vacation-${invoice.id}`,
        invoice.rental_id || null,
        invoice.recipient_name,
        invoice.recipient_email,
        invoice.recipient_phone || '',
        Number(invoice.guest_count || 1),
        invoice.guest_list_text || '',
        invoice.check_in,
        invoice.check_out,
        Number(invoice.amount_total_cents || 0),
        invoice.currency || 'usd',
      ],
    );
    await pgPool.query(
      `UPDATE admin_invoices
       SET status = 'approved',
           vacation_booking_id = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [invoice.id, upsert.rows[0].id],
    );
  } else {
    if (!invoice.appointment_date || !invoice.appointment_time || !invoice.recipient_email || !invoice.recipient_name) {
      throw new Error('Notary invoice is missing required appointment details.');
    }
    const upsert = await pgPool.query(
      `INSERT INTO notary_requests (
        stripe_session_id, full_name, email, phone, city, appointment_date, appointment_time,
        document_type, notes, amount_total_cents, currency, status
      )
      VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, $9, $10, $11, 'approved')
      ON CONFLICT (stripe_session_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        city = EXCLUDED.city,
        appointment_date = EXCLUDED.appointment_date,
        appointment_time = EXCLUDED.appointment_time,
        document_type = EXCLUDED.document_type,
        notes = EXCLUDED.notes,
        amount_total_cents = EXCLUDED.amount_total_cents,
        currency = EXCLUDED.currency,
        status = 'approved'
      RETURNING id`,
      [
        invoice.stripe_session_id || `invoice-notary-${invoice.id}`,
        invoice.recipient_name,
        invoice.recipient_email,
        invoice.recipient_phone || '',
        invoice.city || '',
        invoice.appointment_date,
        invoice.appointment_time || '',
        invoice.document_type || '',
        invoice.notes || '',
        Number(invoice.amount_total_cents || 0),
        invoice.currency || 'usd',
      ],
    );
    await pgPool.query(
      `UPDATE admin_invoices
       SET status = 'approved',
           notary_request_id = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [invoice.id, upsert.rows[0].id],
    );
  }
  bookedCache = { at: 0, ranges: [] };
  return invoice;
}

let checkoutSyncCache = { at: 0 };
const CHECKOUT_SYNC_TTL_MS = 60 * 1000;

async function syncRecentPaidCheckoutSessions(force = false) {
  if (!stripe || !pgPool) return;
  const now = Date.now();
  if (!force && now - checkoutSyncCache.at < CHECKOUT_SYNC_TTL_MS) {
    return;
  }

  const sessions = await stripe.checkout.sessions.list({ limit: 100 });
  for (const session of sessions.data) {
    if (session.payment_status !== 'paid') continue;
    if (session.metadata?.type === 'notary') {
      await persistNotaryRequest(session);
    } else if (session.metadata?.type === 'invoice') {
      await markInvoicePaidFromSession(session);
    } else if (session.metadata?.type === 'vacation') {
      await persistVacationBooking(session);
    }
  }

  checkoutSyncCache.at = now;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/me', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    const session = await getAdminSession(req);
    if (!session) {
      return res.status(401).json({ message: 'Not signed in.' });
    }
    return res.json({
      user: {
        email: session.email,
        name: session.full_name,
        createdAt: session.created_at,
      },
    });
  } catch (error) {
    console.error('Admin session lookup failed:', error);
    return res.status(500).json({ message: 'Could not load admin session.' });
  }
});

app.post('/api/admin/register', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    await ensureAdminTables();
    if (await adminUserCount()) {
      return res.status(403).json({ message: 'Admin registration is closed.' });
    }

    const fullName = clean(req.body?.name);
    const email = clean(req.body?.email).toLowerCase();
    const password = String(req.body?.password || '');

    if (!fullName || !email || password.length < 8) {
      return res.status(400).json({ message: 'Name, email, and an 8-character password are required.' });
    }

    const result = await pgPool.query(
      'INSERT INTO admin_users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [fullName, email, hashPassword(password)],
    );

    await createAdminSession(res, result.rows[0].id);
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Admin registration failed:', error);
    return res.status(500).json({ message: 'Could not create the admin account.' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    await ensureAdminTables();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const email = clean(req.body?.email).toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (isAdminLoginRateLimited(ip, email)) {
      return res.status(429).json({ message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' });
    }

    const result = await pgPool.query('SELECT id, password_hash FROM admin_users WHERE email = $1 LIMIT 1', [email]);
    const user = result.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      recordAdminLoginFailure(ip, email);
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    clearAdminLoginFailures(ip, email);
    await createAdminSession(res, user.id);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin login failed:', error);
    return res.status(500).json({ message: 'Could not sign in.' });
  }
});

app.post('/api/admin/logout', async (req, res) => {
  try {
    await destroyAdminSession(req, res);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin logout failed:', error);
    return res.status(500).json({ message: 'Could not sign out.' });
  }
});

app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    await ensureAdminTables();

    const email = clean(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const userResult = await pgPool.query('SELECT id, full_name, email FROM admin_users WHERE email = $1 LIMIT 1', [email]);
    const user = userResult.rows[0];
    if (user) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = hashSessionToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await pgPool.query(
        'INSERT INTO admin_password_reset_tokens (admin_user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, expiresAt],
      );

      const origin = buildOrigin(req);
      const resetLink = passwordResetUrl(origin, token);
      await sendResendEmail({
        to: user.email,
        replyTo: contactTo,
        subject: 'Reset your Iris & J Holdings admin password',
        text:
          `Hi ${user.full_name || 'there'},\n\n` +
          `Use this link to reset your admin password:\n${resetLink}\n\n` +
          `This link expires in 1 hour.\n\n` +
          `- Iris & J Holdings`,
        html:
          `<p>Hi ${escapeHtml(user.full_name || 'there')},</p>` +
          `<p>Use this link to reset your admin password:</p>` +
          `<p><a href="${escapeHtml(resetLink)}">${escapeHtml(resetLink)}</a></p>` +
          `<p>This link expires in 1 hour.</p>` +
          `<p>- Iris &amp; J Holdings</p>`,
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin forgot password failed:', error);
    return res.status(500).json({ message: 'Could not start password reset.' });
  }
});

app.post('/api/admin/reset-password', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    await ensureAdminTables();

    const token = clean(req.body?.token);
    const password = String(req.body?.password || '');
    if (!token || password.length < 8) {
      return res.status(400).json({ message: 'Valid reset token and an 8-character password are required.' });
    }

    const tokenHash = hashSessionToken(token);
    const tokenResult = await pgPool.query(
      `SELECT id, admin_user_id
       FROM admin_password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );
    const tokenRow = tokenResult.rows[0];
    if (!tokenRow) {
      return res.status(400).json({ message: 'This reset link is invalid or expired.' });
    }

    await pgPool.query('UPDATE admin_users SET password_hash = $2 WHERE id = $1', [tokenRow.admin_user_id, hashPassword(password)]);
    await pgPool.query('UPDATE admin_password_reset_tokens SET used_at = NOW() WHERE id = $1', [tokenRow.id]);
    await pgPool.query('DELETE FROM admin_sessions WHERE admin_user_id = $1', [tokenRow.admin_user_id]);
    await createAdminSession(res, tokenRow.admin_user_id);

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin reset password failed:', error);
    return res.status(500).json({ message: 'Could not reset password.' });
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (!currentPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Current password and a new 8-character password are required.' });
    }

    const result = await pgPool.query('SELECT password_hash FROM admin_users WHERE id = $1 LIMIT 1', [admin.id]);
    const user = result.rows[0];
    if (!user || !verifyPassword(currentPassword, user.password_hash)) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    await pgPool.query('UPDATE admin_users SET password_hash = $2 WHERE id = $1', [admin.id, hashPassword(newPassword)]);
    await pgPool.query('DELETE FROM admin_sessions WHERE admin_user_id = $1 AND token_hash <> $2', [
      admin.id,
      hashSessionToken(parseCookies(req)[sessionCookieName] || ''),
    ]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin change password failed:', error);
    return res.status(500).json({ message: 'Could not change password.' });
  }
});

app.post('/api/admin/change-email-request', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const newEmail = clean(req.body?.newEmail).toLowerCase();
    const currentPassword = String(req.body?.currentPassword || '');
    if (!newEmail || !currentPassword) {
      return res.status(400).json({ message: 'New email and current password are required.' });
    }

    const currentUserResult = await pgPool.query('SELECT password_hash, email, full_name FROM admin_users WHERE id = $1 LIMIT 1', [admin.id]);
    const currentUser = currentUserResult.rows[0];
    if (!currentUser || !verifyPassword(currentPassword, currentUser.password_hash)) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    if (newEmail === currentUser.email) {
      return res.status(400).json({ message: 'Enter a different email address.' });
    }

    const existingEmail = await pgPool.query('SELECT id FROM admin_users WHERE email = $1 LIMIT 1', [newEmail]);
    if (existingEmail.rows[0]) {
      return res.status(409).json({ message: 'That email address is already in use.' });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await pgPool.query('DELETE FROM admin_email_change_tokens WHERE admin_user_id = $1 AND used_at IS NULL', [admin.id]);
    await pgPool.query(
      'INSERT INTO admin_email_change_tokens (admin_user_id, new_email, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
      [admin.id, newEmail, tokenHash, expiresAt],
    );

    const origin = buildOrigin(req);
    const verifyLink = `${origin}/admin/confirm-email-change?token=${encodeURIComponent(token)}`;
    await sendResendEmail({
      to: newEmail,
      replyTo: contactTo,
      subject: 'Confirm your new Iris & J Holdings admin email',
      text:
        `Hi ${currentUser.full_name || 'there'},\n\n` +
        `Confirm your new admin email by opening this link:\n${verifyLink}\n\n` +
        `This link expires in 1 hour.\n\n` +
        `- Iris & J Holdings`,
      html:
        `<p>Hi ${escapeHtml(currentUser.full_name || 'there')},</p>` +
        `<p>Confirm your new admin email by opening this link:</p>` +
        `<p><a href="${escapeHtml(verifyLink)}">${escapeHtml(verifyLink)}</a></p>` +
        `<p>This link expires in 1 hour.</p>` +
        `<p>- Iris &amp; J Holdings</p>`,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin change email request failed:', error);
    return res.status(500).json({ message: 'Could not start the email change.' });
  }
});

app.post('/api/admin/confirm-email-change', async (req, res) => {
  try {
    if (!pgPool) {
      return res.status(503).json({ message: 'DATABASE_URL is not configured.' });
    }
    const token = clean(req.body?.token);
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const tokenHash = hashSessionToken(token);
    const tokenResult = await pgPool.query(
      `SELECT id, admin_user_id, new_email
       FROM admin_email_change_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );
    const tokenRow = tokenResult.rows[0];
    if (!tokenRow) {
      return res.status(400).json({ message: 'This email verification link is invalid or expired.' });
    }

    const existingEmail = await pgPool.query('SELECT id FROM admin_users WHERE email = $1 LIMIT 1', [tokenRow.new_email]);
    if (existingEmail.rows[0] && Number(existingEmail.rows[0].id) !== Number(tokenRow.admin_user_id)) {
      return res.status(409).json({ message: 'That email address is already in use.' });
    }

    await pgPool.query('UPDATE admin_users SET email = $2 WHERE id = $1', [tokenRow.admin_user_id, tokenRow.new_email]);
    await pgPool.query('UPDATE admin_email_change_tokens SET used_at = NOW() WHERE id = $1', [tokenRow.id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin confirm email change failed:', error);
    return res.status(500).json({ message: 'Could not confirm the email change.' });
  }
});

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    await syncRecentPaidCheckoutSessions();

    const [rentals, blockedDates, vacationBookings, notaryRequests, siteContent] = await Promise.all([
      pgPool.query('SELECT COUNT(*)::int AS count FROM rentals WHERE deleted_at IS NULL'),
      pgPool.query('SELECT COUNT(*)::int AS count FROM blocked_dates'),
      pgPool.query('SELECT COUNT(*)::int AS count FROM vacation_bookings WHERE deleted_at IS NULL'),
      pgPool.query('SELECT COUNT(*)::int AS count FROM notary_requests WHERE deleted_at IS NULL'),
      pgPool.query(`SELECT page_key, title, hero_image_url, updated_at FROM site_content ORDER BY page_key ASC LIMIT 12`),
    ]);

    return res.json({
      admin: { email: admin.email, name: admin.full_name },
      summary: {
        rentals: rentals.rows[0]?.count || 0,
        blockedDates: blockedDates.rows[0]?.count || 0,
        vacationBookings: vacationBookings.rows[0]?.count || 0,
        notaryRequests: notaryRequests.rows[0]?.count || 0,
      },
      siteContent: siteContent.rows,
    });
  } catch (error) {
    console.error('Admin dashboard load failed:', error);
    return res.status(500).json({ message: 'Could not load dashboard data.' });
  }
});

app.get('/api/admin/rentals', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const result = await pgPool.query(
      `SELECT id, slug, title, location_label, description, nightly_rate_cents, cleaning_fee_cents,
              max_guests, hero_image_url, hero_image_captions, gallery_image_urls, gallery_image_captions,
              amenities, is_active, created_at, updated_at
       FROM rentals
       WHERE deleted_at IS NULL
       ORDER BY created_at ASC`,
    );
    return res.json({ rentals: result.rows });
  } catch (error) {
    console.error('Admin rentals load failed:', error);
    return res.status(500).json({ message: 'Could not load rentals.' });
  }
});

app.get('/api/public-rentals', async (_req, res) => {
  try {
    if (!pgPool) {
      return res.json({ rentals: [] });
    }
    const result = await pgPool.query(
      `SELECT id, slug, title, location_label, description, nightly_rate_cents, cleaning_fee_cents,
              max_guests, hero_image_url, hero_image_captions, gallery_image_urls, gallery_image_captions,
              amenities, is_active, updated_at
       FROM rentals
       WHERE is_active = TRUE AND deleted_at IS NULL
       ORDER BY created_at ASC`,
    );
    return res.json({ rentals: result.rows });
  } catch (error) {
    console.error('Public rentals load failed:', error);
    return res.status(500).json({ message: 'Could not load rentals.' });
  }
});

app.post('/api/admin/rentals', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const id = Number(req.body?.id || 0);
    const slug = clean(req.body?.slug) || slugify(req.body?.title);
    const title = clean(req.body?.title);
    const locationLabel = clean(req.body?.locationLabel);
    const description = clean(req.body?.description);
    const nightlyRateCents = Number(req.body?.nightlyRateCents || 0);
    const cleaningFeeCents = Number(req.body?.cleaningFeeCents || 0);
    const maxGuests = Number(req.body?.maxGuests || 10);
    const heroImageUrl = clean(req.body?.heroImageUrl);
    const heroImageCaptions = parseJsonArray(req.body?.heroImageCaptions);
    const galleryImageUrls = parseJsonArray(req.body?.galleryImageUrls);
    const galleryImageCaptions = parseJsonArray(req.body?.galleryImageCaptions);
    const amenities = parseJsonArray(req.body?.amenities);
    const isActive = Boolean(req.body?.isActive);

    if (!slug || !title || !locationLabel) {
      return res.status(400).json({ message: 'Title and location are required.' });
    }

    if (id > 0) {
      await pgPool.query(
        `UPDATE rentals
         SET slug = $2, title = $3, location_label = $4, description = $5,
             nightly_rate_cents = $6, cleaning_fee_cents = $7, max_guests = $8,
             hero_image_url = $9, hero_image_captions = $10::jsonb, gallery_image_urls = $11::jsonb,
             gallery_image_captions = $12::jsonb, amenities = $13::jsonb,
             is_active = $14, updated_at = NOW()
         WHERE id = $1`,
        [id, slug, title, locationLabel, description, nightlyRateCents, cleaningFeeCents, maxGuests, heroImageUrl, JSON.stringify(heroImageCaptions), JSON.stringify(galleryImageUrls), JSON.stringify(galleryImageCaptions), JSON.stringify(amenities), isActive],
      );
    } else {
      await pgPool.query(
        `INSERT INTO rentals (
          slug, title, location_label, description, nightly_rate_cents, cleaning_fee_cents,
          max_guests, hero_image_url, hero_image_captions, gallery_image_urls, gallery_image_captions, amenities, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13)
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          location_label = EXCLUDED.location_label,
          description = EXCLUDED.description,
          nightly_rate_cents = EXCLUDED.nightly_rate_cents,
          cleaning_fee_cents = EXCLUDED.cleaning_fee_cents,
          max_guests = EXCLUDED.max_guests,
          hero_image_url = EXCLUDED.hero_image_url,
          hero_image_captions = EXCLUDED.hero_image_captions,
          gallery_image_urls = EXCLUDED.gallery_image_urls,
          gallery_image_captions = EXCLUDED.gallery_image_captions,
          amenities = EXCLUDED.amenities,
          is_active = EXCLUDED.is_active,
          deleted_at = NULL,
          updated_at = NOW()`,
        [slug, title, locationLabel, description, nightlyRateCents, cleaningFeeCents, maxGuests, heroImageUrl, JSON.stringify(heroImageCaptions), JSON.stringify(galleryImageUrls), JSON.stringify(galleryImageCaptions), JSON.stringify(amenities), isActive],
      );
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin rental save failed:', error);
    return res.status(500).json({ message: 'Could not save rental.' });
  }
});

app.post('/api/admin/rentals/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const confirmation = clean(req.body?.confirmation);
    if (!id || confirmation !== 'DELETE') {
      return res.status(400).json({ message: 'Rental id and DELETE confirmation are required.' });
    }
    await pgPool.query(
      `UPDATE rentals
       SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    bookedCache = { at: 0, ranges: [] };
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin rental delete failed:', error);
    return res.status(500).json({ message: 'Could not delete rental.' });
  }
});

app.get('/api/admin/blocked-dates', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const result = await pgPool.query(
      `SELECT b.id, b.rental_id, r.title AS rental_title, b.start_date::text AS start_date, b.end_date::text AS end_date, b.reason, b.created_at
       FROM blocked_dates b
       JOIN rentals r ON r.id = b.rental_id
       ORDER BY b.start_date ASC`,
    );
    return res.json({ blockedDates: result.rows });
  } catch (error) {
    console.error('Admin blocked dates load failed:', error);
    return res.status(500).json({ message: 'Could not load blocked dates.' });
  }
});

app.post('/api/admin/blocked-dates', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const rentalId = Number(req.body?.rentalId || 0);
    const startDate = clean(req.body?.startDate);
    const endDate = clean(req.body?.endDate);
    const reason = clean(req.body?.reason);

    if (!rentalId || !isIsoDate(startDate) || !isIsoDate(endDate) || endDate < startDate) {
      return res.status(400).json({ message: 'Valid rental, start date, and end date are required.' });
    }

    await pgPool.query(
      `INSERT INTO blocked_dates (rental_id, start_date, end_date, reason)
       VALUES ($1, $2::date, $3::date, $4)`,
      [rentalId, startDate, endDate, reason],
    );
    bookedCache = { at: 0, ranges: [] };
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin blocked date create failed:', error);
    return res.status(500).json({ message: 'Could not create blocked date.' });
  }
});

app.post('/api/admin/blocked-dates/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    if (!id) {
      return res.status(400).json({ message: 'Blocked date id is required.' });
    }
    await pgPool.query('DELETE FROM blocked_dates WHERE id = $1', [id]);
    bookedCache = { at: 0, ranges: [] };
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin blocked date delete failed:', error);
    return res.status(500).json({ message: 'Could not delete blocked date.' });
  }
});

app.get('/api/admin/site-content', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const result = await pgPool.query(
      `SELECT id, page_key, title, body, hero_image_url, updated_at
       FROM site_content
       ORDER BY page_key ASC`,
    );
    return res.json({ entries: result.rows });
  } catch (error) {
    console.error('Admin site content load failed:', error);
    return res.status(500).json({ message: 'Could not load site content.' });
  }
});

app.get('/api/site-content-public', async (req, res) => {
  try {
    if (!pgPool) {
      return res.json({ entry: null });
    }
    const pageKey = clean(req.query?.pageKey);
    if (!pageKey) {
      return res.status(400).json({ message: 'Page key is required.' });
    }
    const result = await pgPool.query(
      `SELECT id, page_key, title, body, hero_image_url, updated_at
       FROM site_content
       WHERE page_key = $1
       LIMIT 1`,
      [pageKey],
    );
    return res.json({ entry: result.rows[0] || null });
  } catch (error) {
    console.error('Public site content load failed:', error);
    return res.status(500).json({ message: 'Could not load page content.' });
  }
});

app.post('/api/admin/site-content', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const pageKey = clean(req.body?.pageKey);
    const title = clean(req.body?.title);
    const body = clean(req.body?.body);
    const heroImageUrl = clean(req.body?.heroImageUrl);
    if (!pageKey || !title) {
      return res.status(400).json({ message: 'Page key and title are required.' });
    }
    await pgPool.query(
      `INSERT INTO site_content (page_key, title, body, hero_image_url, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (page_key) DO UPDATE
       SET title = EXCLUDED.title, body = EXCLUDED.body, hero_image_url = EXCLUDED.hero_image_url, updated_at = NOW()`,
      [pageKey, title, body, heroImageUrl],
    );
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin site content save failed:', error);
    return res.status(500).json({ message: 'Could not save site content.' });
  }
});

app.get('/api/admin/notifications', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    await syncRecentPaidCheckoutSessions();
    const [vacation, notary] = await Promise.all([
      pgPool.query(
      `SELECT COUNT(*)::int AS new_count, COALESCE(MAX(created_at)::text, '') AS latest_created_at
         FROM vacation_bookings
         WHERE status = 'paid' AND deleted_at IS NULL`,
      ),
      pgPool.query(
        `SELECT COUNT(*)::int AS new_count, COALESCE(MAX(created_at)::text, '') AS latest_created_at
         FROM notary_requests
         WHERE status = 'paid' AND deleted_at IS NULL`,
      ),
    ]);
    const vacationLatest = vacation.rows[0]?.latest_created_at || '';
    const notaryLatest = notary.rows[0]?.latest_created_at || '';
    const bookingsLatest = [vacationLatest, notaryLatest].filter(Boolean).sort().at(-1) || '';
    const bookingsCount = (vacation.rows[0]?.new_count || 0) + (notary.rows[0]?.new_count || 0);
    return res.json({
      bookings: { newCount: bookingsCount, latestCreatedAt: bookingsLatest },
      vacation: {
        newCount: vacation.rows[0]?.new_count || 0,
        latestCreatedAt: vacationLatest,
      },
      notary: {
        newCount: notary.rows[0]?.new_count || 0,
        latestCreatedAt: notaryLatest,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin notifications load failed:', error);
    return res.status(500).json({ message: 'Could not load notifications.' });
  }
});

app.get('/api/admin/vacation-bookings', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    await syncRecentPaidCheckoutSessions();
    const result = await pgPool.query(
      `SELECT b.*, r.title AS rental_title
       FROM vacation_bookings b
       LEFT JOIN rentals r ON r.id = b.rental_id
       WHERE b.deleted_at IS NULL
       ORDER BY b.created_at DESC
       LIMIT 100`,
    );
    return res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Admin vacation bookings load failed:', error);
    return res.status(500).json({ message: 'Could not load vacation bookings.' });
  }
});

app.post('/api/admin/vacation-bookings/status', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const status = clean(req.body?.status).toLowerCase();
    if (!id || !['paid', 'reviewed', 'cancel-requested', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid booking id and status are required.' });
    }
    await pgPool.query('UPDATE vacation_bookings SET status = $2 WHERE id = $1 AND deleted_at IS NULL', [id, status]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin vacation booking status update failed:', error);
    return res.status(500).json({ message: 'Could not update vacation booking status.' });
  }
});

app.post('/api/admin/vacation-bookings/save', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const guestName = clean(req.body?.guestName);
    const guestEmail = clean(req.body?.guestEmail);
    const guestPhone = clean(req.body?.guestPhone);
    const guestCount = Number(req.body?.guestCount || 1);
    const guestListText = clean(req.body?.guestListText);
    const checkIn = clean(req.body?.checkIn);
    const checkOut = clean(req.body?.checkOut);
    const status = clean(req.body?.status).toLowerCase();
    if (!id || !guestName || !guestEmail || !isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut < checkIn) {
      return res.status(400).json({ message: 'Valid booking details are required.' });
    }
    if (!['paid', 'reviewed', 'cancel-requested', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid booking status is required.' });
    }
    await pgPool.query(
      `UPDATE vacation_bookings
       SET guest_name = $2,
           guest_email = $3,
           guest_phone = $4,
           guest_count = $5,
           guest_list_text = $6,
           check_in = $7::date,
           check_out = $8::date,
           status = $9
       WHERE id = $1 AND deleted_at IS NULL`,
      [id, guestName, guestEmail, guestPhone, guestCount, guestListText, checkIn, checkOut, status],
    );
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin vacation booking save failed:', error);
    return res.status(500).json({ message: 'Could not save vacation booking.' });
  }
});

app.post('/api/admin/vacation-bookings/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const confirmation = clean(req.body?.confirmation);
    if (!id || confirmation !== 'DELETE') {
      return res.status(400).json({ message: 'Booking id and DELETE confirmation are required.' });
    }
    await pgPool.query('UPDATE vacation_bookings SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin vacation booking delete failed:', error);
    return res.status(500).json({ message: 'Could not delete vacation booking.' });
  }
});

app.get('/api/admin/notary-requests', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    await syncRecentPaidCheckoutSessions();
    const result = await pgPool.query(
      `SELECT *
       FROM notary_requests
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT 100`,
    );
    return res.json({ requests: result.rows });
  } catch (error) {
    console.error('Admin notary requests load failed:', error);
    return res.status(500).json({ message: 'Could not load notary requests.' });
  }
});

app.post('/api/admin/notary-requests/status', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const status = clean(req.body?.status).toLowerCase();
    if (!id || !['paid', 'reviewed', 'confirmed', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid request id and status are required.' });
    }
    await pgPool.query('UPDATE notary_requests SET status = $2 WHERE id = $1 AND deleted_at IS NULL', [id, status]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin notary request status update failed:', error);
    return res.status(500).json({ message: 'Could not update notary request status.' });
  }
});

app.post('/api/admin/notary-requests/save', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const fullName = clean(req.body?.fullName);
    const email = clean(req.body?.email);
    const phone = clean(req.body?.phone);
    const city = clean(req.body?.city);
    const appointmentDate = clean(req.body?.appointmentDate);
    const appointmentTime = clean(req.body?.appointmentTime);
    const documentType = clean(req.body?.documentType);
    const notes = clean(req.body?.notes);
    const status = clean(req.body?.status).toLowerCase();
    if (!id || !fullName || !email || !isIsoDate(appointmentDate) || !appointmentTime) {
      return res.status(400).json({ message: 'Valid request details are required.' });
    }
    if (!['paid', 'reviewed', 'confirmed', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid request status is required.' });
    }
    await pgPool.query(
      `UPDATE notary_requests
       SET full_name = $2,
           email = $3,
           phone = $4,
           city = $5,
           appointment_date = $6::date,
           appointment_time = $7,
           document_type = $8,
           notes = $9,
           status = $10
       WHERE id = $1 AND deleted_at IS NULL`,
      [id, fullName, email, phone, city, appointmentDate, appointmentTime, documentType, notes, status],
    );
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin notary request save failed:', error);
    return res.status(500).json({ message: 'Could not save notary request.' });
  }
});

app.post('/api/admin/notary-requests/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const confirmation = clean(req.body?.confirmation);
    if (!id || confirmation !== 'DELETE') {
      return res.status(400).json({ message: 'Request id and DELETE confirmation are required.' });
    }
    await pgPool.query('UPDATE notary_requests SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin notary request delete failed:', error);
    return res.status(500).json({ message: 'Could not delete notary request.' });
  }
});

app.get('/api/admin/buyer-leads', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const result = await pgPool.query(
      `SELECT *
       FROM buyer_leads
       ORDER BY created_at DESC
       LIMIT 200`,
    );
    return res.json({ leads: result.rows });
  } catch (error) {
    console.error('Admin buyer leads load failed:', error);
    return res.status(500).json({ message: 'Could not load buyer leads.' });
  }
});

app.post('/api/admin/buyer-leads', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const clientName = clean(req.body?.clientName);
    const email = clean(req.body?.email);
    const phone = clean(req.body?.phone);
    const targetAreas = clean(req.body?.targetAreas);
    const budgetMin = Number(req.body?.budgetMin || 0);
    const budgetMax = Number(req.body?.budgetMax || 0);
    const timeline = clean(req.body?.timeline);
    const financingStatus = clean(req.body?.financingStatus);
    const approvalStatus = clean(req.body?.approvalStatus);
    const notes = clean(req.body?.notes);

    if (!clientName || !email) {
      return res.status(400).json({ message: 'Client name and email are required.' });
    }

    if (id > 0) {
      await pgPool.query(
        `UPDATE buyer_leads
         SET client_name = $2,
             email = $3,
             phone = $4,
             target_areas = $5,
             budget_min = $6,
             budget_max = $7,
             timeline = $8,
             financing_status = $9,
             approval_status = $10,
             notes = $11
         WHERE id = $1`,
        [id, clientName, email, phone, targetAreas, budgetMin, budgetMax, timeline, financingStatus, approvalStatus, notes],
      );
    } else {
      await pgPool.query(
        `INSERT INTO buyer_leads (
          client_name,
          email,
          phone,
          target_areas,
          budget_min,
          budget_max,
          timeline,
          financing_status,
          approval_status,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [clientName, email, phone, targetAreas, budgetMin, budgetMax, timeline, financingStatus, approvalStatus, notes],
      );
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin buyer lead save failed:', error);
    return res.status(500).json({ message: 'Could not save buyer lead.' });
  }
});

app.post('/api/admin/buyer-leads/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    if (!id) {
      return res.status(400).json({ message: 'Buyer record id is required.' });
    }
    await pgPool.query('DELETE FROM buyer_leads WHERE id = $1', [id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin buyer lead delete failed:', error);
    return res.status(500).json({ message: 'Could not delete buyer record.' });
  }
});

app.get('/api/admin/seller-leads', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const result = await pgPool.query(
      `SELECT *
       FROM seller_leads
       ORDER BY created_at DESC
       LIMIT 200`,
    );
    return res.json({ leads: result.rows });
  } catch (error) {
    console.error('Admin seller leads load failed:', error);
    return res.status(500).json({ message: 'Could not load seller leads.' });
  }
});

app.post('/api/admin/seller-leads', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const clientName = clean(req.body?.clientName);
    const email = clean(req.body?.email);
    const phone = clean(req.body?.phone);
    const propertyAddress = clean(req.body?.propertyAddress);
    const targetPrice = Number(req.body?.targetPrice || 0);
    const timeline = clean(req.body?.timeline);
    const occupancyStatus = clean(req.body?.occupancyStatus);
    const notes = clean(req.body?.notes);

    if (!clientName || !email) {
      return res.status(400).json({ message: 'Client name and email are required.' });
    }

    if (id > 0) {
      await pgPool.query(
        `UPDATE seller_leads
         SET client_name = $2,
             email = $3,
             phone = $4,
             property_address = $5,
             target_price = $6,
             timeline = $7,
             occupancy_status = $8,
             notes = $9
         WHERE id = $1`,
        [id, clientName, email, phone, propertyAddress, targetPrice, timeline, occupancyStatus, notes],
      );
    } else {
      await pgPool.query(
        `INSERT INTO seller_leads (
          client_name,
          email,
          phone,
          property_address,
          target_price,
          timeline,
          occupancy_status,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [clientName, email, phone, propertyAddress, targetPrice, timeline, occupancyStatus, notes],
      );
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin seller lead save failed:', error);
    return res.status(500).json({ message: 'Could not save seller lead.' });
  }
});

app.post('/api/admin/seller-leads/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    if (!id) {
      return res.status(400).json({ message: 'Seller record id is required.' });
    }
    await pgPool.query('DELETE FROM seller_leads WHERE id = $1', [id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin seller lead delete failed:', error);
    return res.status(500).json({ message: 'Could not delete seller record.' });
  }
});

app.get('/api/admin/invoices', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    await syncRecentPaidCheckoutSessions();
    const result = await pgPool.query(
      `SELECT i.*, r.title AS rental_title
       FROM admin_invoices i
       LEFT JOIN rentals r ON r.id = i.rental_id
       ORDER BY i.created_at DESC`,
    );
    return res.json({ invoices: result.rows });
  } catch (error) {
    console.error('Admin invoices load failed:', error);
    return res.status(500).json({ message: 'Could not load invoices.' });
  }
});

app.post('/api/admin/invoices/save', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const serviceType = clean(req.body?.serviceType).toLowerCase();
    const recipientName = clean(req.body?.recipientName);
    const recipientEmail = clean(req.body?.recipientEmail);
    const recipientPhone = clean(req.body?.recipientPhone);
    const description = clean(req.body?.description);
    const notes = clean(req.body?.notes);
    const amountTotalCents = Number(req.body?.amountTotalCents || 0);
    const rentalId = Number(req.body?.rentalId || 0) || null;
    const checkIn = clean(req.body?.checkIn);
    const checkOut = clean(req.body?.checkOut);
    const guestCount = Number(req.body?.guestCount || 1);
    const guestListText = clean(req.body?.guestListText);
    const appointmentDate = clean(req.body?.appointmentDate);
    const appointmentTime = clean(req.body?.appointmentTime);
    const city = clean(req.body?.city);
    const documentType = clean(req.body?.documentType);

    if (!['vacation', 'notary'].includes(serviceType)) {
      return res.status(400).json({ message: 'Valid service type is required.' });
    }
    if (!recipientName || !recipientEmail || amountTotalCents <= 0) {
      return res.status(400).json({ message: 'Recipient name, email, and invoice amount are required.' });
    }
    if (serviceType === 'vacation' && (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut < checkIn)) {
      return res.status(400).json({ message: 'Vacation invoices require valid check-in and check-out dates.' });
    }
    if (serviceType === 'notary' && (!isIsoDate(appointmentDate) || !appointmentTime)) {
      return res.status(400).json({ message: 'Notary invoices require a valid date and time.' });
    }

    const result = await pgPool.query(
      `INSERT INTO admin_invoices (
        id, service_type, recipient_name, recipient_email, recipient_phone, description, notes,
        amount_total_cents, currency, rental_id, check_in, check_out, guest_count, guest_list_text,
        appointment_date, appointment_time, city, document_type, updated_at
      )
      VALUES (
        NULLIF($1, 0), $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11::date, $12::date, $13, $14,
        $15::date, $16, $17, $18, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        service_type = EXCLUDED.service_type,
        recipient_name = EXCLUDED.recipient_name,
        recipient_email = EXCLUDED.recipient_email,
        recipient_phone = EXCLUDED.recipient_phone,
        description = EXCLUDED.description,
        notes = EXCLUDED.notes,
        amount_total_cents = EXCLUDED.amount_total_cents,
        rental_id = EXCLUDED.rental_id,
        check_in = EXCLUDED.check_in,
        check_out = EXCLUDED.check_out,
        guest_count = EXCLUDED.guest_count,
        guest_list_text = EXCLUDED.guest_list_text,
        appointment_date = EXCLUDED.appointment_date,
        appointment_time = EXCLUDED.appointment_time,
        city = EXCLUDED.city,
        document_type = EXCLUDED.document_type,
        updated_at = NOW()
      RETURNING id`,
      [
        id,
        serviceType,
        recipientName,
        recipientEmail,
        recipientPhone,
        description,
        notes,
        amountTotalCents,
        booking.currency,
        rentalId,
        checkIn || null,
        checkOut || null,
        guestCount,
        guestListText,
        appointmentDate || null,
        appointmentTime,
        city,
        documentType,
      ],
    );
    return res.json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Admin invoice save failed:', error);
    return res.status(500).json({ message: 'Could not save invoice.' });
  }
});

app.post('/api/admin/invoices/send', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    if (!id) return res.status(400).json({ message: 'Invoice id is required.' });

    const result = await pgPool.query(
      `SELECT i.*, r.title AS rental_title
       FROM admin_invoices i
       LEFT JOIN rentals r ON r.id = i.rental_id
       WHERE i.id = $1
       LIMIT 1`,
      [id],
    );
    const invoice = result.rows[0];
    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

    const session = await createInvoiceStripeSession(req, invoice);
    await pgPool.query(
      `UPDATE admin_invoices
       SET stripe_session_id = $2,
           stripe_checkout_url = $3,
           status = CASE WHEN status = 'approved' THEN 'approved' ELSE 'sent' END,
           updated_at = NOW()
       WHERE id = $1`,
      [id, session.id, session.url || ''],
    );

    await sendResendEmail({
      to: invoice.recipient_email,
      replyTo: contactTo,
      subject: `Invoice from Iris & J Holdings - ${invoice.service_type === 'vacation' ? 'Vacation rental' : 'Notary appointment'}`,
      text:
        `Hi ${invoice.recipient_name || 'there'},\n\n` +
        `${invoice.description || 'An invoice is ready for you.'}\n\n` +
        `Amount due: ${money(invoice.amount_total_cents || 0, invoice.currency || 'usd')}\n` +
        `${session.url ? `Payment link: ${session.url}\n\n` : '\n'}` +
        `Reply to this email with any questions.\n\n` +
        `- Iris & J Holdings`,
      html:
        `<p>Hi ${escapeHtml(invoice.recipient_name || 'there')},</p>` +
        `<p>${escapeHtml(invoice.description || 'An invoice is ready for you.')}</p>` +
        `<p><strong>Amount due:</strong> ${escapeHtml(money(invoice.amount_total_cents || 0, invoice.currency || 'usd'))}</p>` +
        `${session.url ? `<p><a href="${escapeHtml(session.url)}">Pay this invoice</a></p>` : ''}` +
        `<p>Reply to this email with any questions.</p>` +
        `<p>- Iris &amp; J Holdings</p>`,
    });

    return res.json({ ok: true, checkoutUrl: session.url || '' });
  } catch (error) {
    console.error('Admin invoice send failed:', error);
    return res.status(500).json({ message: 'Could not send invoice.' });
  }
});

app.post('/api/admin/invoices/status', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const status = clean(req.body?.status).toLowerCase();
    if (!id || !['draft', 'sent', 'paid', 'approved', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid invoice id and status are required.' });
    }
    if (status === 'approved') {
      await approveInvoice(id);
    } else {
      await pgPool.query('UPDATE admin_invoices SET status = $2, updated_at = NOW() WHERE id = $1', [id, status]);
      if (status === 'cancelled') {
        const invoiceResult = await pgPool.query('SELECT vacation_booking_id, notary_request_id FROM admin_invoices WHERE id = $1', [id]);
        const invoice = invoiceResult.rows[0];
        if (invoice?.vacation_booking_id) {
          await pgPool.query('UPDATE vacation_bookings SET status = $2 WHERE id = $1', [invoice.vacation_booking_id, 'cancelled']);
        }
        if (invoice?.notary_request_id) {
          await pgPool.query('UPDATE notary_requests SET status = $2 WHERE id = $1', [invoice.notary_request_id, 'cancelled']);
        }
      }
    }
    bookedCache = { at: 0, ranges: [] };
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin invoice status update failed:', error);
    return res.status(500).json({ message: error instanceof Error ? error.message : 'Could not update invoice status.' });
  }
});

app.post('/api/admin/invoices/delete', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = Number(req.body?.id || 0);
    const confirmation = clean(req.body?.confirmation);
    if (!id || confirmation !== 'DELETE') {
      return res.status(400).json({ message: 'Invoice id and DELETE confirmation are required.' });
    }
    await pgPool.query('DELETE FROM admin_invoices WHERE id = $1', [id]);
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin invoice delete failed:', error);
    return res.status(500).json({ message: 'Could not delete invoice.' });
  }
});

app.post('/api/admin/home-value-email', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const recipientEmail = clean(req.body?.recipientEmail || contactTo);
    const subjectAddress = clean(req.body?.subjectAddress || 'Property');
    const estimate = req.body?.estimate || {};
    const comparables = Array.isArray(estimate.comparables) ? estimate.comparables : [];

    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required.' });
    }

    const compLines = comparables.length
      ? comparables.map((comp, index) =>
          `${index + 1}. ${clean(comp.formattedAddress || 'Unknown address')} | ${clean(comp.propertyType || 'Unknown type')} | ${clean(String(comp.bedrooms || 0))} bd | ${clean(String(comp.bathrooms || 0))} ba | ${clean(String(comp.squareFootage || 0))} sq ft | ${money(Number(comp.price || 0) * 100, 'usd')}`,
        ).join('\n')
      : 'No comparable sales were returned.';

    await sendResendEmail({
      to: recipientEmail,
      replyTo: contactTo,
      subject: `Home value comparables - ${subjectAddress}`,
      text:
        `Comparable sales for ${subjectAddress}\n\n` +
        `Estimated value: ${money(Number(estimate.price || 0) * 100, 'usd')}\n` +
        `Low range: ${money(Number(estimate.priceRangeLow || 0) * 100, 'usd')}\n` +
        `High range: ${money(Number(estimate.priceRangeHigh || 0) * 100, 'usd')}\n\n` +
        `${compLines}\n\n` +
        `Powered by RentCast.`,
      html:
        `<p><strong>Comparable sales for ${escapeHtml(subjectAddress)}</strong></p>` +
        `<p><strong>Estimated value:</strong> ${escapeHtml(money(Number(estimate.price || 0) * 100, 'usd'))}<br>` +
        `<strong>Low range:</strong> ${escapeHtml(money(Number(estimate.priceRangeLow || 0) * 100, 'usd'))}<br>` +
        `<strong>High range:</strong> ${escapeHtml(money(Number(estimate.priceRangeHigh || 0) * 100, 'usd'))}</p>` +
        `<p>${escapeHtml(compLines).replace(/\n/g, '<br>')}</p>` +
        `<p>Powered by RentCast.</p>`,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin home value email failed:', error);
    return res.status(500).json({ message: 'Could not send the comparable sales email.' });
  }
});

app.get('/api/admin/home-value-estimates', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const result = await pgPool.query(
      `SELECT id, client_name, subject_address, city, state, zip_code, property_type,
              bedrooms::double precision AS bedrooms,
              bathrooms::double precision AS bathrooms,
              square_footage,
              estimated_value::double precision AS estimated_value,
              low_range::double precision AS low_range,
              high_range::double precision AS high_range,
              result_json::text AS result_json, created_at
       FROM home_value_estimates
       ORDER BY created_at DESC
       LIMIT 50`,
    );
    return res.json({ estimates: result.rows });
  } catch (error) {
    console.error('Admin home value estimates load failed:', error);
    return res.status(500).json({ message: 'Could not load saved estimates.' });
  }
});

app.post('/api/admin/home-value-estimates/save', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const clientName = clean(req.body?.clientName);
    const subjectAddress = clean(req.body?.subjectAddress);
    const city = clean(req.body?.city);
    const state = clean(req.body?.state);
    const zipCode = clean(req.body?.zipCode);
    const propertyType = clean(req.body?.propertyType);
    const bedrooms = Number(req.body?.bedrooms || 0);
    const bathrooms = Number(req.body?.bathrooms || 0);
    const squareFootage = Number(req.body?.squareFootage || 0);
    const estimate = req.body?.estimate || {};

    if (!clientName) {
      return res.status(400).json({ message: 'Client name is required.' });
    }
    if (!subjectAddress) {
      return res.status(400).json({ message: 'Property address is required.' });
    }

    await pgPool.query(
      `INSERT INTO home_value_estimates (
         client_name, subject_address, city, state, zip_code, property_type, bedrooms, bathrooms,
         square_footage, estimated_value, low_range, high_range, result_json
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)`,
      [
        clientName,
        subjectAddress,
        city,
        state,
        zipCode,
        propertyType,
        Number.isFinite(bedrooms) ? bedrooms : 0,
        Number.isFinite(bathrooms) ? bathrooms : 0,
        Number.isFinite(squareFootage) ? squareFootage : 0,
        Number(estimate.price || 0),
        Number(estimate.priceRangeLow || 0),
        Number(estimate.priceRangeHigh || 0),
        JSON.stringify(estimate),
      ],
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin home value estimate save failed:', error);
    return res.status(500).json({ message: 'Could not save the estimate.' });
  }
});

app.get('/api/admin/settings', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const settings = await readAppSettings();
    const rentcastUsage = await getRentcastUsageStatus();
    return res.json({
      settings,
      status: {
        databaseConfigured: Boolean(pgPool),
        stripeConfigured: Boolean(stripe),
        resendConfigured: Boolean(resendApiKey),
        rentcastConfigured: Boolean(rentcastApiKey),
      },
      rentcastUsage,
    });
  } catch (error) {
    console.error('Admin settings load failed:', error);
    return res.status(500).json({ message: 'Could not load settings.' });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const entries = req.body?.settings && typeof req.body.settings === 'object' ? Object.entries(req.body.settings) : [];
    for (const [key, value] of entries) {
      await pgPool.query(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = NOW()`,
        [clean(key), clean(value)],
      );
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Admin settings save failed:', error);
    return res.status(500).json({ message: 'Could not save settings.' });
  }
});

app.post('/api/home-value-estimate', async (req, res) => {
  try {
    const address = clean(req.body?.address);
    const city = clean(req.body?.city);
    const state = clean(req.body?.state || 'NJ');
    const zipCode = clean(req.body?.zipCode);
    const bedrooms = Number(req.body?.bedrooms || 0);
    const bathrooms = Number(req.body?.bathrooms || 0);
    const squareFootage = Number(req.body?.squareFootage || 0);
    const propertyType = clean(req.body?.propertyType || 'Single Family');
    const settings = await readAppSettings();
    const radius = Number(req.body?.radius || settings.home_value_default_radius || 3);
    const daysOld = Number(req.body?.daysOld || settings.home_value_default_days_old || 180);
    const compCount = Number(req.body?.compCount || settings.home_value_default_comp_count || 12);

    if (!address || !city) {
      return res.status(400).json({ message: 'Address and city are required.' });
    }

    if (!rentcastApiKey) {
      return res.status(503).json({ message: 'RENTCAST_API_KEY is not configured yet.' });
    }

    const params = new URLSearchParams({
      address: `${address}, ${city}, ${state}${zipCode ? ` ${zipCode}` : ''}`,
      propertyType,
      maxRadius: String(radius),
      daysOld: String(daysOld),
      compCount: String(compCount),
    });
    if (bedrooms > 0) params.set('bedrooms', String(bedrooms));
    if (bathrooms > 0) params.set('bathrooms', String(bathrooms));
    if (squareFootage > 0) params.set('squareFootage', String(squareFootage));

    const rentcastResponse = await fetch(`https://api.rentcast.io/v1/avm/value?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'X-Api-Key': rentcastApiKey,
      },
    });
    const usage = await incrementRentcastUsage();

    const payload = await rentcastResponse.json().catch(() => ({}));
    if (!rentcastResponse.ok) {
      return res.status(rentcastResponse.status || 502).json({
        message: payload?.message || 'Could not retrieve a home value estimate.',
        provider: 'rentcast',
        usage,
      });
    }

    return res.json({ provider: 'rentcast', estimate: payload, usage });
  } catch (error) {
    console.error('Home value estimate failed:', error);
    return res.status(500).json({ message: 'Could not retrieve a home value estimate.' });
  }
});

app.get('/api/availability', async (req, res) => {
  const rentalId = Number(req.query?.rentalId || 0);
  if (pgPool && rentalId > 0) {
    const rentalResult = await pgPool.query(
      `SELECT id, nightly_rate_cents, cleaning_fee_cents
       FROM rentals
       WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL
       LIMIT 1`,
      [rentalId],
    );
    const rental = rentalResult.rows[0];
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found.' });
    }
    const blocked = await getRentalBlockedRanges(rentalId);
    return res.json({
      blocked,
      nightlyRateCents: rental.nightly_rate_cents,
      cleaningFeeCents: rental.cleaning_fee_cents,
      currency: booking.currency,
      bookingEnabled: Boolean(stripe && rental.nightly_rate_cents > 0),
      airbnbSyncEnabled: false,
    });
  }

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
      return res.status(503).json({ message: "Online booking isn't available yet. Please join the interest list." });
    }
    
    const checkIn = clean(req.body?.checkIn);
    const checkOut = clean(req.body?.checkOut);
    const rentalId = Number(req.body?.rentalId || 0);
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

    let rentalRate = booking.nightlyRateCents;
    let cleaningFee = booking.cleaningFeeCents;
    let rentalTitle = 'Orlando vacation rental';

    if (pgPool && rentalId > 0) {
      const rentalResult = await pgPool.query(
        `SELECT id, title, nightly_rate_cents, cleaning_fee_cents
         FROM rentals
         WHERE id = $1 AND is_active = TRUE AND deleted_at IS NULL
         LIMIT 1`,
        [rentalId],
      );
      const rental = rentalResult.rows[0];
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found.' });
      }
      rentalRate = rental.nightly_rate_cents;
      cleaningFee = rental.cleaning_fee_cents;
      rentalTitle = rental.title;
    }

    if (!(rentalRate > 0)) {
      return res.status(503).json({ message: "Pricing isn't set up yet. Please join the interest list." });
    }

    const blocked = rentalId > 0 ? await getRentalBlockedRanges(rentalId) : await getAllBlockedRanges();
    if (overlapsBlocked(checkIn, checkOut, blocked)) {
      return res.status(409).json({ message: 'Some of those nights are no longer available. Please choose different dates.' });
    }

    const origin = buildOrigin(req);
    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: booking.currency,
          unit_amount: rentalRate * stay.nights,
          product_data: {
            name: `${rentalTitle} - ${stay.nights} night${stay.nights > 1 ? 's' : ''}`,
            description: `${checkIn} to ${checkOut}`,
          },
        },
      },
    ];
    if (cleaningFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: booking.currency,
          unit_amount: cleaningFee,
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
        rentalId: String(rentalId || ''),
        rentalTitle: metadataValue(rentalTitle),
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
    if (session.payment_status === 'paid') {
      if (session.metadata?.type === 'notary') {
        await persistNotaryRequest(session);
      } else if (session.metadata?.type === 'vacation') {
        await persistVacationBooking(session);
      }
    }
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
        subject: 'We received your message - Iris & J Holdings',
        text: `Hi ${name},\n\nThanks for reaching out to Iris & J Holdings. Daiana received your message and will follow up by email soon.\n\nIf your request is time-sensitive, you can call (908) 499-6320.\n\n- Iris & J Holdings`,
        html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for reaching out to Iris &amp; J Holdings. Daiana received your message and will follow up by email soon.</p><p>If your request is time-sensitive, you can call <a href="tel:19084996320">(908) 499-6320</a>.</p><p>- Iris &amp; J Holdings</p>`,
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

let cachedSeoShell = null;

async function readSeoShell() {
  if (cachedSeoShell) return cachedSeoShell;
  cachedSeoShell = await fs.readFile(path.join(__dirname, 'dist', 'index.html'), 'utf8');
  return cachedSeoShell;
}

function serverSeoForPath(pathname) {
  const normalized = normalizedSeoPath(pathname);
  if (normalized.startsWith('/admin') || normalized === '/booking-success' || normalized === '/notary-success' || normalized === '/invoice-success' || normalized === '/manage-booking' || normalized === '/vacation-rental-intake') {
    return {
      title: 'Iris & J Holdings',
      description: 'Iris & J Holdings',
      image: defaultSeoImage,
      robots: 'noindex,nofollow',
      canonicalPath: normalized,
      breadcrumb: 'Page',
    };
  }

  if (!publicSeoRoutes[normalized]) {
    return {
      title: 'Page Not Found | Iris & J Holdings',
      description: 'The requested page could not be found on Iris & J Holdings.',
      image: defaultSeoImage,
      robots: 'noindex,nofollow',
      canonicalPath: normalized,
      breadcrumb: 'Page Not Found',
    };
  }

  return {
    ...publicSeoRoutes[normalized],
    robots: 'index,follow',
    canonicalPath: canonicalPathForSeo(normalized),
  };
}

async function renderSeoShell(pathname) {
  const template = await readSeoShell();
  const seo = serverSeoForPath(pathname);
  const structuredData = structuredDataForPath(normalizedSeoPath(pathname), seo);
  const canonicalUrl = `${siteUrl}${seo.canonicalPath || '/'}`;

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
    .replace(/<meta(?=[^>]*name="description")[^>]*>/i, `<meta name="description" content="${escapeHtml(seo.description)}" />`)
    .replace(/<meta(?=[^>]*name="robots")[^>]*>/i, `<meta name="robots" content="${escapeHtml(seo.robots)}" />`)
    .replace(/<link(?=[^>]*rel="canonical")[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`)
    .replace(/<meta(?=[^>]*property="og:title")[^>]*>/i, `<meta property="og:title" content="${escapeHtml(seo.title)}" />`)
    .replace(/<meta(?=[^>]*property="og:description")[^>]*>/i, `<meta property="og:description" content="${escapeHtml(seo.description)}" />`)
    .replace(/<meta(?=[^>]*property="og:url")[^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`)
    .replace(/<meta(?=[^>]*property="og:image")[^>]*>/i, `<meta property="og:image" content="${escapeHtml(seo.image || defaultSeoImage)}" />`)
    .replace(/<meta(?=[^>]*name="twitter:title")[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`)
    .replace(/<meta(?=[^>]*name="twitter:description")[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`)
    .replace(/<meta(?=[^>]*name="twitter:image")[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(seo.image || defaultSeoImage)}" />`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">${escapeJsonForHtml(structuredData)}</script>`);
}

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nAllow: /\n\nSitemap: https://www.irisjholdings.com/sitemap.xml\n');
});

app.get('/sitemap.xml', (_req, res) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const indexedRoutes = Object.keys(publicSeoRoutes).filter((route) => route !== '/contact');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...indexedRoutes.map((route) => `  <url><loc>${siteUrl}${route === '/' ? '/' : route}</loc><lastmod>${lastmod}</lastmod></url>`),
    '</urlset>',
  ].join('\n');
  res.type('application/xml').send(xml);
});

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', async (req, res) => {
  try {
    const html = await renderSeoShell(req.path);
    res.type('html').send(html);
  } catch (error) {
    console.error('SEO shell render failed:', error);
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

async function startServer() {
  if (pgPool) {
    await ensureAdminTables();
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Iris & J Holdings server listening on ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

