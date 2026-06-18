import { useState, type FormEvent } from 'react';

type CheckoutStatus = 'idle' | 'sending' | 'error';

function NotaryBooking() {
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      city: String(form.get('city') || '').trim(),
      appointmentDate: String(form.get('appointmentDate') || '').trim(),
      appointmentTime: String(form.get('appointmentTime') || '').trim(),
      documentType: String(form.get('documentType') || '').trim(),
      notes: String(form.get('notes') || '').trim(),
    };

    try {
      const res = await fetch('/api/notary-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Could not start checkout. Please try again.');
      }

      window.location.href = data.url;
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not start checkout.');
    }
  }

  return (
    <form className="info-panel form-shell" id="notary-booking" onSubmit={submit}>
      <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-row">
        <div className="input-group"><label htmlFor="notary-name">Full Name</label><input id="notary-name" name="name" required /></div>
        <div className="input-group"><label htmlFor="notary-email">Email</label><input id="notary-email" name="email" type="email" required /></div>
      </div>
      <div className="form-row">
        <div className="input-group"><label htmlFor="notary-phone">Phone</label><input id="notary-phone" name="phone" type="tel" /></div>
        <div className="input-group"><label htmlFor="notary-city">City / Town</label><input id="notary-city" name="city" /></div>
      </div>
      <div className="form-row">
        <div className="input-group">
          <label htmlFor="notary-date">Preferred Date</label>
          <input id="notary-date" name="appointmentDate" type="date" required />
        </div>
        <div className="input-group">
          <label htmlFor="notary-time">Preferred Time</label>
          <input id="notary-time" name="appointmentTime" type="time" required />
        </div>
      </div>
      <div className="input-group">
        <label htmlFor="notary-doc">Document Type</label>
        <input id="notary-doc" name="documentType" placeholder="e.g. affidavit, real estate, consent form" />
      </div>
      <div className="input-group">
        <label htmlFor="notary-notes">Notes</label>
        <textarea id="notary-notes" name="notes" placeholder="Number of signers, address, anything else" />
      </div>
      <button className="button button-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Starting checkout…' : 'Pay Booking Fee & Request Appointment'}
      </button>
      {status === 'error' && (
        <p className="form-status form-status-error" role="alert">
          {errorMessage}
        </p>
      )}
      <p className="form-note">
        This pays the travel / booking fee. Daiana will confirm the appointment time, service area, and any
        separate notary fees by email. Payment does not guarantee that a notarial act can be completed if legal,
        signer, document, or identification requirements cannot be satisfied.
      </p>
    </form>
  );
}

export default NotaryBooking;
