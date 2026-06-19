import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminRentals, fetchAdminSiteContent, type RentalRecord, type SiteContentRecord } from '../../lib/adminAuth';
import { siteContentTemplates } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminMediaLibrary() {
  usePageMeta('Admin Media Library', 'Manage hero images and rental galleries.', { robots: 'noindex,nofollow' });
  const [siteEntries, setSiteEntries] = useState<SiteContentRecord[]>([]);
  const [rentals, setRentals] = useState<RentalRecord[]>([]);

  useEffect(() => {
    Promise.all([fetchAdminMe(), fetchAdminSiteContent(), fetchAdminRentals()])
      .then(([me, sitePayload, rentalsPayload]) => {
        if (!me?.user) {
          window.location.href = '/admin/login';
          return;
        }
        setSiteEntries(sitePayload.entries);
        setRentals(rentalsPayload.rentals);
      })
      .catch(() => {
        window.location.href = '/admin/login';
      });
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Media</p>
          <h1>Image controls</h1>
          <p>Hero image swaps for the main pages and gallery image control for rentals live here.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Public page hero images</h2>
            <a href="/admin/site-content">Open editor</a>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-head">
              <span>Page</span>
              <span>Route</span>
              <span>Current Hero URL</span>
              <span>Control</span>
            </div>
            {siteContentTemplates.filter((template) => template.category === 'content').map((template) => {
              const entry = siteEntries.find((item) => item.page_key === template.pageKey);
              return (
                <div className="admin-data-row" key={template.pageKey}>
                  <div><strong>{template.pageLabel}</strong></div>
                  <div><p>{template.route}</p></div>
                  <div>
                    {entry?.hero_image_url || template.heroImageUrl ? (
                      <p><a href={entry?.hero_image_url || template.heroImageUrl || '#'} target="_blank" rel="noreferrer">{entry?.hero_image_url || template.heroImageUrl}</a></p>
                    ) : (
                      <p>No override saved</p>
                    )}
                  </div>
                  <div><a href="/admin/site-content">Edit in Site Content</a></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Rental galleries</h2>
            <a href="/admin/rentals">Open rentals</a>
          </div>
          <div className="admin-list">
            {rentals.map((rental) => (
              <div className="admin-list-row admin-record" key={rental.id}>
                <div className="admin-record-copy">
                  <strong>{rental.title}</strong>
                  <p>
                    Hero:{' '}
                    {rental.hero_image_url ? <a href={rental.hero_image_url} target="_blank" rel="noreferrer">{rental.hero_image_url}</a> : 'No hero image set'}
                  </p>
                  <p>Gallery images: {(rental.gallery_image_urls || []).length}</p>
                  {(rental.gallery_image_urls || []).length ? (
                    <div className="admin-route-list">
                      {(rental.gallery_image_urls || []).map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>
                      ))}
                    </div>
                  ) : null}
                </div>
                <a className="button-secondary" href="/admin/rentals">Manage rental media</a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminMediaLibrary;

