import AdminLayout from '../../components/layout/AdminLayout';

function MediaLibrary() {
  return (
    <AdminLayout title="Media">
      <div className="admin-header">
        <p className="eyebrow">Media Library</p>
        <h1>Photos stay controlled, clean, and easy to replace.</h1>
        <p>This page will handle uploads, page image assignment, alt text, reorder controls, and focus position.</p>
      </div>
      <div className="content-grid">
        <article className="content-card"><h3>Hero Images</h3><p>Homepage and service page hero photography.</p></article>
        <article className="content-card"><h3>Page Images</h3><p>Buy, sell, notary, about, and home value images.</p></article>
        <article className="content-card"><h3>Vacation Gallery</h3><p>Future vacation rental photo galleries.</p></article>
      </div>
    </AdminLayout>
  );
}

export default MediaLibrary;
