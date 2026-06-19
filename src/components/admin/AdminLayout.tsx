import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
  showNav?: boolean;
};

const adminLinks = [
  { href: '/admin', label: 'Control Center' },
  { href: '/admin/rentals', label: 'Rentals' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/policies', label: 'Policies' },
  { href: '/admin/settings', label: 'Settings' },
];

function AdminLayout({ children, showNav = true }: AdminLayoutProps) {
  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST', headers: { Accept: 'application/json' } }).catch(() => undefined);
    window.location.href = '/admin/login';
  }

  return (
    <main className="page-main admin-shell">
      <section className="page-content admin-content">
        {showNav ? (
          <nav className="admin-nav" aria-label="Admin">
            {adminLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
            <button type="button" onClick={signOut}>Sign out</button>
          </nav>
        ) : null}
        {children}
      </section>
    </main>
  );
}

export default AdminLayout;
