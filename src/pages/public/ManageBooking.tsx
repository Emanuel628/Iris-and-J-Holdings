import { useEffect, useMemo, useState } from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

type ManageSession = {
  type: 'notary' | 'vacation';
  status: string;
  email: string;
  amountTotal: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  name: string;
  appointmentDate: string;
  appointmentTime: string;
  documentType: string;
};

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function formatShortDate(value: string) {
  if (!value) return value;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  }).format(date);
}

function ManageBooking() {
  usePageMeta('Manage Booking', 'Request a cancellation or scheduling change for an Iris & J Holdings booking.', {
    robots: 'noindex,nofollow',
  });

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const sessionId = params.get('session_id') || '';
  const token = params.get('token') || '';
  const [info, setInfo] = useState<ManageSession | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [action, setAction] = useState('reschedule');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!sessionId || !token) {
      setLoadState('error');
      setErrorMessage('This booking link is incomplete or invalid.');
      return;
    }

    fetch(`/api/manage-booking-session?session_id=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload: ManageSession) => {
        setInfo(payload);
        setAction(payload.type === 'notary' ? 'reschedule' : 'change-dates');
        setLoadState('ready');
      })
      .catch(() => {
        setLoadState('error');
        setErrorMessage('That manage-booking link could not be verified.');
      });
  }, [sessionId, token]);

  async function submitRequest() {
    if (!info) return;

    if (info.type === 'notary' && action === 'reschedule' && !newDate && !newTime) {
      setSubmitState('error');
      setErrorMessage('Add a new date, a new time, or both.');
      return;
    }

    if (info.type === 'vacation' && action === 'change-dates' && (!newCheckIn || !newCheckOut)) {
      setSubmitState('error');
      setErrorMessage('Add both the requested new check-in and check-out dates.');
      return;
    }

    setSubmitState('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/manage-booking-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          sessionId,
          token,
          action,
          newDate,
          newTime,
          newCheckIn,
          newCheckOut,
          message,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || 'Could not send the request.');
      }
      setSubmitState('sent');
    } catch (error) {
      setSubmitState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not send the request.');
    }
  }

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Manage Booking</p>
            <h1>Request a cancellation or schedule change.</h1>
            {loadState === 'loading' ? (
              <p>Loading your booking details...</p>
            ) : loadState === 'error' ? (
              <p>{errorMessage}</p>
            ) : info ? (
              <>
                <p>
                  Use this page to request a cancellation or scheduling change. Requests are sent to Daiana for
                  review and are not confirmed automatically.
                </p>
                <div className="notice-box">
                  <strong>Current booking:</strong>{' '}
                  {info.type === 'notary'
                    ? `${formatShortDate(info.appointmentDate)} at ${info.appointmentTime || 'time pending'}`
                    : `${formatShortDate(info.checkIn)} to ${formatShortDate(info.checkOut)}`}
                  {info.amountTotal ? ` - ${formatMoney(info.amountTotal, info.currency)}` : ''}
                </div>
              </>
            ) : null}
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-hidden="true" />
        </section>

        {loadState === 'ready' && info && (
          <section className="page-content">
            <div className="split-section">
              <div className="page-intro">
                <p className="eyebrow">{info.type === 'notary' ? 'Notary request' : 'Vacation request'}</p>
                <h2>{info.type === 'notary' ? 'Appointment details' : 'Stay details'}</h2>
                <p>
                  Booking email: <strong>{info.email}</strong>
                </p>
                {info.type === 'notary' ? (
                  <p>
                    Requested service: <strong>{info.documentType || 'Not provided'}</strong>
                  </p>
                ) : null}
              </div>

              <div className="info-panel form-shell">
                <div className="input-group">
                  <label htmlFor="manage-action">Request Type</label>
                  <select id="manage-action" value={action} onChange={(event) => setAction(event.target.value)}>
                    {info.type === 'notary' ? (
                      <>
                        <option value="reschedule">Request date/time change</option>
                        <option value="cancel">Request cancellation</option>
                      </>
                    ) : (
                      <>
                        <option value="change-dates">Request date change</option>
                        <option value="cancel">Request cancellation</option>
                      </>
                    )}
                  </select>
                </div>

                {info.type === 'notary' && action === 'reschedule' ? (
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="manage-new-date">Requested New Date</label>
                      <input id="manage-new-date" type="date" value={newDate} onChange={(event) => setNewDate(event.target.value)} />
                    </div>
                    <div className="input-group">
                      <label htmlFor="manage-new-time">Requested New Time</label>
                      <input id="manage-new-time" type="time" step={900} min="09:00" max="18:00" value={newTime} onChange={(event) => setNewTime(event.target.value)} />
                    </div>
                  </div>
                ) : null}

                {info.type === 'vacation' && action === 'change-dates' ? (
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="manage-new-checkin">Requested Check-in</label>
                      <input id="manage-new-checkin" type="date" value={newCheckIn} onChange={(event) => setNewCheckIn(event.target.value)} />
                    </div>
                    <div className="input-group">
                      <label htmlFor="manage-new-checkout">Requested Check-out</label>
                      <input id="manage-new-checkout" type="date" value={newCheckOut} onChange={(event) => setNewCheckOut(event.target.value)} />
                    </div>
                  </div>
                ) : null}

                <div className="input-group">
                  <label htmlFor="manage-message">Reason or message</label>
                  <textarea id="manage-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Add any details Daiana should review." />
                </div>

                <button className="button button-primary" type="button" onClick={submitRequest} disabled={submitState === 'sending' || submitState === 'sent'}>
                  {submitState === 'sending' ? 'Sending request...' : submitState === 'sent' ? 'Request sent' : 'Send request'}
                </button>

                {submitState === 'sent' ? (
                  <p className="form-status form-status-success">Your request was sent. Daiana will review it and follow up by email.</p>
                ) : null}
                {submitState === 'error' ? (
                  <p className="form-status form-status-error" role="alert">{errorMessage}</p>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </main>
    </PublicLayout>
  );
}

export default ManageBooking;
