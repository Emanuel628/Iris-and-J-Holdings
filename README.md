# Iris & J Holdings Website

A full-stack website and lightweight operations platform for **Iris & J Holdings** — a New Jersey real estate guidance, mobile notary, and Orlando vacation rental brand led by **Daiana Castro, REALTOR® and Mobile Notary**.

Real estate services are presented through Daiana Castro and All Star Real Estate Agency. Mobile notary and vacation rental services are presented as separate Iris & J Holdings services.

---

## Current Status

**Status date:** June 23, 2026  
**Repository:** `Emanuel628/Iris-and-J-Holdings`  
**Branch:** `main`

This project is no longer just a simple brochure website.

The current repo contains:

- A public marketing website.
- A custom admin control center.
- PostgreSQL-backed records.
- Editable public site content.
- Vacation rental booking flows.
- Mobile notary paid booking flows.
- Stripe Checkout and Stripe webhook handling.
- Resend transactional email delivery.
- Newsletter signup, unsubscribe, and campaign tools.
- Admin media uploads.
- Rental availability management.
- Buyer and seller lead tools.
- RentCast-powered home value estimate tooling.
- SEO metadata, sitemap, robots.txt, structured data, and server-side SEO shell rendering.

The old README language that described this as an 11-page static site with no admin, no database, and only one `/api/contact` endpoint is outdated. The current app is a full-stack service website with operational tools.

This README documents what is currently implemented in the repo. It does not claim that every external service is live in production; several systems require environment variables and service credentials before they work on a deployed server.

---

## Product Direction

The site is designed to feel:

- Simple
- Airy
- Spacious
- Premium
- Warm
- Human
- Trustworthy
- Easy to understand

The homepage should not explain every business feature at once. It should help visitors choose the right path quickly, then send them to the correct page.

Primary visitor paths:

1. Buy a home in New Jersey.
2. Sell a home in New Jersey.
3. Request a home value review.
4. Book a mobile notary appointment.
5. Ask a general question or book a call.
6. View and book Orlando vacation rental availability.
7. Subscribe to updates and request resources.

---

## Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- Standard CSS files
- `lucide-react` icons
- Custom path-based routing in `src/App.tsx`
- No React Router dependency

### Backend

- Node.js
- Express
- PostgreSQL through `pg`
- Stripe
- Resend email API
- Multer for image uploads
- Custom server-side SEO rendering

### Storage

- PostgreSQL for admin users, sessions, site content, rentals, bookings, notary requests, invoices, newsletter subscribers, campaigns, uploaded media, buyer/seller records, app settings, and home value estimates.
- Uploaded admin media is currently stored in PostgreSQL as `BYTEA` and served through `/uploads/:storageKey`.

### Deployment Model

- `npm run build` creates the Vite production build.
- `npm start` runs `server.mjs`.
- The Express server serves both the built frontend and the API.
- Railway is the intended deployment target based on the existing `railway.json` setup.

