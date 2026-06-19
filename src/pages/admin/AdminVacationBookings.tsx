import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
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

type SortOption = 'upcoming' | 'latest-created' | 'guest-name';

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function formatShortDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).format(date);
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
  const [editingId, setEditingId] = useState<number>(initialEditId);
  const [form, setForm] = useState<BookingForm | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('upcoming');
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

  const sortedBookings = useMemo(() => {
    const items = [...bookings];
    if (sortBy === 'guest-name') {
      return items.sort((a, b) => a.guest_name.localeCompare(b.guest_name));
    }
    if (sortBy === 'latest-created') {
      return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return items.sort((a, b) => {
      const byDate = a.check_in.localeCompare(b.check_in);
      if (byDate !== 0) return byDate;
      return a.created_at.localeCompare(b.created_at);
    });
  }, [bookings, sortBy]);

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
      setEditingId(0);
      setForm(null);
      window.history.replaceState({}, '', '/admin/vacation-bookings');
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
      if (editingId === id) {
        setEditingId(0);
        setForm(null);
        window.history.replaceState({}, '', '/admin/vacation-bookings');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete vacation booking.');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(booking: VacationBookingRecord) {
    setEditingId(booking.id);
    setForm(toBookingForm(booking));
    window.history.replaceState({}, '', `/admin/vacation-bookings?edit=${booking.id}`);
  }

  function cancelEdit() {
    setEditingId(0);
    setForm(null);
    window.history.replaceState({}, '', '/admin/vacation-bookings');
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Vacation queue</h1>
          <p>Live reservation records with upcoming stays first, later dates later, and direct row-level editing.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Queue</h2>
            <div className="admin-queue-toolbar">
              <p>{bookings.length} total</p>
              <div className="admin-select-shell admin-sort-shell">
                <label className="sr-only" htmlFor="vacation-sort">Sort bookings</label>
                <select id="vacation-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
                  <option value="upcoming">Upcoming first</option>
                  <option value="latest-created">Newest added</option>
                  <option value="guest-name">Guest name</option>
                </select>
                <ChevronsUpDown size={16} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="admin-list">
            {sortedBookings.map((booking) => {
              const isEditing = editingId === booking.id && form?.id === booking.id;
              return (
                <article className="admin-list-row admin-record admin-record-stack" key={booking.id}>
                  <div className="admin-record-copy">
                    <strong>{booking.guest_name}</strong>
                    <p>{booking.rental_title || 'Rental'} | {formatShortDate(booking.check_in)} to {formatShortDate(booking.check_out)}</p>
                    <p><a href={`mailto:${booking.guest_email}`}>{booking.guest_email}</a> | {booking.guest_phone || 'No phone'} | {booking.guest_count} guests</p>
                    <p>Status: {booking.status} | Total: {formatCurrency(booking.amount_total_cents, booking.currency)}</p>
                    <p>Guest list: {booking.guest_list_text}</p>
                  </div>
                  <div className="admin-inline-actions">
                    <button className="button-secondary" type="button" onClick={() => startEdit(booking)} disabled={busy}>{isEditing ? 'Editing' : 'Edit'}</button>
                    <button className="button-secondary" type="button" onClick={() => deleteBooking(booking.id)} disabled={busy}>Delete</button>
                  </div>
                  {isEditing && form ? (
                    <div className="form-shell admin-record-editor">
                      <div className="form-row">
                        <div className="input-group"><label htmlFor={`booking-guest-name-${booking.id}`}>Guest Name</label><input id={`booking-guest-name-${booking.id}`} value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} /></div>
                        <div className="input-group"><label htmlFor={`booking-guest-email-${booking.id}`}>Guest Email</label><input id={`booking-guest-email-${booking.id}`} type="email" value={form.guestEmail} onChange={(event) => setForm({ ...form, guestEmail: event.target.value })} /></div>
                      </div>
                      <div className="form-row">
                        <div className="input-group"><label htmlFor={`booking-guest-phone-${booking.id}`}>Guest Phone</label><input id={`booking-guest-phone-${booking.id}`} value={form.guestPhone} onChange={(event) => setForm({ ...form, guestPhone: event.target.value })} /></div>
                        <div className="input-group"><label htmlFor={`booking-guest-count-${booking.id}`}>Guest Count</label><input id={`booking-guest-count-${booking.id}`} type="number" min="1" value={form.guestCount} onChange={(event) => setForm({ ...form, guestCount: event.target.value })} /></div>
                      </div>
                      <div className="input-group"><label htmlFor={`booking-guest-list-${booking.id}`}>Guest List</label><textarea id={`booking-guest-list-${booking.id}`} value={form.guestListText} onChange={(event) => setForm({ ...form, guestListText: event.target.value })} /></div>
                      <div className="form-row">
                        <div className="input-group"><label htmlFor={`booking-check-in-${booking.id}`}>Check-in</label><input id={`booking-check-in-${booking.id}`} type="date" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} /></div>
                        <div className="input-group"><label htmlFor={`booking-check-out-${booking.id}`}>Check-out</label><input id={`booking-check-out-${booking.id}`} type="date" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} /></div>
                      </div>
                      <div className="input-group">
                        <label htmlFor={`booking-status-${booking.id}`}>Status</label>
                        <select id={`booking-status-${booking.id}`} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                          <option value="paid">Paid</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="approved">Approved</option>
                          <option value="cancel-requested">Cancel requested</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="admin-inline-actions">
                        <button className="button button-primary" type="button" onClick={saveBooking} disabled={busy}>Save changes</button>
                        <button className="button-secondary" type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {!sortedBookings.length ? <p>No vacation bookings yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminVacationBookings;
