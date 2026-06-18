import { useEffect, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

type SessionInfo = {
  status: string;
  amountTotal: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  email: string;
};

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function BookingSuccess() {
  usePageMeta('Booking Status', 'Your Orlando vacation rental booking status.', { robots: 'noindex,nofollow' });
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      setDone(true);
      return;
    }
    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload: SessionInfo) => setInfo(payload))
      .catch(() => undefined)
      .finally(() => setDone(true));
  }, []);

  const paid = info?.status === 'paid';

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Booking {paid ? 'confirmed' : 'received'}</p>
            <h1>{paid ? 'Thank you — your stay is reserved.' : 'Thank you — your booking is being processed.'}</h1>
            {!done ? (
              <p>Confirming your booking…</p>
            ) : paid && info && info.checkIn ? (
              <p>
                You’re booked from <strong>{info.checkIn}</strong> to <strong>{info.checkOut}</strong>
                {info.amountTotal ? <> for {formatMoney(info.amountTotal, info.currency)}</> : null}. A receipt is on
                its way to {info.email || 'your email'}, and Daiana will follow up with the details. Your confirmation
                email will include a secure link to request a cancellation or date change.
              </p>
            ) : info && info.checkIn ? (
              <p>
                Your dates were received, but the booking has not been marked paid yet. Daiana will follow up by
                email, and the stay is not confirmed until payment is completed and a booking confirmation is issued.
              </p>
            ) : (
              <p>Your booking is being processed. Daiana will follow up by email with the details.</p>
            )}
            <div className="page-actions">
              <a className="button button-primary" href="/">Back to Home</a>
              <a className="text-link" href="/vacation-rentals">View vacation rentals</a>
            </div>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-hidden="true" />
        </section>
      </main>
    </PublicLayout>
  );
}

export default BookingSuccess;
