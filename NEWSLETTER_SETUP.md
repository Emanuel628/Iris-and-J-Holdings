# Newsletter setup

The newsletter uses **Resend Audiences** for subscribers and **Resend Broadcasts**
to send. Resend keeps one contact per email per audience, so a subscriber can
**never be added twice** and never gets duplicate sends.

## Railway variables (new)

```txt
# Already set for email:
RESEND_API_KEY=<your Resend API key>
RESEND_FROM_EMAIL=Iris & J Holdings <newsletter@yourdomain.com>

# New for the newsletter:
RESEND_AUDIENCE_ID=<the Resend Audience id for subscribers>
NEWSLETTER_ADMIN_TOKEN=<a private passcode you choose, e.g. a long random string>
```

To get `RESEND_AUDIENCE_ID`: in the Resend dashboard → **Audiences** → create an
audience (e.g. "Newsletter") → copy its ID.

## How it works

- **Subscribe** — `POST /api/subscribe { email }` adds the email to the audience.
  Re-subscribing the same email does nothing (Resend dedupes), so no doubles.
- **Opt-in on forms** — the small "Subscribe to Daiana's newsletter" checkbox on
  the Buy/Sell/Notary/Vacation/Contact forms subscribes the visitor when checked.
- **Compose & send** — go to **`/admin/newsletter`**. Write the title, date, text,
  add photo URLs and listing blocks, enter the **admin passcode**
  (`NEWSLETTER_ADMIN_TOKEN`), and press **Send newsletter**. It creates a Resend
  broadcast to the whole audience and sends it (each subscriber once, with an
  unsubscribe link).

## Notes
- Sending is blocked unless the passcode matches `NEWSLETTER_ADMIN_TOKEN`, so the
  `/admin/newsletter` page is safe to leave reachable.
- Photos/listings are added by **URL** (host images on Resend, your site, or any
  image host). True drag-and-drop file upload would need a storage provider
  (Cloudinary/S3) — not included.
- Until `RESEND_AUDIENCE_ID` is set, subscribe and send return a friendly
  "not available yet" and the admin page shows a notice.