---

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm start
```

- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript checking and builds the frontend.
- `npm run preview` previews the built frontend with Vite.
- `npm start` runs the Express server.

---

## App Architecture

### Frontend Entry

- `src/main.tsx` renders the React app.
- Global CSS is imported there:
  - `global.css`
  - `overrides.css`
  - `viewport-toggle.css`
  - `enhancements.css`
  - `hero-images.css`

### Routing

Routes are mapped manually in `src/App.tsx`.

The router:

- Normalizes trailing slashes.
- Maps exact paths to page components.
- Falls back to `NotFound` when a route is not found.
- Shows the `ViewportModeToggle` globally.
- Shows the `AccessibilityWidget` only on `/accessibility`.

### Public Layout

Public pages use:

- `PublicLayout`
- `Header`
- `Footer`
- Skip link for accessibility

The header and footer are partially editable through the site content system.

### Admin Layout

Admin pages use `AdminLayout` and call `/api/admin/me` to verify the admin session. If no valid session exists, admin pages redirect to `/admin/login`.

---

## Public Routes

| Route | Purpose |
|---|---|
| `/` | Homepage funnel with hero, service selector, trust section, process steps, testimonials, newsletter bar, and final CTA. |
| `/buy` | Buyer guidance page with buyer consultation CTA and brokerage disclosures. |
| `/sell` | Seller strategy page with seller request form and newsletter opt-in. |
| `/home-value` | Public home value review request form. This is an intake form, not the RentCast estimator UI. |
| `/mobile-notary` | Mobile notary service page with paid booking request form and FAQ. |
| `/resources` | Buyer guide, seller guide, market updates, and newsletter signup. |
| `/about` | About Daiana page with professional focus, contact details, social links, and service separation disclosure. |
| `/book` | Main contact and appointment request page. |
| `/contact` | Alias for `/book`; canonical URL points to `/book`. |
| `/vacation-rentals` | Public Orlando vacation rental page with availability calendar, amenities, photos, FAQs, and question form. |
| `/vacation-rental-intake` | Guest intake step before vacation rental Stripe checkout. Noindexed. |
| `/booking-success` | Vacation rental payment success page. Noindexed. |
| `/notary-success` | Notary booking payment success page. Noindexed. |
| `/invoice-success` | Invoice payment success page. Noindexed. |
| `/manage-booking` | Guest/signer booking management request page. Noindexed. |
| `/house-rules` | Vacation rental house rules. |
| `/refund-cancellation-policy` | Refund, cancellation, rescheduling, and no-show policy. |
| `/privacy` | Privacy policy. |
| `/terms` | Terms of use and service disclosures. |
| `/accessibility` | Accessibility and fair housing page. |

---

## Admin Routes

| Route | Purpose |
|---|---|
| `/admin/register` | First admin account creation. Registration closes after the first admin user exists. |
| `/admin/login` | Admin sign-in. |
| `/admin/forgot-password` | Starts password reset by email. |
| `/admin/reset-password` | Completes password reset. |
| `/admin/confirm-email-change` | Confirms admin email change token. |
| `/admin` | Control Center dashboard. |
| `/admin/rentals` | Rental listing management, pricing, amenities, gallery image URLs/captions/groups, active status, and manual blocked dates. |
| `/admin/vacation-bookings` | Vacation booking queue and reservation record management. |
| `/admin/notary-requests` | Paid notary booking request queue and appointment record management. |
| `/admin/invoices` | Quote/invoice creation, Stripe payment links, invoice status changes, and approval into queues. |
| `/admin/media` | Media library and image upload management. |
| `/admin/newsletter` | Newsletter subscribers, send campaign, and campaign history. |
| `/admin/settings` | App settings, service configuration status, admin email/password controls, and estimator defaults. |
| `/admin/site-content` | Edit public page copy and hero image URLs. |
| `/admin/realtor-tools` | Buyer and seller intake record tools. |
| `/admin/home-value-lab` | RentCast-powered home value estimate tool, comparables email, saved estimate history, and estimator defaults. |

---

## Main Public Website Features

### Homepage Funnel

The homepage is intentionally simple.

It currently includes:

- Hero section.
- Service selector.
- Trust/approach section.
- Three-step process section.
- Testimonials section.
- Newsletter bar.
- Final call to action.

The homepage points visitors to dedicated pages instead of trying to explain the whole business on one screen.

### Buyer Page

The buyer page explains how Daiana helps buyers prepare, search, and move forward.

Implemented details:

- SEO title, description, and JSON-LD service schema.
- Editable hero and intro copy through the content system.
- Hero image support.
- Brokerage relationship notice.
- Buyer consultation CTA that routes to `/book` with query parameters.

### Seller Page

The seller page is a lead-capture page for seller strategy calls.

Implemented details:

- SEO title, description, and JSON-LD service schema.
- Editable hero and intake copy.
- Seller request form.
- Honeypot spam field.
- Newsletter opt-in checkbox.
- Brokerage relationship and New Jersey disclosure notice.
- CTA to the home value page.

### Home Value Public Page

The public home value page currently collects a request by form.

Implemented details:

- Public form for name, email, phone, property type, address, city/town, timeline, and updates/details.
- Honeypot spam field.
- Newsletter opt-in.
- Clear disclaimer that the review is not an appraisal, BPO for lending, guarantee, or professional advice.

Important distinction:

- The public `/home-value` page is an intake/request form.
- The actual RentCast estimator is in the admin-only `/admin/home-value-lab` page.

### Mobile Notary Page

The mobile notary page explains service area, document expectations, booking fee, and limitations.

Implemented details:

- LocalBusiness / ProfessionalService JSON-LD.
- FAQ JSON-LD.
- FAQ section.
- Public paid booking request form.
- Stripe Checkout integration through `/api/notary-checkout`.
- Terms and refund/cancellation checkbox.
- Confirmation and admin notification emails after payment webhook/session sync.
- Admin notary queue after payment is persisted.

### Resources Page

The resources page gives visitors lower-pressure conversion paths.

Implemented resources:

- Buyer Guide request.
- Seller Guide request.
- Market Updates request.
- Newsletter signup.

The resource cards route to `/book` with prefilled service and message query parameters.

### About Page

The about page builds trust around Daiana.

Implemented details:

- Person / RealEstateAgent JSON-LD.
- Portrait image support.
- Contact information.
- Professional focus list.
- Social links.
- Disclaimer separating real estate brokerage, mobile notary, and vacation rentals.

### Book / Contact Page

The book page is the main general contact and appointment-routing page.

Implemented details:

- Appointment type cards.
- Query-string prefill for `service` and `message`.
- Auto-scroll to the form when relevant query params or `#contact-form` are present.
- General contact form.
- Honeypot spam field.
- Newsletter opt-in.
- Legal notice explaining that submitting a form does not create brokerage, listing, buyer agency, notary appointment, or vacation rental booking.

