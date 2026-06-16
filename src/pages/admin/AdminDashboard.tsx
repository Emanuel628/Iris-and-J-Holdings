function AdminDashboard() {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <h1>Admin</h1>
        <nav>
          <a href="/admin/leads">Leads</a>
          <a href="/admin/appointments">Appointments</a>
          <a href="/admin/media">Media</a>
          <a href="/admin/settings">Settings</a>
        </nav>
      </aside>
      <section className="admin-content">
        <div className="admin-header">
          <p className="eyebrow">Dashboard</p>
          <h1>Everything organized in one place.</h1>
          <p>Quick overview for leads, appointments, and media.</p>
        </div>
        <div className="admin-grid">
          <article className="admin-card"><span>New Leads</span><strong>0</strong></article>
          <article className="admin-card"><span>Appointments</span><strong>0</strong></article>
          <article className="admin-card"><span>Media Items</span><strong>0</strong></article>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
