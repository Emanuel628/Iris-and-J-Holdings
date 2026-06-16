import AdminLayout from '../../components/layout/AdminLayout';

function Leads() {
  return (
    <AdminLayout title="Leads">
      <div className="admin-header">
        <p className="eyebrow">Requests</p>
        <h1>Organize every website request by stage.</h1>
        <p>This page will manage buyer, seller, home value, notary, resource, contact, and vacation rental requests.</p>
      </div>
      <div className="content-grid">
        <article className="content-card"><h3>New</h3><p>Fresh website requests that need review.</p></article>
        <article className="content-card"><h3>Active</h3><p>Requests that are being handled.</p></article>
        <article className="content-card"><h3>Closed</h3><p>Finished or archived requests.</p></article>
      </div>
    </AdminLayout>
  );
}

export default Leads;