---

## Forms and Email System

Public contact-style forms use `useContactForm`.

Frontend behavior:

- Prevents normal browser submit.
- Reads form fields into a plain object.
- Ignores fields that start with `_`.
- Uses `_gotcha` as a honeypot.
- Sends the payload to `/api/contact`.
- Shows inline success/error status.

Backend behavior:

- `/api/contact` rate-limits requests by IP.
- Requires name and email.
- Sends the submitted fields to the configured contact email through Resend.
- Sends the visitor a confirmation email.
- If newsletter opt-in is present, subscribes the visitor in the background.

Current contact recipient default:

- `CONTACT_TO_EMAIL`, defaulting to `listingsbyd@gmail.com` if not set.

---

## Newsletter System

There are two newsletter signup paths:

1. Dedicated newsletter form on `/resources` and other newsletter areas.
2. Checkbox opt-in inside contact/service forms.

Implemented endpoints and behavior:

- `/api/newsletter/subscribe` subscribes a visitor and sends admin/visitor emails when Resend is configured.
- `/api/subscribe` is also registered as a lightweight subscribe endpoint used by the notary booking component.
- `/newsletter/unsubscribe` verifies an HMAC token and removes the subscriber.
- `/api/newsletter/config` tells the frontend whether newsletter signup is configured.
- `/api/admin/newsletter/config` returns active and total subscriber counts.
- `/api/admin/newsletter/send` sends a campaign to active subscribers and records the campaign.
- `/api/admin/newsletter/campaigns` lists campaign history.
- `/api/admin/newsletter/campaigns/:id` deletes a campaign record.

Database tables:

- `newsletter_subscribers`
- `newsletter_campaigns`

---

## Vacation Rental System

The vacation rental system is one of the largest features in the repo.

### Public Rental Page

The `/vacation-rentals` page:

- Fetches active rentals from `/api/public-rentals`.
- Supports multiple active rentals.
- Lets the visitor cycle between rentals.
- Shows rental title, description, location, max guests, amenities, hero image, grouped gallery photos, captions, and FAQ.
- Displays a legal notice that rentals are independent from brokerage services.

### Availability Calendar

`VacationBookingCalendar`:

- Fetches availability from `/api/availability`.
- Supports a rental-specific `rentalId`.
- Shows open, booked, selected, and range dates.
- Prevents selecting past dates and blocked dates.
- Calculates nights, nightly rate, cleaning fee, and total.
- Sends the visitor to `/vacation-rental-intake` with selected dates.

### Availability Sources

Availability can combine:

- Manual admin blocked dates.
- Website bookings stored in PostgreSQL.
- Airbnb iCal ranges from `AIRBNB_ICAL_URLS` / `AIRBNB_ICAL_URL`.

Rental-specific availability uses that rental's manual blocks and website bookings.

### Guest Intake

`/vacation-rental-intake`:

- Reads check-in, check-out, and rental ID from query parameters.
- Requires primary guest name, email, and phone.
- Allows adding additional guests up to 10 total guests.
- Requires scrolling through the house rules box before the agreement checkbox unlocks.
- Requires agreement to Terms, House Rules, and Refund/Cancellation Policy.
- Starts Stripe Checkout through `/api/checkout`.

