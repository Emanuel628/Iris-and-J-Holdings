import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import FormStatus from '../ui/FormStatus';
import NewsletterOptIn from '../ui/NewsletterOptIn';
import { useContactForm } from '../../lib/useContactForm';

type NotaryConfig = { bookingEnabled: boolean; feeCents: number; currency: string };

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

/**
 * Mobile notary appointment request. When a notary fee is configured, the form
 * goes to Stripe Checkout (same flow as vacation rentals); otherwise it falls
 * back to emailing the request to Daiana.
 */
function NotaryBooking() {
  const { status, submit: emailSubmit } = useContactForm('Mobile Notary Appointment Request');
  const [config, setConfig] = useState<NotaryConfig | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    fetch('/api/notary-config')
      .then((res) => res.json())
      .then((data: NotaryConfig) => setConfig(data))
      .catch(() => setConfig({ bookingEnabled: false, feeCents: 0, currency: 'usd' }));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!config?.bookingEnabled) {
      emailSubmit(event); // email fallback
      return;
    }
    event.preventDefault();
    setPayError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    if (String(data.get('_gotcha') ?? '').trim().length > 0) return; // honeypot

    if (String(data.get('newsletterOptIn') ?? '')) {
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.get('email'), name: data.get('name') }),
      }).catch(() => undefined);
    }

    setPaying(true);
    try {
      const res = await fetch('/api/notary-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          city: data.get('city'),
          appointmentDate: data.get('appointmentDate'),
          appointmentTime: data.get('appointmentTime'),
          documentType: data.get('documentType'),
          notes: data.get('notes'),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.url) throw new Error(payload.message || 'Could not start checkout. Please try again.');
      window.location.href = payload.url;
    } catch (error) {
      setPayError(error instanceof Error ? error.message : 'Could not start checkout.');
      setPaying(false);
    }
  }

  const paid = Boolean(config?.bookingEnabled);
  const feeLabel = config && config.feeCents > 0 ? formatMoney(config.feeCents, config.currency) : '';
  const sending = status === 'sending' || paying;

  return (
    <form className="info-panel form-shell" id="notary-booking" onSubmit={handleSubmit}>
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
      <NewsletterOptIn />
      <button className="button button-primary" type="submit" disabled={sending}>
        {sending ? 'Starting…' : paid ? `Book & pay${feeLabel ? ` ${feeLabel}` : ''}` : 'Request Appointment'}
      </button>
      {!paid && <FormStatus status={status} />}
      {payError && <p className="form-status form-status-error" role="alert">{payError}</p>}
      <p className="form-note">
        {paid
          ? 'Secure checkout reserves your time. The booking fee is shown above; any additional notary fees are confirmed by email.'
          : 'This sends a request. Daiana will confirm the time and any travel or notary fees by email.'}
      </p>
    </form>
  );
}

export default NotaryBooking;
