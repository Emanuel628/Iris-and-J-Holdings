import AdminLayout from '../../components/admin/AdminLayout';
import { useEffect, useState } from 'react';
import { fetchAdminMe, fetchAdminSettings } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

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
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<any>(null);
  const [rentcastConfigured, setRentcastConfigured] = useState(false);

  useEffect(() => {
    Promise.all([fetchAdminMe(), fetchAdminSettings()])
      .then(([me, settingsPayload]) => {
        if (!me?.user) {
          window.location.href = '/admin/login';
          return;
        }
        setRentcastConfigured(settingsPayload.status.rentcastConfigured);
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
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not retrieve the estimate.');
      setResult(payload.estimate);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not retrieve the estimate.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Home Value Lab</p>
          <h1>Home value estimator</h1>
          <p>Run a live estimate from the admin side using external property data. This route uses RentCast when `RENTCAST_API_KEY` is configured.</p>
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
                <div className="input-group"><label htmlFor="value-type-admin">Property Type</label><input id="value-type-admin" value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value })} /></div>
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
                <div className="admin-route-list">
                  <div>
                    <strong>Estimated value</strong>
                    <span>{result.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(result.price) : 'Not returned'}</span>
                  </div>
                  <div>
                    <strong>Confidence range</strong>
                    <span>
                      {result.priceRangeLow || result.priceRangeHigh
                        ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(result.priceRangeLow || 0)} to ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(result.priceRangeHigh || 0)}`
                        : 'Not returned'}
                    </span>
                  </div>
                  <div>
                    <strong>Comparable sales returned</strong>
                    <span>{Array.isArray(result.comparables) ? result.comparables.length : 0}</span>
                  </div>
                </div>
                <pre className="admin-json-block">{JSON.stringify(result, null, 2)}</pre>
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