### Vacation Stripe Checkout

`/api/checkout`:

- Requires Stripe to be configured.
- Validates stay dates.
- Validates guest information and policy agreement.
- Pulls rental pricing from the selected rental record when `rentalId` is provided.
- Adds nightly stay and cleaning fee line items.
- Prevents checkout if selected dates overlap blocked dates.
- Stores booking details in Stripe metadata.
- Redirects to `/booking-success` by default after payment.

### Vacation Booking Persistence

After payment:

- The Stripe webhook listens for `checkout.session.completed`.
- Vacation sessions are persisted into `vacation_bookings`.
- Admin and guest notification emails are sent.
- A signed manage-booking link is included.
- Recent paid Stripe sessions are also periodically synced to repair missed webhook persistence.

---

## Mobile Notary Booking System

The mobile notary system uses a paid booking/travel fee flow.

Frontend:

- The public notary form collects name, email, phone, city/town, preferred date, preferred time, document type, and notes.
- Time options are generated from 9:00 AM through 6:00 PM in 15-minute increments.
- Visitor must agree to Terms and Refund/Cancellation Policy.
- Form posts to `/api/notary-checkout`.

Backend:

- Requires Stripe configuration.
- Requires `NOTARY_BOOKING_FEE_CENTS` to be configured.
- Validates time format and allowed range.
- Creates a Stripe Checkout session.
- Uses Stripe metadata to carry appointment details.
- Redirects to `/notary-success` by default after payment.

Persistence and email:

- The Stripe webhook persists paid notary sessions into `notary_requests`.
- Admin and visitor notification emails are sent.
- A signed manage-booking link is included.
- Admin can manage records in `/admin/notary-requests`.

---

## Booking Management System

Paid vacation and notary confirmation emails include a signed manage-booking link.

The link uses:

- Stripe session ID.
- HMAC token generated from a management secret.

Implemented routes:

- `/api/manage-booking-session`
- `/api/manage-booking-request`
- `/manage-booking`

Visitors can submit change/cancellation/reschedule requests. The request is not automatically approved. The system emails Daiana and sends a confirmation email to the visitor.

---

## Quotes and Invoices System

The admin invoices system supports paid service invoices for vacation rentals and notary appointments.

Implemented features:

- Admin can create or update invoice records.
- Service types are `vacation` and `notary`.
- Vacation invoices require check-in and check-out dates.
- Notary invoices require appointment date and time.
- Admin can send a Stripe payment link by email.
- Invoice status can be changed between draft, sent, paid, approved, and cancelled.
- Paid invoice sessions can be marked from Stripe webhook/session sync.
- Approved invoices can flow into the corresponding vacation booking or notary request queue.
- Cancelled invoices can update linked booking/request records to cancelled.

Database table:

- `admin_invoices`

---

## Admin Control Center

The admin dashboard at `/admin` provides a working operations overview.

Implemented features:

- Admin session validation.
- Summary cards for rentals, vacation queue, and notary queue.
- Upcoming reminders from future vacation stays and notary requests.
- Sort reminders by upcoming, type, or name.
- Edit links into the relevant queue.
- Delete flow requiring the admin to type `DELETE`.
- Auto-refresh every 15 seconds.
- Route map to all major admin tools.

---

## Admin Authentication and Security

Implemented admin auth features:

- First-admin registration.
- Registration closes after an admin user exists.
- Login with email and password.
- Password hashing with Node crypto `scryptSync` and a random salt.
- Admin session tokens hashed with SHA-256 in the database.
- HttpOnly cookie sessions.
- Secure cookies in production.
- Session expiration controlled by `ADMIN_SESSION_DAYS`.
- Login rate limiting by IP and email.
- Password reset by emailed token.
- Email change confirmation by emailed token.
- Logout endpoint.

Tables:

- `admin_users`
- `admin_sessions`
- `admin_password_reset_tokens`
- `admin_email_change_tokens`

---

## Admin Rentals and Media

Rental management supports:

- Create/update rental records.
- Soft-delete rentals.
- Slug, title, location label, description.
- Nightly rate and cleaning fee.
- Max guest count.
- Hero image URL.
- Hero image captions.
- Gallery image URLs.
- Gallery captions.
- Gallery image groups.
- Amenities.
- Active/inactive status.
- Manual blocked dates.

