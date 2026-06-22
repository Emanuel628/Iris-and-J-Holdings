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
import { useMemo, useState, type FormEvent } from 'react';

type CheckoutStatus = 'idle' | 'sending' | 'error';

function formatTimeLabel(value: string) {
  const [hourText = '0', minuteText = '00'] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function NotaryBooking() {
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const timeOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];

    for (let hour = 9; hour <= 18; hour += 1) {
      for (const minute of [0, 15, 30, 45]) {
        if (hour === 18 && minute > 0) continue;
        const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push({ value, label: formatTimeLabel(value) });
      }
    }

    return options;
  }, []);

  function openNativePicker(event: { currentTarget: HTMLInputElement }) {
    event.currentTarget.showPicker?.();
  }

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
          <input id="notary-date" name="appointmentDate" type="date" required onClick={openNativePicker} onFocus={openNativePicker} />
        </div>
        <div className="input-group">
          <label htmlFor="notary-time">Preferred Time</label>
          <select id="notary-time" name="appointmentTime" defaultValue="" required>
            <option value="" disabled>Select a time</option>
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
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
      <p className="form-note"></p>
        {paid
          ? 'Secure checkout reserves your time. The booking fee is shown above; any additional notary fees are confirmed by email.'
          : 'This sends a request. Daiana will confirm the time and any travel or notary fees by email.'}

      <label className="form-note" htmlFor="notary-policy-agree">
        <input id="notary-policy-agree" name="policyAgreement" type="checkbox" required /> I agree to the{' '}
        <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>, including the{' '}
        <a href="/refund-cancellation-policy#mobile-notary" target="_blank" rel="noreferrer">
          Notary Refund &amp; Cancellation Policy
        </a>.
      </label>
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
        signer, document, or identification requirements cannot be satisfied. Refunds and cancellations are handled
        according to the applicable Refund &amp; Cancellation Policy.

      </p>
    </form>
  );
}

export default NotaryBooking;
