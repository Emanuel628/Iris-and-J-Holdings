import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminSiteContent, type SiteContentRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type ContentForm = {
  pageKey: string;
  title: string;
  body: string;
  heroImageUrl: string;
};

function toContentForm(entry: SiteContentRecord): ContentForm {
  return {
    pageKey: entry.page_key,
    title: entry.title,
    body: entry.body,
    heroImageUrl: entry.hero_image_url,
  };
}

function AdminSiteContent() {
  usePageMeta('Admin Site Content', 'Edit public site copy and page imagery.', { robots: 'noindex,nofollow' });
  const [entries, setEntries] = useState<SiteContentRecord[]>([]);
  const [contentForm, setContentForm] = useState<ContentForm>({ pageKey: '', title: '', body: '', heroImageUrl: '' });
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, contentPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminSiteContent(),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setEntries(contentPayload.entries);
    if (!contentForm.pageKey && contentPayload.entries[0]) {
      setContentForm(toContentForm(contentPayload.entries[0]));
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  const contentOptions = useMemo(() => entries.map((entry) => ({ key: entry.page_key, title: entry.title })), [entries]);

  function chooseContent(pageKey: string) {
    const entry = entries.find((item) => item.page_key === pageKey);
    if (entry) setContentForm(toContentForm(entry));
  }

  async function saveContent() {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(contentForm),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save content.');
      await loadData();
      setStatusMessage('Site content saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save content.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Site content</h1>
          <p>Edit page copy and image URLs for the public site.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Editor</h2>
            <select value={contentForm.pageKey} onChange={(event) => chooseContent(event.target.value)}>
              <option value="">Select page</option>
              {contentOptions.map((entry) => (
                <option key={entry.key} value={entry.key}>{entry.title}</option>
              ))}
            </select>
          </div>
          <div className="form-shell">
            <div className="input-group"><label htmlFor="admin-content-title">Title</label><input id="admin-content-title" value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} /></div>
            <div className="input-group"><label htmlFor="admin-content-image">Hero Image URL</label><input id="admin-content-image" value={contentForm.heroImageUrl} onChange={(event) => setContentForm({ ...contentForm, heroImageUrl: event.target.value })} /></div>
            <div className="input-group"><label htmlFor="admin-content-body">Body</label><textarea id="admin-content-body" value={contentForm.body} onChange={(event) => setContentForm({ ...contentForm, body: event.target.value })} /></div>
            <button className="button button-primary" type="button" onClick={saveContent} disabled={busy}>Save page content</button>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Pages</h2>
            <p>{entries.length} total</p>
          </div>
          <div className="admin-list">
            {entries.map((entry) => (
              <button className="admin-list-row admin-list-button" type="button" key={entry.id} onClick={() => chooseContent(entry.page_key)}>
                <div className="admin-record-copy">
                  <strong>{entry.title}</strong>
                  <p>{entry.page_key}</p>
                </div>
                <span>Edit</span>
              </button>
            ))}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminSiteContent;
