import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminVacationBookings, type VacationBookingRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function AdminVacationBookings() {
  usePageMeta('Booked Dates', 'Review vacation rental bookings and guest details.', { robots: 'noindex,nofollow' });
  const [bookings, setBookings] = useState<VacationBookingRecord[]>([]);
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

  async function updateBookingStatus(id: number, nextStatus: string) {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/vacation-bookings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not update vacation booking status.');
      await loadData();
      setStatusMessage('Vacation booking status updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update vacation booking status.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Booked dates</h1>
          <p>Actual booking records with guest details, dates, totals, and management actions.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Vacation Bookings</h2>
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
                  <button className="button-secondary" type="button" onClick={() => updateBookingStatus(booking.id, 'reviewed')} disabled={busy}>Reviewed</button>
                  <button className="button-secondary" type="button" onClick={() => updateBookingStatus(booking.id, 'cancelled')} disabled={busy}>Cancelled</button>
                </div>
              </article>
            ))}
            {!bookings.length ? <p>No vacation bookings yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminVacationBookings;

