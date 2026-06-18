import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function RefundCancellationPolicy() {
  usePageMeta(
    'Refund & Cancellation Policy',
    'Refund, cancellation, rescheduling, and no-show policy for Iris & J Holdings mobile notary booking fees and Orlando vacation rental bookings.',
  );

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Refund &amp; Cancellation Policy</p>
            <h1>Clear terms before you pay.</h1>
            <p>
              This policy explains how refunds, cancellations, rescheduling, and no-shows are handled for mobile
              notary booking / travel fees and Orlando vacation rental bookings through Iris &amp; J Holdings.
            </p>
          </div>
          <div className="page-hero-visual" aria-hidden="true" />
        </section>

        <section className="page-content legal-copy">
          <article>
            <h2>Effective date</h2>
            <p>Effective Date: June 18, 2026.</p>
          </article>

          <article id="mobile-notary">
            <h2>Mobile notary booking / travel fee</h2>
            <p>
              The mobile notary booking / travel fee is paid when you submit an appointment request. Payment sends
              the request for review, but the appointment is not final until Daiana confirms the time, location,
              service area, document type, signer requirements, and any separate notary fees by email.
            </p>
            <ul>
              <li>If Daiana cannot accept the appointment or cannot serve the request, the booking / travel fee is refunded.</li>
              <li>Cancellations made 24 or more hours before the confirmed appointment may be refunded or applied to one rescheduled appointment.</li>
              <li>Cancellations made less than 24 hours before the confirmed appointment may be non-refundable.</li>
              <li>No-shows may be non-refundable.</li>
              <li>
                If the notarial act cannot be completed after arrival because a signer is missing, valid ID is not
                available, the signer is unwilling or unable to sign, the document is not ready, or legal / signer /
                document / identification requirements cannot be satisfied, the booking / travel fee may be non-refundable.
              </li>
            </ul>
          </article>

          <article id="vacation-rentals">
            <h2>Vacation rental bookings</h2>
            <p>
              A vacation rental booking is not confirmed until payment is completed and a booking confirmation is
              issued. Availability and pricing may change until payment is completed.
            </p>
            <ul>
              <li>Cancellations 14 or more days before check-in are eligible for a full refund.</li>
              <li>Cancellations 7 to 13 days before check-in are eligible for a 50% refund.</li>
              <li>Cancellations less than 7 days before check-in may be non-refundable.</li>
              <li>No-shows and same-day cancellations may be non-refundable.</li>
              <li>The cleaning fee is refunded if the guest cancels before check-in and does not stay at the property.</li>
              <li>If Iris &amp; J Holdings or the host cancels the booking, the guest receives a full refund.</li>
            </ul>
          </article>

          <article>
            <h2>Refund processing</h2>
            <p>
              Approved refunds are returned to the original payment method. Stripe and the guest&apos;s bank or card
              provider control the exact timing after a refund is issued. Processing times may vary.
            </p>
          </article>

          <article>
            <h2>Questions</h2>
            <p>
              Questions about refunds, cancellations, or rescheduling can be sent to{' '}
              <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a> or by calling{' '}
              <a href="tel:19084996320">(908) 499-6320</a>.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default RefundCancellationPolicy;
