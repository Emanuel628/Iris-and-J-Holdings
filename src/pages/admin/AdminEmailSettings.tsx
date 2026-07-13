import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type EmailSettingsForm = {
  emailGlobalNote: string;
  emailSignature: string;
  emailFooter: string;
};

const emptyEmailSettings: EmailSettingsForm = {
  emailGlobalNote: '',
  emailSignature: '',
  emailFooter: '',
};

function AdminEmailSettings() {
  usePageMeta('Admin Email Settings', 'Update global copy appended to outgoing Iris & J Holdings emails.', { robots: 'noindex,nofollow' });
  const [form, setForm] = useState<EmailSettingsForm>(emptyEmailSettings);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, settingsRes] = await Promise.all([
      fetchAdminMe(),
      fetch('/api/admin/email-settings', { headers: { Accept: 'application/json' }, credentials: 'same-origin' }),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    const payload = await settingsRes.json().catch(() => ({}));
    if (!settingsRes.ok) throw new Error(payload.message || 'Could not load email settings.');
    setForm({ ...emptyEmailSettings, ...(payload.settings || {}) });
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  async function saveSettings() {
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save email settings.');
      setStatusMessage('Outgoing email text updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save email settings.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Email settings</h1>
          <p>Update the reusable text appended to outgoing site emails. Leave a field blank if it should not appear.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Global outgoing email copy</h2>
            <p>Applies to booking, invoice, refund, cancellation, contact, and newsletter emails.</p>
          </div>
          <div className="form-shell">
            <div className="input-group">
              <label htmlFor="email-global-note">Global note</label>
              <textarea
                id="email-global-note"
                value={form.emailGlobalNote}
                onChange={(event) => setForm({ ...form, emailGlobalNote: event.target.value })}
                placeholder="Example: Please reply to this email if you have any questions."
              />
            </div>
            <div className="input-group">
              <label htmlFor="email-signature">Signature / closing</label>
              <input
                id="email-signature"
                value={form.emailSignature}
                onChange={(event) => setForm({ ...form, emailSignature: event.target.value })}
                placeholder="Example: Iris & J Holdings"
              />
            </div>
            <div className="input-group">
              <label htmlFor="email-footer">Footer / disclaimer</label>
              <textarea
                id="email-footer"
                value={form.emailFooter}
                onChange={(event) => setForm({ ...form, emailFooter: event.target.value })}
                placeholder="Example: This email contains booking information for the named recipient."
              />
            </div>
            <button className="button button-primary" type="button" onClick={saveSettings} disabled={busy}>
              Save email settings
            </button>
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminEmailSettings;
