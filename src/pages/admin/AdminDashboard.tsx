import AdminLayout from '../../components/layout/AdminLayout';

function AdminDashboard() {
  return (
    <AdminLayout title="Admin">
      <div className="admin-header">
        <p className="eyebrow">Dashboard</p>
        <h1>Everything organized in one place.</h1>
        <p>Quick overview for requests, appointments, and media.</p>
      </div>
      <div className="admin-grid">
        <article className="admin-card"><span>New Requests</span><strong>0</strong></article>
        <article className="admin-card"><span>Appointments</span><strong>0</strong></article>
        <article className="admin-card"><span>Media Items</span><strong>0</strong></article>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
