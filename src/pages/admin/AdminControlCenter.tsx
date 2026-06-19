import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminDashboard,
  fetchAdminMe,
  fetchAdminNotaryRequests,
  fetchAdminVacationBookings,
  type AdminUser,
  type DashboardSummary,
  type NotaryRequestRecord,
  type VacationBookingRecord,
} from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type ReminderItem =
  | {
      kind: 'vacation';
      sortDate: string;
      title: string;
      subtitle: string;
      detail: string;
      href: string;
    }
  | {
      kind: 'notary';
      sortDate: string;
      title: string;
      subtitle: string;
      detail: string;
      href: string;
    };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function AdminControlCenter() {
  usePageMeta('Control Center', 'Admin control center for Iris & J Holdings.', { robots: 'noindex,nofollow' });
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  async function loadData() {
    const [me, dashboard, vacationPayload, notaryPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminDashboard(),
      fetchAdminVacationBookings(),
      fetchAdminNotaryRequests(),
    ]);

    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }

    setUser(me.user);
    setSummary(dashboard.summary);

    const today = todayIso();
    const upcomingVacation = vacationPayload.bookings
      .filter((booking: VacationBookingRecord) => booking.check_in >= today && booking.status !== 'cancelled')
      .slice(0, 4)
      .map((booking: VacationBookingRecord) => ({
        kind: 'vacation' as const,
        sortDate: booking.check_in,
        title: booking.guest_name,
        subtitle: `${booking.check_in} to ${booking.check_out}`,
        detail: `${booking.rental_title || 'Rental'} | ${booking.guest_email} | ${booking.guest_count} guests`,
        href: '/admin/vacation-bookings',
      }));

    const upcomingNotary = notaryPayload.requests
      .filter((request: NotaryRequestRecord) => request.appointment_date >= today && request.status !== 'cancelled')
      .slice(0, 4)
      .map((request: NotaryRequestRecord) => ({
        kind: 'notary' as const,
        sortDate: request.appointment_date,
        title: request.full_name,
        subtitle: `${request.appointment_date} at ${request.appointment_time}`,
        detail: `${request.email} | ${request.document_type || 'No document type'} | ${request.notes || 'No notes'}`,
        href: '/admin/notary-requests',
      }));

    setReminders([...upcomingVacation, ...upcomingNotary].sort((a, b) => a.sortDate.localeCompare(b.sortDate)).slice(0, 6));
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page">
        <section className="admin-hero-strip">
          <div>
            <p className="eyebrow">Control Center</p>
            <h1>Operations dashboard</h1>
            {user ? <p>Signed in as {user.email}.</p> : <p>Loading your admin session...</p>}
          </div>
          <div className="admin-hero-actions">
            <a className="button button-primary" href="/admin/rentals">Manage rentals</a>
            <a className="button-secondary" href="/admin/bookings">Open bookings</a>
          </div>
        </section>

        <section className="admin-section admin-section-compact">
          <div className="admin-section-head">
            <h2>At a glance</h2>
          </div>
          <div className="admin-overview-grid admin-overview-cards">
            <a href="/admin/rentals">
              <span>Number of rentals</span>
              <strong>{summary?.rentals ?? '--'}</strong>
            </a>
            <a href="/admin/vacation-bookings">
              <span>Booked dates</span>
              <strong>{summary?.vacationBookings ?? '--'}</strong>
            </a>
            <a href="/admin/notary-requests">
              <span>Notary requests</span>
              <strong>{summary?.notaryRequests ?? '--'}</strong>
            </a>
          </div>
        </section>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Upcoming reminders</h2>
              <p>{reminders.length} queued</p>
            </div>
            <div className="admin-reminder-list">
              {reminders.map((item) => (
                <a className="admin-reminder-row" href={item.href} key={`${item.kind}-${item.title}-${item.sortDate}`}>
                  <div className={`admin-reminder-kind admin-reminder-kind-${item.kind}`}>
                    {item.kind === 'vacation' ? 'Vacation' : 'Notary'}
                  </div>
                  <div className="admin-reminder-copy">
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                    <p>{item.detail}</p>
                  </div>
                </a>
              ))}
              {!reminders.length ? <p className="admin-empty-note">No upcoming appointments or stays are in the queue yet.</p> : null}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Primary controls</h2>
            </div>
            <div className="admin-quick-grid">
              <a href="/admin/rentals">
                <strong>Rentals</strong>
                <span>Add rentals, update pricing, control availability, and keep public listings current.</span>
              </a>
              <a href="/admin/vacation-bookings">
                <strong>Vacation queue</strong>
                <span>Review bookings, cancellations, changes, and reservation status.</span>
              </a>
              <a href="/admin/notary-requests">
                <strong>Notary queue</strong>
                <span>Review appointments, signer details, notes, and request status.</span>
              </a>
              <a href="/admin/site-content">
                <strong>Site content</strong>
                <span>Update public page copy, hero image URLs, and live page content.</span>
              </a>
            </div>
          </section>
        </div>

        <section className="admin-section admin-section-compact">
          <div className="admin-section-head">
            <h2>Route map</h2>
          </div>
          <div className="admin-route-list">
            <a href="/admin/rentals">
              <strong>Rentals</strong>
              <span>Create listings, update pricing, swap images, and manage manual availability holds.</span>
            </a>
            <a href="/admin/bookings">
              <strong>Bookings</strong>
              <span>Route hub for vacation bookings, notary requests, cancellations, date changes, and booking operations.</span>
            </a>
            <a href="/admin/media">
              <strong>Media Library</strong>
              <span>Scaffold route for hero images, rental galleries, page-by-page image swaps, and future uploads.</span>
            </a>
            <a href="/admin/policies">
              <strong>Policies</strong>
              <span>Scaffold route for terms, house rules, refund policies, and controlled policy copy.</span>
            </a>
            <a href="/admin/settings">
              <strong>Settings</strong>
              <span>Scaffold route for auth, site configuration, booking defaults, and future operational settings.</span>
            </a>
            <a href="/admin/site-content">
              <strong>Site Content</strong>
              <span>Edit page copy and hero image URLs for the public-facing site.</span>
            </a>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminControlCenter;
