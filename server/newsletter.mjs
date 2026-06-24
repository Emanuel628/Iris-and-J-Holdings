import crypto from 'node:crypto';
import { clean, escapeHtml, isValidEmail, normalizeEmail } from './lib/common.mjs';

function newsletterUnsubscribeToken(email, unsubscribeSecret) {
  return crypto.createHmac('sha256', unsubscribeSecret).update(normalizeEmail(email)).digest('hex');
}

function verifyNewsletterUnsubscribeToken(email, token, unsubscribeSecret) {
  const expected = newsletterUnsubscribeToken(email, unsubscribeSecret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(clean(token));
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function newsletterUnsubscribeUrl(email, siteUrl, unsubscribeSecret) {
  const params = new URLSearchParams({
    email: normalizeEmail(email),
    token: newsletterUnsubscribeToken(email, unsubscribeSecret),
  });
  return `${siteUrl}/newsletter/unsubscribe?${params.toString()}`;
}

async function subscribeEmail(email, name, source, { pgPool, ensureAdminTables }) {
  if (!pgPool) {
    throw new Error('Newsletter signup is not available yet.');
  }
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    throw new Error('A valid email address is required.');
  }
  await ensureAdminTables();
  const result = await pgPool.query(
    `INSERT INTO newsletter_subscribers (full_name, email, source, status, updated_at)
     VALUES ($1, $2, $3, 'active', NOW())
     ON CONFLICT (email) DO UPDATE
     SET full_name = CASE
           WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name
           ELSE newsletter_subscribers.full_name
         END,
         source = EXCLUDED.source,
         status = 'active',
         updated_at = NOW()
     RETURNING id`,
    [clean(name), normalizedEmail, clean(source) || 'website'],
  );
  return { ok: true, id: result.rows[0]?.id || 0 };
}

function newsletterHtml({ title, date, body, unsubscribeUrl }) {
  const s = (value) => escapeHtml(value);
  const bodyFont = 'font-family:Arial,Helvetica,sans-serif';
  const serif = "font-family:Georgia,'Times New Roman',serif";
  const paragraphs = clean(body)
    .split(/\n{2,}/)
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 16px;${bodyFont};font-size:16px;line-height:1.65;color:#3f4650">${s(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fbfaf7;${bodyFont}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbfaf7"><tr><td align="center" style="padding:28px 16px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fffefd;border:1px solid #e7dfd4;border-radius:12px;overflow:hidden">
      <tr><td style="padding:26px 32px 18px;border-bottom:1px solid #e7dfd4">
        <div style="${serif};font-size:24px;font-weight:600;letter-spacing:0.05em;color:#121820">Iris &amp; J Holdings</div>
        <div style="${bodyFont};font-size:11px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#a77931;margin-top:4px">Real Estate &middot; Mobile Notary &middot; Orlando Vacation Rentals</div>
      </td></tr>
      <tr><td style="padding:28px 32px">
        ${date ? `<div style="${bodyFont};font-size:12px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:#a77931;margin:0 0 8px">${s(date)}</div>` : ''}
        <h1 style="margin:0 0 20px;${serif};font-size:28px;line-height:1.15;font-weight:600;color:#121820">${s(title || 'Iris & J Holdings Newsletter')}</h1>
        ${paragraphs || `<p style="margin:0;${bodyFont};font-size:16px;line-height:1.65;color:#3f4650">No newsletter copy was provided.</p>`}
      </td></tr>
      <tr><td style="padding:20px 32px 26px;border-top:1px solid #e7dfd4;background:#f5efe6">
        <p style="margin:0 0 8px;${bodyFont};font-size:12px;line-height:1.6;color:#6f747b">Iris &amp; J Holdings &middot; Real estate through All Star Real Estate Agency, a licensed New Jersey real estate brokerage &middot; Mobile notary &amp; Orlando vacation rentals offered independently through Iris &amp; J Holdings.</p>
        <p style="margin:0;${bodyFont};font-size:12px;color:#6f747b">You are receiving this because you subscribed at irisjholdings.com. <a href="${s(unsubscribeUrl)}" style="color:#a77931">Unsubscribe immediately</a>.</p>
      </td></tr>
    </table>
  </td></tr></table>
  </body></html>`;
}

function newsletterResultPage({ title, message, siteUrl }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#fbfaf7;font-family:Arial,Helvetica,sans-serif;color:#121820"><main style="max-width:720px;margin:0 auto;padding:48px 20px"><section style="background:#fffefd;border:1px solid #e7dfd4;border-radius:14px;padding:32px;box-shadow:0 18px 45px rgba(18,24,32,0.08)"><p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#a77931">Newsletter</p><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.05">${escapeHtml(title)}</h1><p style="margin:0;font-size:16px;line-height:1.7;color:#3f4650">${escapeHtml(message)}</p><p style="margin:24px 0 0"><a href="${siteUrl}" style="display:inline-block;padding:14px 20px;background:#a77931;color:#fffefd;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-radius:999px">Return to site</a></p></section></main></body></html>`;
}

export function registerNewsletterRoutes(app, deps) {
  const {
    contactTo,
    ensureAdminTables,
    isRateLimited,
    pgPool,
    requireAdmin,
    resendApiKey,
    sendResendEmail,
    siteUrl,
    unsubscribeSecret,
  } = deps;

  app.post('/api/subscribe', async (req, res) => {
    try {
      const ip = req.ip || req.socket?.remoteAddress || 'unknown';
      if (isRateLimited(ip)) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
      }
      const email = clean(req.body?.email);
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }
      if (!pgPool) {
        return res.status(503).json({ message: 'The newsletter is not available yet.' });
      }
      const result = await subscribeEmail(email, clean(req.body?.name), 'website', { pgPool, ensureAdminTables });
      return res.status(200).json({ subscribed: true, already: result.already });
    } catch (error) {
      console.error('Subscribe failed:', error);
      return res.status(500).json({ message: 'Could not subscribe right now. Please try again.' });
    }
  });

  app.get('/api/newsletter/config', (_req, res) => {
    res.json({ enabled: Boolean(pgPool && resendApiKey) });
  });

  app.get('/api/admin/newsletter/config', async (req, res) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      await ensureAdminTables();
      const result = await pgPool.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'active')::int AS active_count,
                COUNT(*)::int AS total_count
         FROM newsletter_subscribers`,
      );
      return res.json({
        enabled: Boolean(pgPool && resendApiKey),
        activeCount: result.rows[0]?.active_count || 0,
        totalCount: result.rows[0]?.total_count || 0,
      });
    } catch (error) {
      console.error('Admin newsletter config load failed:', error);
      return res.status(500).json({ message: 'Could not load newsletter settings.' });
    }
  });

  app.post('/api/admin/newsletter/send', async (req, res) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      if (!pgPool || !resendApiKey) {
        return res.status(503).json({ message: 'Newsletter sending is not configured.' });
      }

      const title = clean(req.body?.title) || 'Iris & J Holdings Newsletter';
      const date = clean(req.body?.date);
      const body = clean(req.body?.body);
      if (!body) {
        return res.status(400).json({ message: 'Newsletter text is required.' });
      }

      await ensureAdminTables();
      const subscribersResult = await pgPool.query(
        `SELECT email
         FROM newsletter_subscribers
         WHERE status = 'active'
         ORDER BY created_at ASC`,
      );
      const recipients = subscribersResult.rows.map((row) => normalizeEmail(row.email)).filter(Boolean);
      if (!recipients.length) {
        return res.status(400).json({ message: 'There are no active subscribers yet.' });
      }

      const campaignInsert = await pgPool.query(
        `INSERT INTO newsletter_campaigns (title, subject, body, sent_by_email, recipient_count, status)
         VALUES ($1, $2, $3, $4, $5, 'sending')
         RETURNING id`,
        [title, title, body, normalizeEmail(admin.email), recipients.length],
      );
      const campaignId = campaignInsert.rows[0]?.id || 0;

      let sentCount = 0;
      for (const email of recipients) {
        await sendResendEmail({
          to: email,
          replyTo: contactTo,
          subject: title,
          text:
            `${title}\n` +
            `${date ? `${date}\n\n` : '\n'}` +
            `${body}\n\n` +
            `Unsubscribe immediately: ${newsletterUnsubscribeUrl(email, siteUrl, unsubscribeSecret)}`,
          html: newsletterHtml({ title, date, body, unsubscribeUrl: newsletterUnsubscribeUrl(email, siteUrl, unsubscribeSecret) }),
        });
        sentCount += 1;
      }

      await pgPool.query(
        `UPDATE newsletter_campaigns
         SET recipient_count = $2, status = 'sent', sent_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [campaignId, sentCount],
      );

      return res.json({ ok: true, campaignId, sentCount });
    } catch (error) {
      console.error('Admin newsletter send failed:', error);
      return res.status(500).json({ message: error instanceof Error ? error.message : 'Could not send the newsletter.' });
    }
  });

  app.get('/newsletter/unsubscribe', async (req, res) => {
    try {
      const email = normalizeEmail(req.query?.email);
      const token = clean(req.query?.token);
      if (!email || !token || !verifyNewsletterUnsubscribeToken(email, token, unsubscribeSecret)) {
        return res.status(400).type('html').send(newsletterResultPage({
          title: 'Unsubscribe link invalid',
          message: 'This unsubscribe link is invalid or has expired.',
          siteUrl,
        }));
      }
      if (!pgPool) {
        return res.status(503).type('html').send(newsletterResultPage({
          title: 'Newsletter unavailable',
          message: 'Newsletter preferences are not available right now.',
          siteUrl,
        }));
      }
      await ensureAdminTables();
      await pgPool.query(
        `UPDATE newsletter_subscribers
         SET status = 'unsubscribed', updated_at = NOW()
         WHERE email = $1`,
        [email],
      );
      return res.status(200).type('html').send(newsletterResultPage({
        title: 'You are unsubscribed',
        message: 'You will no longer receive Iris & J Holdings newsletter emails at this address.',
        siteUrl,
      }));
    } catch (error) {
      console.error('Newsletter unsubscribe failed:', error);
      return res.status(500).type('html').send(newsletterResultPage({
        title: 'Could not unsubscribe',
        message: 'There was a problem updating your newsletter preference. Please try again later.',
        siteUrl,
      }));
    }
  });

  return { subscribeEmail };
}
