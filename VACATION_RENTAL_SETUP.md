# Vacation rental booking setup

The Vacation Rentals page shows a live availability calendar (synced from Airbnb)
and takes bookings through Stripe Checkout. Until the variables below are set, the
calendar still renders but shows "online checkout is coming soon" and the interest
list is used instead.

## Railway variables

```txt
# Airbnb availability (Airbnb listing → Availability → Export Calendar → copy link)
AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/XXXXXXXX.ics?s=XXXX

# Stripe
STRIPE_SECRET_KEY=<your Stripe secret key>
STRIPE_WEBHOOK_SECRET=<your Stripe webhook signing secret>
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_URL=https://irisjholdings.com/booking-success?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=https://irisjholdings.com/vacation-rentals

# Pricing (in cents)
VACATION_RENTAL_NIGHTLY_RATE_CENTS=25000   # $250.00 / night
VACATION_RENTAL_CLEANING_FEE_CENTS=15000   # $150.00 cleaning fee
```

Notes:
- `STRIPE_SUCCESS_URL` must keep the literal `{CHECKOUT_SESSION_ID}` token — Stripe
  replaces it, and the confirmation page reads it back to show the booking details.
- If `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` are omitted, the server falls back to
  the current host (`/booking-success` and `/vacation-rentals`).

## Stripe webhook

In the Stripe dashboard → Developers → Webhooks, add an endpoint:

- URL: `https://<your-domain>/api/stripe/webhook`
- Event: `checkout.session.completed`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`. When a booking is paid, the
server emails the booking details to `CONTACT_TO_EMAIL` (see `EMAIL_SETUP.md`).

## How it fits together

1. `GET /api/availability` — fetches and caches the Airbnb iCal, returns blocked
   date ranges plus pricing for the calendar.
2. `POST /api/checkout` — validates the dates, re-checks them against the Airbnb
   calendar, then creates a Stripe Checkout Session and returns its URL.
3. `POST /api/stripe/webhook` — verifies the Stripe signature and emails Daiana on
   `checkout.session.completed`.
4. `/booking-success` — confirmation page shown after a successful payment.

## Mobile notary checkout (Stripe)

The Mobile Notary appointment form can also take payment through Stripe — the
same `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` already configured for vacation
rentals are reused. Add one variable for the notary booking fee:

```txt
NOTARY_FEE_CENTS=5000   # the mobile notary booking fee, in cents ($50.00)
```

- With `NOTARY_FEE_CENTS` set, the notary form goes to Stripe Checkout and the
  paid appointment emails Daiana (and the client a receipt) via the webhook.
- Until it's set, the notary form falls back to emailing the request (no payment).
