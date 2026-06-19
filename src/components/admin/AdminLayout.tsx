import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
  showNav?: boolean;
};

const adminLinks = [
  { href: '/admin', label: 'Control Center' },
  { href: '/admin/rentals', label: 'Rentals' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/vacation-bookings', label: 'Vacation Queue' },
  { href: '/admin/notary-requests', label: 'Notary Queue' },
  { href: '/admin/realtor-tools', label: 'Realtor Tools' },
  { href: '/admin/home-value-lab', label: 'Home Value Lab' },
  { href: '/admin/site-content', label: 'Site Content' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/policies', label: 'Policies' },
  { href: '/admin/settings', label: 'Settings' },
];

function AdminLayout({ children, showNav = true }: AdminLayoutProps) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST', headers: { Accept: 'application/json' } }).catch(() => undefined);
    window.location.href = '/admin/login';
  }

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
                  {link.label}
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
