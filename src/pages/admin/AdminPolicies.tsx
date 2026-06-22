import { useEffect, useState } from 'react';
import AdminImagePicker from '../../components/admin/AdminImagePicker';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminSiteContent, type SiteContentRecord } from '../../lib/adminAuth';
import { siteContentTemplates } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminPolicies() {
  usePageMeta('Admin Policies', 'Manage policy and legal copy.', { robots: 'noindex,nofollow' });
  const [entries, setEntries] = useState<SiteContentRecord[]>([]);
  const [selectedKey, setSelectedKey] = useState('terms');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData(nextKey = selectedKey) {
    const [me, contentPayload] = await Promise.all([fetchAdminMe(), fetchAdminSiteContent()]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setEntries(contentPayload.entries);
    const entry = contentPayload.entries.find((item) => item.page_key === nextKey);
    const template = siteContentTemplates.find((item) => item.pageKey === nextKey);
    setTitle(entry?.title || template?.title || '');
    setBody(entry?.body || '');
    setHeroImages(entry?.hero_image_url ? [entry.hero_image_url] : []);
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  async function savePolicy() {
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ pageKey: selectedKey, title, body, heroImageUrl: heroImages[0] || '' }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save policy.');
      await loadData(selectedKey);
      setStatusMessage('Policy saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save policy.');
    }
  }

  const policyPages = siteContentTemplates.filter((template) => template.category === 'policy');

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Policies</p>
          <h1>Policy and legal copy</h1>
          <p>Edit house rules, terms, privacy, accessibility, and refund policy copy from one place.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Policy pages</h2>
            </div>
            <div className="admin-route-list">
              {policyPages.map((template) => (
                <button className="admin-list-row admin-list-button" type="button" key={template.pageKey} onClick={() => {
                  setSelectedKey(template.pageKey);
                  const entry = entries.find((item) => item.page_key === template.pageKey);
                  setTitle(entry?.title || template.title);
                  setBody(entry?.body || '');
                  setHeroImages(entry?.hero_image_url ? [entry.hero_image_url] : []);
                }}>
                  <div className="admin-record-copy">
                    <strong>{template.pageLabel}</strong>
                    <p>{template.route}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Editor</h2>
              <p>{selectedKey}</p>
            </div>
            <div className="form-shell">
              <div className="input-group"><label htmlFor="policy-title">Title</label><input id="policy-title" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
              <AdminImagePicker
                label="Hero Images"
                images={heroImages}
                onChange={setHeroImages}
                helperText="The first image is used as the active hero image for this policy page."
              />
              <div className="input-group"><label htmlFor="policy-body">Body</label><textarea id="policy-body" value={body} onChange={(event) => setBody(event.target.value)} rows={18} /></div>
              <button className="button button-primary" type="button" onClick={savePolicy}>Save policy</button>
              <p className="form-note">Use this for live legal copy. One page per record.</p>
            </div>
          </section>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminPolicies;
