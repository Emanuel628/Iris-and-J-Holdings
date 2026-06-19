import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
};

const adminLinks = [
  { href: '/admin', label: 'Control Center' },
  { href: '/admin/rentals', label: 'Rentals' },
  { href: '/admin/vacation-bookings', label: 'Booked Dates' },
  { href: '/admin/notary-requests', label: 'Notary' },
  { href: '/admin/site-content', label: 'Site Content' },
];

function AdminLayout({ children }: AdminLayoutProps) {
  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST', headers: { Accept: 'application/json' } }).catch(() => undefined);
    window.location.href = '/admin/login';
  }

  return (
    <main className="page-main admin-shell">
      <section className="page-content admin-content">
        <nav className="admin-nav" aria-label="Admin">
          {adminLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
          <button type="button" onClick={signOut}>Sign out</button>
        </nav>
        {children}
      </section>
    </main>
  );
}

export default AdminLayout;
