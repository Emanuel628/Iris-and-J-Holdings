import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 8080);
const contactTo = process.env.CONTACT_TO_EMAIL || 'listingsbyd@gmail.com';
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL || 'Iris & J Holdings <onboarding@resend.dev>';

app.set('trust proxy', 1);
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

app.get('/health', (_req, res) => {
  res.json({ ok: true });
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
