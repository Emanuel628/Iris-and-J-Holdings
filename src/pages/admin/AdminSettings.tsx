import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminSettings, type AdminSettingsPayload } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminSettings() {
  usePageMeta('Admin Settings', 'Operational settings and provider status.', { robots: 'noindex,nofollow' });
  const [payload, setPayload] = useState<AdminSettingsPayload | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });

  async function loadData() {
    const [me, settingsPayload] = await Promise.all([fetchAdminMe(), fetchAdminSettings()]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setPayload(settingsPayload);
    setAdminEmail(me.user.email);
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  async function changePassword() {
    setStatusMessage('');
    setErrorMessage('');
    if (passwordForm.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New password and confirmation must match.');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Could not change password.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMessage('Password updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not change password.');
    }
  }

  async function requestEmailChange() {
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/change-email-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(emailForm),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Could not start the email change.');
      setEmailForm({ newEmail: '', currentPassword: '' });
      setStatusMessage('Verification link sent to the new email address.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not start the email change.');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Settings</p>
          <h1>Account settings</h1>
          <p>Admin account security, current system status, and credential changes live here.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>System status</h2>
            </div>
            <div className="admin-overview-grid admin-overview-cards">
              <div><span>Database</span><strong>{payload?.status.databaseConfigured ? 'On' : 'Off'}</strong></div>
              <div><span>Stripe</span><strong>{payload?.status.stripeConfigured ? 'On' : 'Off'}</strong></div>
              <div><span>Resend</span><strong>{payload?.status.resendConfigured ? 'On' : 'Off'}</strong></div>
              <div><span>RentCast</span><strong>{payload?.status.rentcastConfigured ? 'On' : 'Off'}</strong></div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Email</h2>
              <p>Current sign-in email: {adminEmail || 'Loading...'}</p>
            </div>
            <div className="form-shell">
              <div className="input-group">
                <label htmlFor="settings-email">New Email</label>
                <input id="settings-email" type="email" value={emailForm.newEmail} onChange={(event) => setEmailForm({ ...emailForm, newEmail: event.target.value })} />
              </div>
              <div className="input-group">
                <label htmlFor="settings-email-password">Current Password</label>
                <input id="settings-email-password" type="password" value={emailForm.currentPassword} onChange={(event) => setEmailForm({ ...emailForm, currentPassword: event.target.value })} />
              </div>
              <button className="button button-primary" type="button" onClick={requestEmailChange}>Send verification email</button>
            </div>
          </section>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Change password</h2>
          </div>
          <div className="form-shell">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="settings-current-password">Current Password</label>
                <input id="settings-current-password" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
              </div>
              <div className="input-group">
                <label htmlFor="settings-new-password">New Password</label>
                <input id="settings-new-password" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="settings-confirm-password">Confirm New Password</label>
                <input id="settings-confirm-password" type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} />
              </div>
            </div>
            <button className="button button-primary" type="button" onClick={changePassword}>Update password</button>
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;
