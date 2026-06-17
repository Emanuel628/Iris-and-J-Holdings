# Email setup with Resend

The website forms post to `/api/contact` on the Railway app. The production server sends the message with Resend.

Add these Railway variables:

```txt
RESEND_API_KEY=<your Resend API key>
RESEND_FROM_EMAIL=Iris & J Holdings <verified-sender@yourdomain.com>
CONTACT_TO_EMAIL=listingsbyd@gmail.com
```

Notes:

- `RESEND_API_KEY` comes from the Resend dashboard.
- `RESEND_FROM_EMAIL` must be a sender/domain verified in Resend for production sending.
- `CONTACT_TO_EMAIL` is where Daiana receives the website leads.
- The visitor email is used as `reply_to`, so Daiana can reply directly to the person who submitted the form.

After adding the variables, redeploy Railway and test `/book`.

Expected behavior:

1. Fill out the form.
2. Click Send Message.
3. Button changes to Sending...
4. The page shows Message sent.
5. Daiana receives the email at listingsbyd@gmail.com.