Media management supports:

- Admin-only image upload.
- 50 MB upload limit.
- Allowed image types: PNG, JPG, JPEG, WebP, GIF, SVG, AVIF, HEIC, HEIF.
- Storage in PostgreSQL `uploaded_media` table.
- Served through `/uploads/:storageKey` with long cache headers.

---

## Admin Site Content System

The site content system lets the admin edit selected public text and hero image URLs without changing code.

Frontend wiring:

- `siteContentTemplates` defines editable fields, default values, page keys, and categories.
- Public pages call `usePublicSiteContent(pageKey, defaults)`.
- The hook fetches `/api/site-content-public?pageKey=...`.
- If no database content exists, the page uses its coded defaults.

Editable areas include:

- Home
- Buy
- Sell
- Home Value
- Mobile Notary
- Vacation Rentals
- About
- Resources
- Book / Contact
- Header
- Footer
- Terms
- Privacy
- Accessibility & Fair Housing
- Refund & Cancellation Policy
- House Rules

Database table:

- `site_content`

---

## Realtor Tools

The admin Realtor Tools area tracks buyer and seller intake records.

Buyer records include:

- Client name
- Email
- Phone
- Target areas
- Budget min/max
- Timeline
- Financing status
- Approval status
- Notes

Seller records include:

- Client name
- Email
- Phone
- Property address
- Target price
- Timeline
- Occupancy status
- Notes

Tables:

- `buyer_leads`
- `seller_leads`

---

## Home Value Lab

The admin-only Home Value Lab is a RentCast-powered estimator workflow.

Implemented features:

- Address, city, state, ZIP, bedrooms, bathrooms, square footage, and property type input.
- RentCast AVM call through `/api/home-value-estimate`.
- Configurable estimator defaults:
  - radius
  - days old
  - comp count
- RentCast usage card.
- Comparable sales display.
- Google search link for addresses.
- Email comparable results through `/api/admin/home-value-email`.
- Save valuation result through `/api/admin/home-value-estimates/save`.
- Saved estimate history through `/api/admin/home-value-estimates`.

Tables/settings:

- `home_value_estimates`
- `app_settings`
- `RENTCAST_API_KEY`

Important distinction:

- This is an admin tool.
- The public home value page is still a request form.

---

## SEO System

SEO is handled in two layers.

### Client-side SEO

`usePageMeta` sets:

- Page title.
- Meta description.
- Canonical URL.
- Robots meta.
- Open Graph tags.
- Twitter card tags.
- Optional JSON-LD structured data.

### Server-side SEO Shell

`server/seo.mjs` rewrites `dist/index.html` before serving public routes.

It injects:

- Title.
- Description.
- Robots.
- Canonical URL.
- Open Graph tags.
- Twitter tags.
- JSON-LD structured data.

It also serves:

- `/robots.txt`
- `/sitemap.xml`

Admin, success, manage-booking, and vacation-intake routes are noindexed.

The server also redirects the apex domain `irisjholdings.com` to `www.irisjholdings.com` for GET/HEAD requests.

---

## Database Tables Created by the Server

`ensureAdminTables()` creates or updates these tables when `DATABASE_URL` is configured:

- `admin_users`
- `admin_sessions`
- `admin_password_reset_tokens`
- `admin_email_change_tokens`
- `rentals`
- `uploaded_media`
- `blocked_dates`
- `site_content`
- `vacation_bookings`
- `notary_requests`
- `admin_invoices`
- `buyer_leads`
- `seller_leads`
- `newsletter_subscribers`
- `newsletter_campaigns`
- `app_settings`
- `home_value_estimates`

The server also seeds:

- Initial Orlando vacation rental record if not already seeded.
- Default `site_content` rows.
- Default home value estimator settings.

---

## Main Backend Endpoints

### Public / System

- `GET /health`
- `GET /robots.txt`
- `GET /sitemap.xml`
- `GET /uploads/:storageKey`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`
- `POST /api/subscribe`
- `GET /api/newsletter/config`
- `GET /newsletter/unsubscribe`
- `GET /api/public-rentals`
- `GET /api/availability`
- `POST /api/checkout`
- `POST /api/notary-checkout`
- `GET /api/checkout-session`
- `GET /api/manage-booking-session`
- `POST /api/manage-booking-request`
- `POST /api/home-value-estimate`
- `POST /api/stripe/webhook`

### Admin Auth

- `GET /api/admin/me`
- `POST /api/admin/register`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/forgot-password`
- `POST /api/admin/reset-password`
- `POST /api/admin/change-password`
- `POST /api/admin/change-email-request`
- `POST /api/admin/confirm-email-change`

