import { useEffect, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

type SessionInfo = {
  status: string;
  amountTotal: number;
  currency: string;
  email: string;
  type: string;
  checkIn: string;
  checkOut: string;
  appointmentDate: string;
  appointmentTime: string;
};

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function InvoiceSuccess() {
  usePageMeta('Invoice Payment Received', 'Your invoice payment was received.', { robots: 'noindex,nofollow' });
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
  const isVacation = info?.checkIn && info?.checkOut;

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Invoice {paid ? 'paid' : 'processing'}</p>
            <h1>{paid ? 'Thank you - your payment was received.' : 'Thank you - your payment is being processed.'}</h1>
            {!done ? (
              <p>Confirming your payment...</p>
            ) : paid && info ? (
              <p>
                We received {info.amountTotal ? formatMoney(info.amountTotal, info.currency) : 'your payment'} and sent a receipt
                to {info.email || 'your email'}. Daiana will review the invoice and follow up with the next step.
                {isVacation ? <> Requested stay: <strong>{info.checkIn}</strong> to <strong>{info.checkOut}</strong>.</> : null}
                {!isVacation && info.appointmentDate ? <> Requested appointment: <strong>{info.appointmentDate}</strong>{info.appointmentTime ? <> at <strong>{info.appointmentTime}</strong></> : null}.</> : null}
              </p>
            ) : (
              <p>Your payment is being processed. Daiana will follow up by email with the next step.</p>
            )}
            <div className="page-actions">
              <a className="button button-primary" href="/">Back to Home</a>
            </div>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-hidden="true" />
        </section>
      </main>
    </PublicLayout>
  );
}

export default InvoiceSuccess;
