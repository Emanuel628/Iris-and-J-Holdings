import AdminLayout from '../../components/admin/AdminLayout';
import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown, ExternalLink } from 'lucide-react';
import {
  fetchAdminHomeValueEstimates,
  fetchAdminMe,
  fetchAdminSettings,
  type AdminSettingsPayload,
  type HomeValueEstimateRecord,
} from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

const CUSTOM_OPTION = '__custom__';
const PROPERTY_TYPE_OPTIONS = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Co-op', 'Land', 'Mobile Home'];

type Comparable = {
  id?: string;
  formattedAddress?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  price?: number;
  status?: string;
  listedDate?: string;
  removedDate?: string | null;
  daysOnMarket?: number;
  distance?: number;
  daysOld?: number;
  correlation?: number;
};

type EstimateResult = {
  price?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  comparables?: Comparable[];
  subjectProperty?: {
    formattedAddress?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    lotSize?: number;
    yearBuilt?: number;
    lastSaleDate?: string;
    lastSalePrice?: number;
    county?: string;
  };
};

type EstimateResponse = {
  estimate?: EstimateResult;
  usage?: AdminSettingsPayload['rentcastUsage'];
  message?: string;
};

function formatCurrency(value?: number) {
  if (value === undefined || value === null) return 'Not returned';
  const hasCents = Math.abs(value % 1) > 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(value);
}

function formatNumber(value?: number) {
  if (!value) return 'Not returned';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value?: string | null) {
  if (!value) return 'Not returned';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).format(date);
}

function formatDecimal(value?: number, digits = 2) {
  if (value === undefined || value === null) return 'Not returned';
  return value.toFixed(digits);
}

