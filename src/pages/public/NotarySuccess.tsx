import { useEffect, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

type SessionInfo = {
  status: string;
  amountTotal: number;
  currency: string;
  email: string;
  name: string;
  appointmentDate: string;
  appointmentTime: string;
  documentType: string;
};

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function NotarySuccess() {
  usePageMeta('Notary Booking Fee Received', 'Your mobile notary booking fee was received.', { robots: 'noindex,nofollow' });
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
            <p className="eyebrow">Notary booking fee {paid ? 'received' : 'processing'}</p>
            <h1>{paid ? 'Thank you — your booking fee was received.' : 'Thank you — your payment is being processed.'}</h1>

            {!done ? (
              <p>Confirming your payment…</p>
            ) : paid && info ? (
              <p>
                We received {info.amountTotal ? formatMoney(info.amountTotal, info.currency) : 'your payment'}
                {info.appointmentDate ? <> for your preferred appointment on <strong>{info.appointmentDate}</strong></> : null}
                {info.appointmentTime ? <> at <strong>{info.appointmentTime}</strong></> : null}. Daiana will follow up by email
                to confirm the appointment time, service area, and any separate notary fees. Your confirmation email will
                include a secure link to request a cancellation or scheduling change.
              </p>
            ) : (
              <p>
                Your payment is being processed. Daiana will follow up by email. The appointment is not final until
                Daiana confirms the time, service area, signer requirements, and document details.
              </p>
            )}

            <div className="notice-box">
              Payment of a booking or travel fee does not guarantee that a notarial act can be completed. Every
              signer must be present, willing to sign, aware of what is being signed, and able to provide valid,
              unexpired government-issued photo identification.
            </div>

            <div className="page-actions">
              <a className="button button-primary" href="/">Back to Home</a>
              <a className="text-link" href="/mobile-notary">View mobile notary page</a>
            </div>
          </div>
          <div className="page-hero-visual page-hero-image-frame" aria-hidden="true">
            <img src="/images/site/notary-hero.jpg" alt="" />
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default NotarySuccess;