### Admin Operations

- `GET /api/admin/dashboard`
- `GET /api/admin/rentals`
- `POST /api/admin/rentals`
- `POST /api/admin/rentals/delete`
- `GET /api/admin/blocked-dates`
- `POST /api/admin/blocked-dates`
- `POST /api/admin/blocked-dates/delete`
- `GET /api/admin/site-content`
- `POST /api/admin/site-content`
- `GET /api/admin/vacation-bookings`
- `POST /api/admin/vacation-bookings/save`
- `POST /api/admin/vacation-bookings/delete`
- `GET /api/admin/notary-requests`
- `POST /api/admin/notary-requests/save`
- `POST /api/admin/notary-requests/delete`
- `GET /api/admin/buyer-leads`
- `POST /api/admin/buyer-leads`
- `POST /api/admin/buyer-leads/delete`
- `GET /api/admin/seller-leads`
- `POST /api/admin/seller-leads`
- `POST /api/admin/seller-leads/delete`
- `GET /api/admin/newsletter-subscribers`
- `POST /api/admin/newsletter-subscribers/status`
- `DELETE /api/admin/newsletter-subscribers/:id`
- `GET /api/admin/newsletter/config`
- `POST /api/admin/newsletter/send`
- `GET /api/admin/newsletter/campaigns`
- `DELETE /api/admin/newsletter/campaigns/:id`
- `GET /api/admin/invoices`
- `POST /api/admin/invoices/save`
- `POST /api/admin/invoices/send`
- `POST /api/admin/invoices/status`
- `POST /api/admin/invoices/delete`
- `POST /api/admin/upload-image`
- `GET /api/admin/settings`
- `POST /api/admin/settings`
- `POST /api/admin/home-value-email`
- `GET /api/admin/home-value-estimates`
- `POST /api/admin/home-value-estimates/save`

---

## Environment Variables

The app can run with partial functionality, but full production use requires configuration.

### Core

```bash
PORT=8080
NODE_ENV=production
DATABASE_URL=
CONTACT_TO_EMAIL=listingsbyd@gmail.com
ADMIN_SESSION_DAYS=14
```

### Email / Resend

```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL="Iris & J Holdings <onboarding@resend.dev>"
NEWSLETTER_UNSUBSCRIBE_SECRET=
```

### Stripe

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=usd
STRIPE_SUCCESS_URL=
STRIPE_CANCEL_URL=
```

### Vacation Rentals

```bash
VACATION_RENTAL_NIGHTLY_RATE_CENTS=
VACATION_RENTAL_CLEANING_FEE_CENTS=
AIRBNB_ICAL_URLS=
AIRBNB_ICAL_URL=
```

### Notary

```bash
NOTARY_CURRENCY=usd
NOTARY_BOOKING_FEE_CENTS=
NOTARY_SUCCESS_URL=
NOTARY_CANCEL_URL=
```

### RentCast

```bash
RENTCAST_API_KEY=
```

### Booking Management

```bash
MANAGE_BOOKING_SECRET=
```

If `MANAGE_BOOKING_SECRET` is not set, the server falls back to other configured secrets. A dedicated secret is recommended for production.

---

## Security and Spam Controls

Implemented controls:

- Public contact/newsletter rate limiting.
- Admin login rate limiting.
- Honeypot fields on public contact forms.
- Password hashing with salt.
- Hashed admin session tokens.
- HttpOnly admin session cookie.
- Secure cookies in production.
- Password reset tokens with expiration and one-time use.
- Email change tokens with expiration and one-time use.
- Stripe webhook signature verification.
- HMAC tokens for manage-booking links.
- Admin-only image uploads.
- `DELETE` confirmation prompts for destructive admin actions.

---

## Current File Structure

```text
Iris-and-J-Holdings/
  README.md
  EMAIL_SETUP.md
  package.json
  index.html
  server.mjs
  railway.json
  vite.config.ts
  tsconfig.json
  server/
    airbnb.mjs
    newsletter.mjs
    seo.mjs
    lib/
      common.mjs
  src/
    main.tsx
    App.tsx
    components/
      admin/
      booking/
      layout/
      sections/
      ui/
    content/
      vacationHouseRules.ts
    lib/
      adminAuth.ts
      siteContent.ts
      useContactForm.ts
      usePageMeta.ts
    pages/
      admin/
        AdminConfirmEmailChange.tsx
        AdminControlCenter.tsx
        AdminForgotPassword.tsx
        AdminHomeValueLab.tsx
        AdminInvoices.tsx
        AdminLogin.tsx
        AdminMediaLibrary.tsx
        AdminNewsletter.tsx
        AdminNotaryRequests.tsx
        AdminRealtorTools.tsx
        AdminRegister.tsx
        AdminRentals.tsx
        AdminResetPassword.tsx
        AdminSettings.tsx
        AdminSiteContent.tsx
        AdminVacationBookings.tsx
      public/
        About.tsx
        BookContact.tsx
        BookingSuccess.tsx
        Buy.tsx
        Home.tsx
        HomeValue.tsx
        HouseRules.tsx
        InvoiceSuccess.tsx
        ManageBooking.tsx
        MobileNotary.tsx
        NotarySuccess.tsx
        NotFound.tsx
        PrivacyPolicy.tsx
        RefundCancellationPolicy.tsx
        Resources.tsx
        Sell.tsx
        TermsOfUse.tsx
        VacationRentalIntake.tsx
        VacationRentals.tsx
    styles/
      animations.css
      base.css
      enhancements.css
      footer-position-fix.css
      global.css
      hero-images.css
      layout.css
      overrides.css
      tokens.css
      viewport-toggle.css
  public/
    favicon.svg
    equal-housing-opportunity.svg
    images/
      site/
    icons/
