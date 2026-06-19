import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminMe,
  fetchAdminNotaryRequests,
  fetchAdminVacationBookings,
  type NotaryRequestRecord,
  type VacationBookingRecord,
} from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function AdminBookingsHub() {
  usePageMeta('Admin Bookings', 'Live booking operations for vacation and notary queues.', { robots: 'noindex,nofollow' });
  const [vacationBookings, setVacationBookings] = useState<VacationBookingRecord[]>([]);
  const [notaryRequests, setNotaryRequests] = useState<NotaryRequestRecord[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    let alive = true;

    async function loadData() {
      const [me, vacationPayload, notaryPayload] = await Promise.all([
        fetchAdminMe(),
        fetchAdminVacationBookings(),
        fetchAdminNotaryRequests(),
      ]);

      if (!me?.user) {
        window.location.href = '/admin/login';
        return;
      }

      if (!alive) return;
      setVacationBookings(vacationPayload.bookings);
      setNotaryRequests(notaryPayload.requests);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    }

    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
    const interval = window.setInterval(() => {
      loadData().catch(() => undefined);
    }, 15000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Bookings</p>
          <h1>Live booking operations</h1>
          <p>Vacation bookings and notary requests refresh automatically every 15 seconds.</p>
        </div>

        <section className="admin-section admin-section-compact">
          <div className="admin-section-head">
            <h2>Queue totals</h2>
            <p>Updated {lastUpdated || '--'}</p>
          </div>
          <div className="admin-overview-grid admin-overview-cards">
            <a href="/admin/vacation-bookings">
              <span>Vacation queue</span>
              <strong>{vacationBookings.length}</strong>
            </a>
            <a href="/admin/notary-requests">
              <span>Notary queue</span>
              <strong>{notaryRequests.length}</strong>
            </a>
            <div>
              <span>New items</span>
              <strong>{vacationBookings.filter((item) => item.status === 'paid').length + notaryRequests.filter((item) => item.status === 'paid').length}</strong>
            </div>
          </div>
        </section>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Vacation queue</h2>
              <a href="/admin/vacation-bookings">Open page</a>
            </div>
            <div className="admin-reminder-list">
              {vacationBookings.slice(0, 8).map((booking) => (
                <a className="admin-reminder-row" href="/admin/vacation-bookings" key={booking.id}>
                  <div className="admin-reminder-kind admin-reminder-kind-vacation">{booking.status}</div>
                  <div className="admin-reminder-copy">
                    <strong>{booking.guest_name}</strong>
                    <p>{booking.check_in} to {booking.check_out}</p>
                    <p>{booking.guest_email} | {booking.guest_count} guests | created {formatDate(booking.created_at)}</p>
                  </div>
                </a>
              ))}
              {!vacationBookings.length ? <p className="admin-empty-note">No vacation bookings yet.</p> : null}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Notary queue</h2>
              <a href="/admin/notary-requests">Open page</a>
            </div>
            <div className="admin-reminder-list">
              {notaryRequests.slice(0, 8).map((request) => (
                <a className="admin-reminder-row" href="/admin/notary-requests" key={request.id}>
                  <div className="admin-reminder-kind admin-reminder-kind-notary">{request.status}</div>
                  <div className="admin-reminder-copy">
                    <strong>{request.full_name}</strong>
                    <p>{request.appointment_date} at {request.appointment_time}</p>
                    <p>{request.email} | {request.document_type || 'No document type'} | created {formatDate(request.created_at)}</p>
                  </div>
                </a>
              ))}
              {!notaryRequests.length ? <p className="admin-empty-note">No notary requests yet.</p> : null}
            </div>
          </section>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminBookingsHub;
