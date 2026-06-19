import { useEffect, useState, type ReactNode } from 'react';
import { fetchAdminNotifications, type AdminNotificationsPayload } from '../../lib/adminAuth';

type AdminLayoutProps = {
  children: ReactNode;
  showNav?: boolean;
};

const adminLinks = [
  { href: '/admin', label: 'Control Center' },
  { href: '/admin/rentals', label: 'Rentals' },
  { href: '/admin/bookings', label: 'Bookings', notificationKey: 'bookings' as const },
  { href: '/admin/vacation-bookings', label: 'Vacation Queue', notificationKey: 'vacation' as const },
  { href: '/admin/notary-requests', label: 'Notary Queue', notificationKey: 'notary' as const },
  { href: '/admin/realtor-tools', label: 'Realtor Tools' },
  { href: '/admin/home-value-lab', label: 'Home Value Lab' },
  { href: '/admin/site-content', label: 'Site Content' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/policies', label: 'Policies' },
  { href: '/admin/settings', label: 'Settings' },
];

type NotificationKey = 'bookings' | 'vacation' | 'notary';

function seenStorageKey(key: NotificationKey) {
  return `ijh_admin_seen_${key}`;
}

function readSeenAt(key: NotificationKey) {
  return window.localStorage.getItem(seenStorageKey(key)) || '';
}

function markSeen(key: NotificationKey, value: string) {
  if (value) {
    window.localStorage.setItem(seenStorageKey(key), value);
  }
}

function hasUnread(payload: AdminNotificationsPayload | null, key: NotificationKey) {
  if (!payload) return false;
  const latestCreatedAt = payload[key].latestCreatedAt;
  if (!latestCreatedAt || payload[key].newCount <= 0) return false;
  return latestCreatedAt > readSeenAt(key);
}

function AdminLayout({ children, showNav = true }: AdminLayoutProps) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const [notifications, setNotifications] = useState<AdminNotificationsPayload | null>(null);

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST', headers: { Accept: 'application/json' } }).catch(() => undefined);
    window.location.href = '/admin/login';
  }

  useEffect(() => {
    if (!showNav) return;
    let alive = true;

    async function loadNotifications() {
      try {
        const payload = await fetchAdminNotifications();
        if (!alive) return;
        setNotifications(payload);
        if (currentPath === '/admin/bookings') {
          markSeen('bookings', payload.bookings.latestCreatedAt);
          markSeen('vacation', payload.vacation.latestCreatedAt);
          markSeen('notary', payload.notary.latestCreatedAt);
        } else if (currentPath === '/admin/vacation-bookings') {
          markSeen('vacation', payload.vacation.latestCreatedAt);
        } else if (currentPath === '/admin/notary-requests') {
          markSeen('notary', payload.notary.latestCreatedAt);
        }
      } catch {
        // Ignore transient polling failures in the chrome.
      }
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 15000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [currentPath, showNav]);

  return (
    <main className="page-main admin-shell">
      <section className="admin-workspace">
        {showNav ? (
          <aside className="admin-sidebar">
            <div className="admin-sidebar-head">
              <p>Iris &amp; J Holdings</p>
              <strong>Control Center</strong>
            </div>
            <nav className="admin-nav" aria-label="Admin">
              {adminLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={currentPath === link.href ? 'is-active' : undefined}
                  aria-current={currentPath === link.href ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {link.notificationKey && hasUnread(notifications, link.notificationKey) ? (
                    <span className="admin-notification-dot" aria-label="New activity" />
                  ) : null}
                </a>
              ))}
            </nav>
            <div className="admin-sidebar-foot">
              <button type="button" onClick={signOut}>Sign out</button>
            </div>
          </aside>
        ) : null}

        <section className="page-content admin-content">
          {showNav ? (
            <div className="admin-topbar">
              <div>
                <strong>Operations</strong>
                <span>Bookings, availability, content, and site controls</span>
              </div>
              <div className="admin-topbar-actions">
                <a href="/admin/rentals">New rental</a>
                <a href="/admin/vacation-bookings">Booked dates</a>
                <a href="/admin/notary-requests">Notary queue</a>
                <a href="/admin/realtor-tools">Buyer and seller intake</a>
              </div>
            </div>
          ) : null}
          {children}
        </section>
      </section>
    </main>
  );
}

export default AdminLayout;