function searchUrl(address?: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(address || '')}`;
}

function AdminHomeValueLab() {
  usePageMeta('Admin Home Value Lab', 'Plan the home value estimator data and API stack.', { robots: 'noindex,nofollow' });
  const [form, setForm] = useState({
    clientName: '',
    address: '',
    city: '',
    state: 'NJ',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    propertyType: 'Single Family',
  });
  const [propertyTypeCustom, setPropertyTypeCustom] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [rentcastConfigured, setRentcastConfigured] = useState(false);
  const [usage, setUsage] = useState<AdminSettingsPayload['rentcastUsage'] | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsStatusMessage, setSettingsStatusMessage] = useState('');
  const [settingsErrorMessage, setSettingsErrorMessage] = useState('');
  const [emailingResults, setEmailingResults] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [savedEstimates, setSavedEstimates] = useState<HomeValueEstimateRecord[]>([]);

  useEffect(() => {
    Promise.all([fetchAdminMe(), fetchAdminSettings(), fetchAdminHomeValueEstimates()])
      .then(([me, settingsPayload, savedPayload]) => {
        if (!me?.user) {
          window.location.href = '/admin/login';
          return;
        }
        setRentcastConfigured(settingsPayload.status.rentcastConfigured);
        setUsage(settingsPayload.rentcastUsage);
        setSettings(settingsPayload.settings);
        setSavedEstimates(savedPayload.estimates);
      })
      .catch(() => {
        window.location.href = '/admin/login';
      });
  }, []);

  async function submitEstimate() {
    setBusy(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/home-value-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          bedrooms: Number(form.bedrooms || 0),
          bathrooms: Number(form.bathrooms || 0),
          squareFootage: Number(form.squareFootage || 0),
          radius: Number(settings.home_value_default_radius || 3),
          daysOld: Number(settings.home_value_default_days_old || 180),
          compCount: Number(settings.home_value_default_comp_count || 12),
        }),
      });
      const payload = await res.json().catch(() => ({} as EstimateResponse));
      if (payload.usage) {
        setUsage(payload.usage);
      }
      if (!res.ok) throw new Error(payload.message || 'Could not retrieve the estimate.');
      setResult(payload.estimate || null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not retrieve the estimate.');
    } finally {
      setBusy(false);
    }
  }

  async function saveDefaults() {
    setSettingsBusy(true);
    setSettingsStatusMessage('');
    setSettingsErrorMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          settings: {
            home_value_default_radius: settings.home_value_default_radius || '3',
            home_value_default_days_old: settings.home_value_default_days_old || '180',
            home_value_default_comp_count: settings.home_value_default_comp_count || '12',
          },
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save the estimator defaults.');
      const settingsPayload = await fetchAdminSettings();
      setUsage(settingsPayload.rentcastUsage);
      setSettings(settingsPayload.settings);
      setSettingsStatusMessage('Estimator defaults saved.');
    } catch (error) {
      setSettingsErrorMessage(error instanceof Error ? error.message : 'Could not save the estimator defaults.');
    } finally {
      setSettingsBusy(false);
    }
  }

  async function emailResults() {
    if (!result) return;
    const recipientEmail = window.prompt('Email comparable sales results to:', 'listingsbyd@gmail.com');
    if (!recipientEmail) return;
    setEmailingResults(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/home-value-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          subjectAddress: subject?.formattedAddress || `${form.address}, ${form.city}, ${form.state} ${form.zipCode}`.trim(),
          estimate: result,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not email the comparable sales.');
      setStatusMessage(`Comparable sales emailed to ${recipientEmail}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not email the comparable sales.');
    } finally {
      setEmailingResults(false);
    }
  }

  async function saveResult() {
    if (!result) return;
    setSavingResult(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const subjectAddress = subject?.formattedAddress || `${form.address}, ${form.city}, ${form.state} ${form.zipCode}`.trim();
      const res = await fetch('/api/admin/home-value-estimates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          subjectAddress,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          propertyType: form.propertyType,
          bedrooms: Number(form.bedrooms || 0),
          bathrooms: Number(form.bathrooms || 0),
          squareFootage: Number(form.squareFootage || 0),
          estimate: result,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save the estimate.');
      const savedPayload = await fetchAdminHomeValueEstimates();
      setSavedEstimates(savedPayload.estimates);
      setStatusMessage(`Estimate saved for ${form.clientName}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save the estimate.');
    } finally {
      setSavingResult(false);
    }
  }

  const propertyTypeSelectValue = propertyTypeCustom ? CUSTOM_OPTION : form.propertyType;
  const comparables = useMemo(() => result?.comparables || [], [result]);
  const subject = result?.subjectProperty;

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-home-value-header">
          <div className="page-intro">
            <p className="eyebrow">Home Value Lab</p>
            <h1>Home value estimator</h1>
            <p>Powered by RentCast.</p>
          </div>
          <aside className="admin-home-usage-card" aria-label="RentCast usage this month">
            <span>RentCast usage</span>
            <strong>{usage ? `${usage.remainingThisMonth} of ${usage.monthlyLimit} hits left this month` : '-- of 50 hits left this month'}</strong>
            <p>{usage ? `${usage.usedThisMonth} used. Resets ${formatDate(usage.resetsOn)}. ${formatCurrency(usage.overageCostPerHitUsd)} per hit after the free plan.` : '$0.20 per hit after 50. Resets monthly.'}</p>
          </aside>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Estimate lookup</h2>
            </div>
            <div className="form-shell">
              <div className="form-row">
                <div className="input-group"><label htmlFor="value-client-admin">Client Name</label><input id="value-client-admin" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="value-address-admin">Address</label><input id="value-address-admin" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="value-city-admin">City</label><input id="value-city-admin" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="value-state-admin">State</label><input id="value-state-admin" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="value-zip-admin">ZIP</label><input id="value-zip-admin" value={form.zipCode} onChange={(event) => setForm({ ...form, zipCode: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="value-beds-admin">Bedrooms</label><input id="value-beds-admin" type="number" value={form.bedrooms} onChange={(event) => setForm({ ...form, bedrooms: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="value-baths-admin">Bathrooms</label><input id="value-baths-admin" type="number" step="0.5" value={form.bathrooms} onChange={(event) => setForm({ ...form, bathrooms: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="value-sqft-admin">Square Footage</label><input id="value-sqft-admin" type="number" value={form.squareFootage} onChange={(event) => setForm({ ...form, squareFootage: event.target.value })} /></div>
                <div className="input-group">
                  <label htmlFor="value-type-admin">Property Type</label>
                  <div className="admin-select-shell">
                    <select
                      id="value-type-admin"
                      value={propertyTypeSelectValue}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        if (nextValue === CUSTOM_OPTION) {
                          setPropertyTypeCustom(true);
                          if (PROPERTY_TYPE_OPTIONS.includes(form.propertyType)) {
                            setForm({ ...form, propertyType: '' });
                          }
                          return;
                        }
                        setPropertyTypeCustom(false);
                        setForm({ ...form, propertyType: nextValue });
                      }}
                    >
                      {PROPERTY_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                      <option value={CUSTOM_OPTION}>Custom</option>
                    </select>
                    <ChevronsUpDown size={16} aria-hidden="true" />
                  </div>
                  {propertyTypeCustom ? (
                    <input
                      value={form.propertyType}
                      onChange={(event) => setForm({ ...form, propertyType: event.target.value })}
                      placeholder="Enter custom property type"
                    />
                  ) : null}
                </div>
              </div>
              <button className="button button-primary" type="button" onClick={submitEstimate} disabled={busy || !rentcastConfigured}>
                {busy ? 'Running estimate...' : 'Run estimate'}
              </button>
              {!rentcastConfigured ? <p className="form-note">Add `RENTCAST_API_KEY` to enable live estimates.</p> : null}
              {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
              {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Live result</h2>
            </div>
            {!result ? <p className="admin-route-copy">Run an estimate to see the provider response, value range, and comparable sale data.</p> : (
              <>
                <div className="admin-overview-grid admin-overview-cards admin-overview-cards-static">
                  <div>
                    <span>Estimated value</span>
                    <strong>{formatCurrency(result.price)}</strong>
                  </div>
                  <div>
                    <span>Low range</span>
                    <strong>{formatCurrency(result.priceRangeLow)}</strong>
                  </div>
                  <div>
                    <span>High range</span>
                    <strong>{formatCurrency(result.priceRangeHigh)}</strong>
                  </div>
                </div>

                <div className="admin-route-list admin-home-value-summary">
                  <div>
                    <strong>Comparable sales returned</strong>
                    <span>{comparables.length}</span>
                    <div className="admin-inline-actions">
                      <button className="button admin-action-save admin-inline-button" type="button" onClick={saveResult} disabled={savingResult || !result || !form.clientName.trim()}>
                        {savingResult ? 'Saving...' : 'Save result'}
                      </button>
                      <button className="button admin-action-email admin-inline-button" type="button" onClick={emailResults} disabled={emailingResults}>
                        {emailingResults ? 'Emailing...' : 'Email results'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <strong>Subject address</strong>
                    <span>{subject?.formattedAddress || 'Not returned'}</span>
                  </div>
                  <div>
                    <strong>Property profile</strong>
                    <span>{subject ? `${subject.propertyType || 'Unknown'} | ${subject.bedrooms || 0} bd | ${subject.bathrooms || 0} ba | ${formatNumber(subject.squareFootage)} sq ft` : 'Not returned'}</span>
                  </div>
                </div>

                <section className="admin-section admin-section-compact admin-home-value-section">
                  <div className="admin-section-head">
                    <h2>Subject property</h2>
                  </div>
                  <div className="admin-data-table">
                    <div className="admin-data-head">
                      <span>Address</span>
                      <span>Property</span>
                      <span>History</span>
                      <span>Location</span>
                    </div>
                    <div className="admin-data-row">
                      <div>
                        <strong>{subject?.formattedAddress || 'Not returned'}</strong>
                        <p>{subject?.county || 'County not returned'}</p>
                      </div>
                      <div>
                        <p>{subject?.propertyType || 'Not returned'}</p>
                        <p>{subject?.bedrooms || 0} bd | {subject?.bathrooms || 0} ba</p>
                        <p>{formatNumber(subject?.squareFootage)} sq ft | Lot {formatNumber(subject?.lotSize)} sq ft</p>
                      </div>
                      <div>
                        <p>Built {subject?.yearBuilt || 'Not returned'}</p>
                        <p>Last sale {formatDate(subject?.lastSaleDate)}</p>
                        <p>{formatCurrency(subject?.lastSalePrice)}</p>
                      </div>
                      <div>
                        <p>Range low {formatCurrency(result.priceRangeLow)}</p>
                        <p>Range high {formatCurrency(result.priceRangeHigh)}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="admin-section admin-section-compact admin-home-value-section">
                  <div className="admin-section-head">
                    <h2>Comparable sales</h2>
                    <p>{comparables.length} records</p>
                  </div>
                  <div className="admin-data-table">
                    <div className="admin-data-head admin-home-comps-head">
                      <span>Address</span>
                      <span>Property</span>
                      <span>Market</span>
                      <span>Match</span>
                    </div>
                    {comparables.map((comp, index) => (
                      <div className="admin-data-row admin-home-comps-row" key={comp.id || `${comp.formattedAddress}-${index}`}>
                        <div>
                          <strong>{comp.formattedAddress || 'Not returned'}</strong>
                          <p>{comp.propertyType || 'Property type not returned'}</p>
                          {comp.formattedAddress ? <a className="admin-comp-link" href={searchUrl(comp.formattedAddress)} target="_blank" rel="noreferrer">Search address <ExternalLink size={14} /></a> : null}
                        </div>
                        <div>
                          <p>{comp.bedrooms || 0} bd | {comp.bathrooms || 0} ba</p>
                          <p>{formatNumber(comp.squareFootage)} sq ft</p>
                          <p>{formatCurrency(comp.price)}</p>
                        </div>
                        <div>
                          <p>{comp.status || 'Status not returned'}</p>
                          <p>Listed {formatDate(comp.listedDate)}</p>
                          <p>{comp.daysOnMarket ?? 'Not returned'} DOM | {comp.daysOld ?? 'Not returned'} days old</p>
                        </div>
                        <div>
                          <p>{formatDecimal(comp.distance)} mi away</p>
                          <p>Correlation {formatDecimal(comp.correlation, 3)}</p>
                          <p>Removed {formatDate(comp.removedDate)}</p>
                        </div>
                      </div>
                    ))}
                    {!comparables.length ? <p className="admin-empty-note">No comparable sales were returned.</p> : null}
                  </div>
                </section>
              </>
            )}
          </section>
        </section>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>What drives the estimate</h2>
              <p>Fully wired inputs</p>
            </div>
            <div className="admin-route-list admin-home-value-summary">
              <div>
                <strong>Property identity</strong>
                <span>Address, city, state, ZIP, and property type anchor the property and market context.</span>
              </div>
              <div>
                <strong>Core home facts</strong>
                <span>Bedrooms, bathrooms, and square footage are the main home-characteristic signals sent on each AVM request.</span>
              </div>
              <div>
                <strong>Comparable search controls</strong>
                <span>Search radius, comparable age, and comparable count control how broad and how recent the sales set will be.</span>
              </div>
              <div>
                <strong>Returned market data</strong>
                <span>The estimate comes back with a value, value range, subject-property facts, and comparable sales for review.</span>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Estimator defaults</h2>
              <p>Applied to every lookup</p>
            </div>
            <div className="form-shell">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="setting-radius">Default Radius (miles)</label>
                  <input id="setting-radius" value={settings.home_value_default_radius || ''} onChange={(event) => setSettings({ ...settings, home_value_default_radius: event.target.value })} />
                </div>
                <div className="input-group">
                  <label htmlFor="setting-days">Default Days Old</label>
                  <input id="setting-days" value={settings.home_value_default_days_old || ''} onChange={(event) => setSettings({ ...settings, home_value_default_days_old: event.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="setting-comps">Default Comparable Count</label>
                  <input id="setting-comps" value={settings.home_value_default_comp_count || ''} onChange={(event) => setSettings({ ...settings, home_value_default_comp_count: event.target.value })} />
                </div>
              </div>
              <button className="button button-primary" type="button" onClick={saveDefaults} disabled={settingsBusy}>Save estimator defaults</button>
              {settingsStatusMessage ? <p className="form-status form-status-success">{settingsStatusMessage}</p> : null}
              {settingsErrorMessage ? <p className="form-status form-status-error" role="alert">{settingsErrorMessage}</p> : null}
            </div>
          </section>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Saved estimates</h2>
            <p>{savedEstimates.length} saved</p>
          </div>
          <div className="admin-list">
            {savedEstimates.map((estimate) => (
              <article className="admin-list-row admin-record admin-record-stack" key={estimate.id}>
                <div className="admin-record-copy">
                  <strong>{estimate.client_name}</strong>
                  <p>{estimate.subject_address}</p>
                  <p>{estimate.property_type || 'Property type not saved'} | {estimate.bedrooms || 0} bd | {estimate.bathrooms || 0} ba | {formatNumber(estimate.square_footage)} sq ft</p>
                  <p>Estimate: {formatCurrency(estimate.estimated_value)} | Range: {formatCurrency(estimate.low_range)} - {formatCurrency(estimate.high_range)}</p>
                  <p>Saved {formatDate(estimate.created_at)}</p>
                </div>
              </article>
            ))}
            {!savedEstimates.length ? <p className="admin-empty-note">No saved estimates yet.</p> : null}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminHomeValueLab;
