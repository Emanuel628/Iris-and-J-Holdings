import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminSettings, type AdminSettingsPayload } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminSettings() {
  usePageMeta('Admin Settings', 'Operational settings and provider status.', { robots: 'noindex,nofollow' });
  const [payload, setPayload] = useState<AdminSettingsPayload | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, settingsPayload] = await Promise.all([fetchAdminMe(), fetchAdminSettings()]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setPayload(settingsPayload);
    setSettings(settingsPayload.settings);
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  async function saveSettings() {
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || 'Could not save settings.');
      await loadData();
      setStatusMessage('Settings saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save settings.');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Settings</p>
          <h1>Operational settings</h1>
          <p>Provider status, home-value defaults, and core control-center configuration live here.</p>
        </div>

        <section className="admin-section">
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

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Home value defaults</h2>
          </div>
          <div className="form-shell">
            <div className="form-row">
              <div className="input-group"><label htmlFor="setting-provider">Provider</label><input id="setting-provider" value={settings.home_value_provider || ''} onChange={(event) => setSettings({ ...settings, home_value_provider: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="setting-radius">Default Radius (miles)</label><input id="setting-radius" value={settings.home_value_default_radius || ''} onChange={(event) => setSettings({ ...settings, home_value_default_radius: event.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label htmlFor="setting-days">Default Days Old</label><input id="setting-days" value={settings.home_value_default_days_old || ''} onChange={(event) => setSettings({ ...settings, home_value_default_days_old: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="setting-comps">Default Comparable Count</label><input id="setting-comps" value={settings.home_value_default_comp_count || ''} onChange={(event) => setSettings({ ...settings, home_value_default_comp_count: event.target.value })} /></div>
            </div>
            <button className="button button-primary" type="button" onClick={saveSettings}>Save settings</button>
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;
