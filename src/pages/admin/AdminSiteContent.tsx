import { useEffect, useMemo, useState } from 'react';
import AdminImagePicker from '../../components/admin/AdminImagePicker';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminSiteContent, type SiteContentRecord } from '../../lib/adminAuth';
import { parseSiteContentBody, siteContentTemplates, stringifySiteContentBody, type SiteContentTemplate } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

type ContentForm = {
  pageKey: string;
  title: string;
  values: Record<string, string>;
  heroImages: string[];
};

function toContentForm(entry: SiteContentRecord, template: SiteContentTemplate): ContentForm {
  return {
    pageKey: entry.page_key,
    title: entry.title,
    values: parseSiteContentBody(entry.body, template.defaults),
    heroImages: entry.hero_image_url ? [entry.hero_image_url] : template.heroImageUrl ? [template.heroImageUrl] : [],
  };
}

function emptyContentForm(template: SiteContentTemplate): ContentForm {
  return {
    pageKey: template.pageKey,
    title: template.title,
    values: template.defaults,
    heroImages: template.heroImageUrl ? [template.heroImageUrl] : [],
  };
}

function AdminSiteContent() {
  usePageMeta('Admin Site Content', 'Edit public site copy and page imagery.', { robots: 'noindex,nofollow' });
  const [entries, setEntries] = useState<SiteContentRecord[]>([]);
  const [contentForm, setContentForm] = useState<ContentForm>({ pageKey: '', title: '', values: {}, heroImages: [] });
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const contentPages = useMemo(() => siteContentTemplates.filter((template) => template.category === 'content'), []);
  const policyPages = useMemo(() => siteContentTemplates.filter((template) => template.category === 'policy'), []);
  const chromePages = useMemo(() => siteContentTemplates.filter((template) => template.category === 'chrome'), []);
  const systemPages = useMemo(() => siteContentTemplates.filter((template) => template.category === 'system'), []);
  const activeTemplate = useMemo(() => siteContentTemplates.find((item) => item.pageKey === contentForm.pageKey) || null, [contentForm.pageKey]);

  async function loadData() {
    const [me, contentPayload] = await Promise.all([fetchAdminMe(), fetchAdminSiteContent()]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setEntries(contentPayload.entries);
    setContentForm((current) => {
      if (current.pageKey) {
        const currentTemplate = siteContentTemplates.find((template) => template.pageKey === current.pageKey);
        if (!currentTemplate) return current;
        const currentEntry = contentPayload.entries.find((item) => item.page_key === current.pageKey);
        return currentEntry ? toContentForm(currentEntry, currentTemplate) : emptyContentForm(currentTemplate);
      }
      const firstTemplate = siteContentTemplates.find((template) => template.category === 'content');
      if (!firstTemplate) return current;
      const firstEntry = contentPayload.entries.find((item) => item.page_key === firstTemplate.pageKey);
      return firstEntry ? toContentForm(firstEntry, firstTemplate) : emptyContentForm(firstTemplate);
    });
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  function chooseContent(pageKey: string) {
    const template = siteContentTemplates.find((item) => item.pageKey === pageKey);
    if (!template) return;
    const entry = entries.find((item) => item.page_key === pageKey);
    setStatusMessage('');
    setErrorMessage('');
    setContentForm(entry ? toContentForm(entry, template) : emptyContentForm(template));
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
          heroImageUrl: contentForm.heroImages[0] || '',
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
          <p>Edit the live copy, hero images, legal pages, header, and footer from one place.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Editor</h2>
              <p>{activeTemplate ? activeTemplate.pageLabel : 'Select a page'}</p>
            </div>
            <div className="form-shell">
              <div className="input-group">
                <label htmlFor="admin-content-title">Title</label>
                <input id="admin-content-title" value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} />
              </div>
              {activeTemplate && activeTemplate.category !== 'chrome' && activeTemplate.category !== 'system' ? (
                <AdminImagePicker
                  label="Hero Images"
                  images={contentForm.heroImages}
                  onChange={(heroImages) => setContentForm({ ...contentForm, heroImages })}
                  helperText="The first image is used as the active hero image for this page."
                />
              ) : null}
              {activeTemplate?.fields.map((field) => (
                <div className="input-group" key={field.key}>
                  <label htmlFor={`admin-content-${field.key}`}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`admin-content-${field.key}`}
                      value={contentForm.values[field.key] || ''}
                      onChange={(event) => setContentForm({ ...contentForm, values: { ...contentForm.values, [field.key]: event.target.value } })}
                      rows={field.key === 'bodyHtml' ? 18 : 6}
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
              <button className="button button-primary" type="button" onClick={saveContent} disabled={busy || !contentForm.pageKey}>Save page content</button>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Page groups</h2>
              <p>Choose a page to edit</p>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Main pages</h2>
                <p>{contentPages.length}</p>
              </div>
              <div className="admin-route-list">
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
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Policy pages</h2>
                <p>{policyPages.length}</p>
              </div>
              <div className="admin-route-list">
                {policyPages.map((template) => (
                  <button className="admin-list-row admin-list-button" type="button" key={template.pageKey} onClick={() => chooseContent(template.pageKey)}>
                    <div className="admin-record-copy">
                      <strong>{template.pageLabel}</strong>
                      <p>{template.route}</p>
                    </div>
                    <span>Edit</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h2>Header and footer</h2>
                <p>{chromePages.length}</p>
              </div>
              <div className="admin-route-list">
                {chromePages.map((template) => (
                  <button className="admin-list-row admin-list-button" type="button" key={template.pageKey} onClick={() => chooseContent(template.pageKey)}>
                    <div className="admin-record-copy">
                      <strong>{template.pageLabel}</strong>
                      <p>{template.route}</p>
                    </div>
                    <span>Edit</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h2>System pages</h2>
                <p>{systemPages.length}</p>
              </div>
              <div className="admin-data-table">
                <div className="admin-data-head">
                  <span>Page</span>
                  <span>Route</span>
                  <span>Status</span>
                </div>
                {systemPages.map((template) => (
                  <div className="admin-data-row" key={template.pageKey}>
                    <div><strong>{template.pageLabel}</strong></div>
                    <div><p>{template.route}</p></div>
                    <div><p>Managed by app logic</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminSiteContent;