```

---

## Current Launch / QA Checklist

Before treating this as production-final, verify:

1. `npm run build` passes.
2. Railway deployment has all required environment variables.
3. PostgreSQL tables are created successfully on startup.
4. First admin user can register, then registration closes.
5. Admin login, logout, password reset, and email change work.
6. Resend sender domain is verified and not using the default onboarding sender in production.
7. Contact forms deliver admin and visitor emails.
8. Newsletter signup, campaign send, and unsubscribe work.
9. Stripe webhook is configured to the deployed `/api/stripe/webhook` URL.
10. Vacation checkout works in Stripe test mode.
11. Vacation booking persists into admin queue after payment.
12. Notary checkout works in Stripe test mode.
13. Notary request persists into admin queue after payment.
14. Invoice payment link flow works.
15. Paid invoices sync correctly from Stripe.
16. Manage-booking links work from confirmation emails.
17. Uploaded media displays correctly from `/uploads/:storageKey`.
18. Rental gallery images, captions, and groups render correctly.
19. Manual blocked dates prevent checkout overlap.
20. Airbnb iCal blocked dates load when configured.
21. RentCast estimator works with the configured API key.
22. SEO routes render correct server-side metadata.
23. `/robots.txt` and `/sitemap.xml` are correct.
24. Privacy, Terms, Fair Housing, Accessibility, Refund/Cancellation, House Rules, and notary language are reviewed by the appropriate broker/legal/compliance professional.
25. Mobile views are tested on real devices.
26. Accessibility is checked beyond visual review.

---

## Known Product Notes

- The public site has no visitor login system.
- Admin login exists only for site/operator management.
- Public contact submissions are emailed; they are not generally stored as lead records unless a specific system stores them, such as newsletter, vacation bookings, notary requests, invoices, buyer/seller admin tools, or home value estimates.
- The public home value page is a request form. The data-backed RentCast estimator is admin-only.
- Payment flows depend on Stripe configuration.
- Email flows depend on Resend configuration.
- Availability sync depends on configured Airbnb iCal URLs and database records.
- The legal/compliance copy is implemented in code but should be reviewed by a qualified professional before launch.

---

## Project Value Summary

This repo now represents a custom service-business platform, not a template website.

It combines:

- Public brand website.
- Lead generation.
- Booking intake.
- Payment collection.
- Admin operations dashboard.
- Vacation rental management.
- Mobile notary queue.
- Invoice workflow.
- Newsletter CRM-lite tools.
- Editable content system.
- SEO infrastructure.
- Real estate support tools.
- Home value estimate workflow.

That makes the project closer to a small custom web application than a standard real estate website.
