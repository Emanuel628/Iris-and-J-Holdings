import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminSiteContent, type SiteContentRecord } from '../../lib/adminAuth';
import { parseSiteContentBody, siteContentTemplates, stringifySiteContentBody, type SiteContentTemplate } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

type ContentForm = {
  pageKey: string;
  title: string;
  values: Record<string, string>;
  heroImageUrl: string;
};

function toContentForm(entry: SiteContentRecord, template: SiteContentTemplate): ContentForm {
  return {
    pageKey: entry.page_key,
    title: entry.title,
    values: parseSiteContentBody(entry.body, template.defaults),
    heroImageUrl: entry.hero_image_url,
  };
}

function AdminSiteContent() {
  usePageMeta('Admin Site Content', 'Edit public site copy and page imagery.', { robots: 'noindex,nofollow' });
  const [entries, setEntries] = useState<SiteContentRecord[]>([]);
  const [contentForm, setContentForm] = useState<ContentForm>({ pageKey: '', title: '', values: {}, heroImageUrl: '' });
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
    if (!contentForm.pageKey) {
      const firstTemplate = siteContentTemplates.find((template) => template.category === 'content');
      if (firstTemplate) {
        const entry = contentPayload.entries.find((item) => item.page_key === firstTemplate.pageKey);
        setContentForm(
          entry
            ? toContentForm(entry, firstTemplate)
            : { pageKey: firstTemplate.pageKey, title: firstTemplate.title, values: firstTemplate.defaults, heroImageUrl: firstTemplate.heroImageUrl || '' },
        );
      }
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  const contentPages = useMemo(() => siteContentTemplates.filter((template) => template.category === 'content'), []);
  const systemPages = useMemo(() => siteContentTemplates.filter((template) => template.category === 'system'), []);

  function chooseContent(pageKey: string) {
    const template = siteContentTemplates.find((item) => item.pageKey === pageKey);
    if (!template) return;
    const entry = entries.find((item) => item.page_key === pageKey);
    setContentForm(
      entry
        ? toContentForm(entry, template)
        : { pageKey: template.pageKey, title: template.title, values: template.defaults, heroImageUrl: template.heroImageUrl || '' },
    );
  }

  async function saveContent() {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          pageKey: contentForm.pageKey,
          title: contentForm.title,
          heroImageUrl: contentForm.heroImageUrl,
          body: stringifySiteContentBody(contentForm.values),
        }),
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
          <p className="eyebrow">Site Content</p>
          <h1>Site content</h1>
          <p>Edit the live copy fields used by the main public-facing pages. Policy pages are managed in the Policies route.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Editor</h2>
            <p>{contentForm.pageKey || 'Select a page'}</p>
          </div>
          <div className="form-shell">
            <div className="input-group"><label htmlFor="admin-content-title">Title</label><input id="admin-content-title" value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} /></div>
            <div className="input-group"><label htmlFor="admin-content-image">Hero Image URL</label><input id="admin-content-image" value={contentForm.heroImageUrl} onChange={(event) => setContentForm({ ...contentForm, heroImageUrl: event.target.value })} /></div>
            {siteContentTemplates.find((item) => item.pageKey === contentForm.pageKey)?.fields.map((field) => (
              <div className="input-group" key={field.key}>
                <label htmlFor={`admin-content-${field.key}`}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={`admin-content-${field.key}`}
                    value={contentForm.values[field.key] || ''}
                    onChange={(event) => setContentForm({ ...contentForm, values: { ...contentForm.values, [field.key]: event.target.value } })}
                  />
                ) : (
                  <input
                    id={`admin-content-${field.key}`}
                    value={contentForm.values[field.key] || ''}
                    onChange={(event) => setContentForm({ ...contentForm, values: { ...contentForm.values, [field.key]: event.target.value } })}
                  />
                )}
              </div>
            ))}
            <button className="button button-primary" type="button" onClick={saveContent} disabled={busy}>Save page content</button>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Content pages</h2>
            <p>{contentPages.length} editable</p>
          </div>
          <div className="admin-list">
            {contentPages.map((template) => (
              <button className="admin-list-row admin-list-button" type="button" key={template.pageKey} onClick={() => chooseContent(template.pageKey)}>
                <div className="admin-record-copy">
                  <strong>{template.pageLabel}</strong>
                  <p>{template.route}</p>
                </div>
                <span>Edit</span>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>All routes on the site</h2>
            <p>Policies and system pages included</p>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-head">
              <span>Page</span>
              <span>Route</span>
              <span>Type</span>
              <span>Control</span>
            </div>
            {[...contentPages, ...siteContentTemplates.filter((template) => template.category === 'policy'), ...systemPages].map((template) => (
              <div className="admin-data-row" key={template.pageKey}>
                <div><strong>{template.pageLabel}</strong></div>
                <div><p>{template.route}</p></div>
                <div><p>{template.category}</p></div>
                <div>
                  {template.category === 'content' ? <button className="button-secondary" type="button" onClick={() => chooseContent(template.pageKey)}>Edit here</button> : null}
                  {template.category === 'policy' ? <a href="/admin/policies">Open Policies</a> : null}
                  {template.category === 'system' ? <p>Dynamic system page</p> : null}
                </div>
              </div>
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

