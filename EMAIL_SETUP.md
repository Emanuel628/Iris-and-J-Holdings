# Email setup

The website forms post to `/api/contact` on the Railway app. The production server sends the message to Daiana by email.

Add these Railway variables:

```txt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=listingsbyd@gmail.com
SMTP_PASS=<Google app password>
SMTP_FROM=Iris & J Holdings <listingsbyd@gmail.com>
CONTACT_TO_EMAIL=listingsbyd@gmail.com
```

After adding the variables, redeploy Railway and test `/book`.

Expected behavior:

1. Fill out the form.
2. Click Send Message.
3. Button changes to Sending...
4. The page shows Message sent.
5. Daiana receives the email at listingsbyd@gmail.com.

Do not use the regular Gmail account password. Use a Google app password for SMTP.
