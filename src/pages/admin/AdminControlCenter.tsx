import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
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
  email: string;
  detail: string;
  href: string;
};

type ReminderSortOption = 'upcoming' | 'type' | 'name';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatShortDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).format(date);
}

function AdminControlCenter() {
  usePageMeta('Control Center', 'Admin control center for Iris & J Holdings.', { robots: 'noindex,nofollow' });
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [sortBy, setSortBy] = useState<ReminderSortOption>('upcoming');
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
        subtitle: `${formatShortDate(booking.check_in)} to ${formatShortDate(booking.check_out)}`,
        email: booking.guest_email,
        detail: `${booking.rental_title || 'Rental'} | ${booking.guest_count} guests`,
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
        subtitle: `${formatShortDate(request.appointment_date)} at ${request.appointment_time}`,
        email: request.email,
        detail: `${request.document_type || 'No document type'} | ${request.notes || 'No notes'}`,
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

  const sortedReminders = useMemo(() => {
    const items = [...reminders];
    if (sortBy === 'name') {
      return items.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortBy === 'type') {
      return items.sort((a, b) => a.kind.localeCompare(b.kind) || a.sortDate.localeCompare(b.sortDate));
    }
    return items.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  }, [reminders, sortBy]);

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

        <section className="admin-panel">
          <div className="admin-section-head">
            <h2>Upcoming reminders</h2>
            <div className="admin-queue-toolbar">
              <p>{reminders.length} queued</p>
              <div className="admin-select-shell admin-sort-shell">
                <label className="sr-only" htmlFor="control-center-sort">Sort reminders</label>
                <select id="control-center-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as ReminderSortOption)}>
                  <option value="upcoming">Upcoming first</option>
                  <option value="type">Type</option>
                  <option value="name">Name</option>
                </select>
                <ChevronsUpDown size={16} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="admin-reminder-list">
            {sortedReminders.map((item) => (
              <article className="admin-reminder-row" key={`${item.kind}-${item.id}`}>
                <div className={`admin-reminder-kind admin-reminder-kind-${item.kind}`}>
                  {item.kind === 'vacation' ? 'Vacation' : 'Notary'}
                </div>
                <div className="admin-reminder-copy">
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                  <p><a href={`mailto:${item.email}`}>{item.email}</a></p>
                  <p>{item.detail}</p>
                </div>
                <div className="admin-reminder-actions">
                  <a className="button-secondary" href={item.href}>Edit</a>
                  <button className="button-secondary" type="button" onClick={() => deleteReminder(item)} disabled={busyKey === `${item.kind}-${item.id}`}>Delete</button>
                </div>
              </article>
            ))}
            {!sortedReminders.length ? <p className="admin-empty-note">No upcoming appointments or stays are in the queue yet.</p> : null}
          </div>
        </section>

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
            <a href="/admin/invoices">
              <strong>Quotes and Invoices</strong>
              <span>Create quotes, email payment links, approve reservations, and sync them into the live queues.</span>
            </a>
            <a href="/admin/media">
              <strong>Media Library</strong>
              <span>Review the active hero images, rental galleries, and direct media links already in use across the site.</span>
            </a>
            <a href="/admin/settings">
              <strong>Settings</strong>
              <span>Account security, admin email verification, and password controls.</span>
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
              <span>Run RentCast-powered estimates, email comparable sales, save valuation records, and manage estimator defaults.</span>
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
