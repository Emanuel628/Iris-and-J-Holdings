import AdminLayout from '../../components/layout/AdminLayout';

function SiteSettings() {
  return (
    <AdminLayout title="Settings">
      <div className="admin-header">
        <p className="eyebrow">Site Settings</p>
        <h1>Core website details in one place.</h1>
        <p>This page will manage contact details, service areas, brokerage text, footer links, and vacation rental status.</p>
      </div>
      <div className="content-grid">
        <article className="content-card"><h3>Contact</h3><p>Phone, email, and service area details.</p></article>
        <article className="content-card"><h3>Brokerage</h3><p>Brokerage disclosure and compliance text.</p></article>
        <article className="content-card"><h3>Footer</h3><p>Legal links, accessibility note, and social links.</p></article>
      </div>
    </AdminLayout>
  );
}

export default SiteSettings;
