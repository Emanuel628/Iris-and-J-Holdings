import AdminLayout from '../../components/admin/AdminLayout';
import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown, ExternalLink } from 'lucide-react';
import { fetchAdminMe, fetchAdminSettings, type AdminSettingsPayload } from '../../lib/adminAuth';
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
  if (!value) return 'Not returned';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
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
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [rentcastConfigured, setRentcastConfigured] = useState(false);
  const [usage, setUsage] = useState<AdminSettingsPayload['rentcastUsage'] | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminMe(), fetchAdminSettings()])
      .then(([me, settingsPayload]) => {
        if (!me?.user) {
          window.location.href = '/admin/login';
          return;
        }
        setRentcastConfigured(settingsPayload.status.rentcastConfigured);
        setUsage(settingsPayload.rentcastUsage);
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
                <div className="input-group"><label htmlFor="value-address-admin">Address</label><input id="value-address-admin" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="value-city-admin">City</label><input id="value-city-admin" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
              </div>
              <div className="form-row">
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

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Research note</h2>
          </div>
          <p className="admin-route-copy">
            Zillow says its Zestimate uses public records, MLS feeds, user-submitted facts, market trends, and a neural-network-based model, and it presents a range rather than just one price. That means we should not ship a fake single-number tool. The next step is choosing the property-data or AVM source and then wiring the intake around it.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminHomeValueLab;
