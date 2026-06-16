import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
};

function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <h1>{title}</h1>
        <nav>
          <a href="/admin">Dashboard</a>
          <a href="/admin/leads">Leads</a>
          <a href="/admin/appointments">Appointments</a>
          <a href="/admin/media">Media</a>
          <a href="/admin/settings">Settings</a>
        </nav>
      </aside>
      <section className="admin-content">
        {children}
      </section>
    </main>
  );
}

export default AdminLayout;
