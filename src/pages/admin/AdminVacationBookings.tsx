import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminVacationBookings, type VacationBookingRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type BookingForm = {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: string;
  guestListText: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function toBookingForm(booking: VacationBookingRecord): BookingForm {
  return {
    id: booking.id,
    guestName: booking.guest_name,
    guestEmail: booking.guest_email,
    guestPhone: booking.guest_phone,
    guestCount: String(booking.guest_count),
    guestListText: booking.guest_list_text,
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    status: booking.status,
  };
}

function AdminVacationBookings() {
  usePageMeta('Vacation Queue', 'Review vacation rental bookings and guest details.', { robots: 'noindex,nofollow' });
  const initialEditId = Number(new URLSearchParams(window.location.search).get('edit') || 0) || 0;
  const [bookings, setBookings] = useState<VacationBookingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number>(initialEditId);
  const [form, setForm] = useState<BookingForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, bookingsPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminVacationBookings(),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setBookings(bookingsPayload.bookings);
    setSelectedId((current) => {
      if (current && bookingsPayload.bookings.some((item) => item.id === current)) {
        return current;
      }
      return bookingsPayload.bookings[0]?.id || 0;
    });
  }

  useEffect(() => {
    let alive = true;

    async function refresh() {
      await loadData();
    }

    refresh().catch(() => {
      window.location.href = '/admin/login';
    });
    const interval = window.setInterval(() => {
      if (!alive) return;
      refresh().catch(() => undefined);
    }, 15000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const selectedBooking = useMemo(
    () => bookings.find((item) => item.id === selectedId) || null,
    [bookings, selectedId],
  );

  useEffect(() => {
    if (selectedBooking) {
      setForm(toBookingForm(selectedBooking));
      window.history.replaceState({}, '', `/admin/vacation-bookings?edit=${selectedBooking.id}`);
    } else {
      setForm(null);
      window.history.replaceState({}, '', '/admin/vacation-bookings');
    }
  }, [selectedBooking]);

  async function saveBooking() {
    if (!form) return;
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/vacation-bookings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: form.id,
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          guestPhone: form.guestPhone,
          guestCount: Number(form.guestCount || 1),
          guestListText: form.guestListText,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          status: form.status,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save vacation booking.');
      await loadData();
      setStatusMessage('Vacation booking updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save vacation booking.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteBooking(id: number) {
    const confirmation = window.prompt('Type DELETE to permanently remove this booking.');
    if (confirmation === null) return;

    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/vacation-bookings/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, confirmation }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete vacation booking.');
      await loadData();
      setStatusMessage('Vacation booking deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete vacation booking.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Vacation queue</h1>
          <p>Live reservation records with guest details, booked dates, totals, and management actions.</p>
        </div>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Queue</h2>
              <p>{bookings.length} total</p>
            </div>
            <div className="admin-list">
              {bookings.map((booking) => (
                <article className="admin-list-row admin-record" key={booking.id}>
                  <div className="admin-record-copy">
                    <strong>{booking.guest_name}</strong>
                    <p>{booking.rental_title || 'Rental'} | {booking.check_in} to {booking.check_out}</p>
                    <p>{booking.guest_email} | {booking.guest_phone || 'No phone'} | {booking.guest_count} guests</p>
                    <p>Status: {booking.status} | Total: {formatCurrency(booking.amount_total_cents, booking.currency)}</p>
                    <p>Guest list: {booking.guest_list_text}</p>
                  </div>
                  <div className="admin-inline-actions">
                    <button className="button-secondary" type="button" onClick={() => setSelectedId(booking.id)} disabled={busy}>Edit</button>
                    <button className="button-secondary" type="button" onClick={() => deleteBooking(booking.id)} disabled={busy}>Delete</button>
                  </div>
                </article>
              ))}
              {!bookings.length ? <p>No vacation bookings yet.</p> : null}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Edit booking</h2>
              <p>{selectedBooking ? `#${selectedBooking.id}` : 'Select a booking'}</p>
            </div>
            {form ? (
              <div className="form-shell">
                <div className="form-row">
                  <div className="input-group"><label htmlFor="booking-guest-name">Guest Name</label><input id="booking-guest-name" value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} /></div>
                  <div className="input-group"><label htmlFor="booking-guest-email">Guest Email</label><input id="booking-guest-email" type="email" value={form.guestEmail} onChange={(event) => setForm({ ...form, guestEmail: event.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="input-group"><label htmlFor="booking-guest-phone">Guest Phone</label><input id="booking-guest-phone" value={form.guestPhone} onChange={(event) => setForm({ ...form, guestPhone: event.target.value })} /></div>
                  <div className="input-group"><label htmlFor="booking-guest-count">Guest Count</label><input id="booking-guest-count" type="number" min="1" value={form.guestCount} onChange={(event) => setForm({ ...form, guestCount: event.target.value })} /></div>
                </div>
                <div className="input-group"><label htmlFor="booking-guest-list">Guest List</label><textarea id="booking-guest-list" value={form.guestListText} onChange={(event) => setForm({ ...form, guestListText: event.target.value })} /></div>
                <div className="form-row">
                  <div className="input-group"><label htmlFor="booking-check-in">Check-in</label><input id="booking-check-in" type="date" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} /></div>
                  <div className="input-group"><label htmlFor="booking-check-out">Check-out</label><input id="booking-check-out" type="date" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} /></div>
                </div>
                <div className="input-group">
                  <label htmlFor="booking-status">Status</label>
                  <select id="booking-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    <option value="paid">Paid</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="cancel-requested">Cancel requested</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="admin-inline-actions">
                  <button className="button button-primary" type="button" onClick={saveBooking} disabled={busy}>Save changes</button>
                  <button className="button-secondary" type="button" onClick={() => deleteBooking(form.id)} disabled={busy}>Delete booking</button>
                </div>
              </div>
            ) : (
              <p>Select a booking from the queue to edit it.</p>
            )}
          </section>
        </div>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminVacationBookings;
