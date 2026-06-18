import FormStatus from '../ui/FormStatus';
import { useContactForm } from '../../lib/useContactForm';

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
        {status === 'sending' ? 'Sending…' : 'Request Appointment'}
      </button>
      <FormStatus status={status} />
      <p className="form-note">This sends a request. Daiana will confirm the time and any travel or notary fees by email.</p>
    </form>
  );
}

export default NotaryBooking;
