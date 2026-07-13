import { useMemo, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function CancelReservation() {
  usePageMeta('Cancel Reservation', 'Submit a cancellation request for an Iris & J Holdings vacation rental reservation.', {
    robots: 'noindex,nofollow',
  });

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = params.get('session_id') || '';
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    reason: '',
  });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submitRequest() {
    setSubmitState('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/cancel-reservation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, sessionId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not send the cancellation request.');
      setSubmitState('sent');
      setForm({ fullName: '', phone: '', email: '', reason: '' });
    } catch (error) {
      setSubmitState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not send the cancellation request.');
    }
  }

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <p className="eyebrow">Reservation request</p>
          <h1>Cancel reservation</h1>
          <p>Submit the details below and Daiana will review the request. A cancellation is not final until it is confirmed by Iris &amp; J Holdings.</p>
        </section>

        <section className="content-section content-narrow">
          <div className="form-shell">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="cancel-name">Name</label>
                <input id="cancel-name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
              </div>
              <div className="input-group">
                <label htmlFor="cancel-phone">Phone number</label>
                <input id="cancel-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="cancel-email">Email</label>
              <input id="cancel-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="cancel-reason">Reason for cancellation</label>
              <textarea id="cancel-reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
            </div>
            <button className="button button-primary" type="button" onClick={submitRequest} disabled={submitState === 'sending'}>
              Send cancellation request
            </button>
          </div>

          {submitState === 'sent' ? <p className="form-status form-status-success">Cancellation request sent.</p> : null}
          {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
        </section>
      </main>
    </PublicLayout>
  );
}

export default CancelReservation;
