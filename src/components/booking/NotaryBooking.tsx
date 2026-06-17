import FormStatus from '../ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';

function upcomingDates(count: number) {
  const out: { value: string; label: string }[] = [];
  const start = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const value = d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    out.push({ value, label: i === 0 ? `Today — ${label}` : label });
  }
  return out;
}

function timeSlots() {
  const slots: string[] = [];
  for (let hour = 8; hour <= 19; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 19 && minute === 30) break;
      const period = hour < 12 ? 'AM' : 'PM';
      const hour12 = ((hour + 11) % 12) + 1;
      slots.push(`${hour12}:${String(minute).padStart(2, '0')} ${period}`);
    }
  }
  return slots;
}

const DATES = upcomingDates(30);
const TIMES = timeSlots();

/** Mobile notary appointment request: pick a date and time, email goes to Daiana. */
function NotaryBooking() {
  const { status, submit } = useContactForm('Mobile Notary Appointment Request');

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
          <select id="notary-date" name="appointmentDate" required defaultValue="">
            <option value="" disabled>Choose a date</option>
            {DATES.map((date) => <option key={date.value} value={date.value}>{date.label}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label htmlFor="notary-time">Preferred Time</label>
          <select id="notary-time" name="appointmentTime" required defaultValue="">
            <option value="" disabled>Choose a time</option>
            {TIMES.map((time) => <option key={time} value={time}>{time}</option>)}
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
      <button className="button button-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request Appointment'}
      </button>
      <FormStatus status={status} />
      <p className="form-note">This sends a request. Daiana will confirm the time and any travel or notary fees by email.</p>
    </form>
  );
}

export default NotaryBooking;
