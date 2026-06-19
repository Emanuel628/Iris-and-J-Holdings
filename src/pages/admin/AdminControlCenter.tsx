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

type ReminderItem = {
  id: number;
  kind: 'vacation' | 'notary';
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
  const [busyKey, setBusyKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
        id: booking.id,
        kind: 'vacation' as const,
        sortDate: booking.check_in,
        title: booking.guest_name,
        subtitle: `${booking.check_in} to ${booking.check_out}`,
        detail: `${booking.rental_title || 'Rental'} | ${booking.guest_email} | ${booking.guest_count} guests`,
        href: `/admin/vacation-bookings?edit=${booking.id}`,
      }));

    const upcomingNotary = notaryPayload.requests
      .filter((request: NotaryRequestRecord) => request.appointment_date >= today && request.status !== 'cancelled')
      .slice(0, 4)
      .map((request: NotaryRequestRecord) => ({
        id: request.id,
        kind: 'notary' as const,
        sortDate: request.appointment_date,
        title: request.full_name,
        subtitle: `${request.appointment_date} at ${request.appointment_time}`,
        detail: `${request.email} | ${request.document_type || 'No document type'} | ${request.notes || 'No notes'}`,
        href: `/admin/notary-requests?edit=${request.id}`,
      }));

    setReminders([...upcomingVacation, ...upcomingNotary].sort((a, b) => a.sortDate.localeCompare(b.sortDate)).slice(0, 6));
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

  async function deleteReminder(item: ReminderItem) {
    const confirmation = window.prompt('Type DELETE to permanently remove this item.');
    if (confirmation === null) return;

    setBusyKey(`${item.kind}-${item.id}`);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const endpoint = item.kind === 'vacation' ? '/api/admin/vacation-bookings/delete' : '/api/admin/notary-requests/delete';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: item.id, confirmation }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete record.');
      await loadData();
      setStatusMessage(item.kind === 'vacation' ? 'Vacation booking deleted.' : 'Notary appointment deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete record.');
    } finally {
      setBusyKey('');
    }
  }

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
            <a className="button-secondary" href="/admin/vacation-bookings">Open vacation queue</a>
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
              <span>Vacation queue</span>
              <strong>{summary?.vacationBookings ?? '--'}</strong>
            </a>
            <a href="/admin/notary-requests">
              <span>Notary queue</span>
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
                <article className="admin-reminder-row" key={`${item.kind}-${item.id}`}>
                  <div className={`admin-reminder-kind admin-reminder-kind-${item.kind}`}>
                    {item.kind === 'vacation' ? 'Vacation' : 'Notary'}
                  </div>
                  <div className="admin-reminder-copy">
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                    <p>{item.detail}</p>
                  </div>
                  <div className="admin-reminder-actions">
                    <a className="button-secondary" href={item.href}>Edit</a>
                    <button className="button-secondary" type="button" onClick={() => deleteReminder(item)} disabled={busyKey === `${item.kind}-${item.id}`}>Delete</button>
                  </div>
                </article>
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
                <span>Review bookings, cancellations, date changes, and reservation details.</span>
              </a>
              <a href="/admin/notary-requests">
                <strong>Notary queue</strong>
                <span>Review appointments, signer details, notes, cancellations, and confirmations.</span>
              </a>
              <a href="/admin/site-content">
                <strong>Site content</strong>
                <span>Update public page copy, hero image URLs, and live page content.</span>
              </a>
              <a href="/admin/realtor-tools">
                <strong>Realtor tools</strong>
                <span>Store buyer and seller intake records, budgets, notes, and follow-up details.</span>
              </a>
              <a href="/admin/home-value-lab">
                <strong>Home value lab</strong>
                <span>Build the data-backed estimator workflow instead of publishing a fake calculator.</span>
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
            <a href="/admin/vacation-bookings">
              <strong>Vacation Queue</strong>
              <span>Manage guest records, booked dates, cancellations, edits, and reservation status.</span>
            </a>
            <a href="/admin/notary-requests">
              <strong>Notary Queue</strong>
              <span>Manage signer records, appointment dates, time changes, notes, and request status.</span>
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
            <a href="/admin/realtor-tools">
              <strong>Realtor Tools</strong>
              <span>Capture buyer and seller intake information and keep consultation records in one place.</span>
            </a>
            <a href="/admin/home-value-lab">
              <strong>Home Value Lab</strong>
              <span>Plan the estimator stack, data vendors, response storage, and public valuation workflow.</span>
            </a>
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminControlCenter;
