import type { ReactNode } from 'react';

type AdminLayoutProps = {
  children: ReactNode;
};

function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <main className="page-main admin-shell">
      <section className="page-content admin-content">
        {children}
      </section>
    </main>
  );
}

export default AdminLayout;
