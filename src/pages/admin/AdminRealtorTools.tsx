import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminBuyerLeads,
  fetchAdminMe,
  fetchAdminSellerLeads,
  type BuyerLeadRecord,
  type SellerLeadRecord,
} from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type BuyerLeadForm = {
  clientName: string;
  email: string;
  phone: string;
  targetAreas: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  financingStatus: string;
  notes: string;
};

type SellerLeadForm = {
  clientName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  targetPrice: string;
  timeline: string;
  occupancyStatus: string;
  notes: string;
};

function emptyBuyerLeadForm(): BuyerLeadForm {
  return {
    clientName: '',
    email: '',
    phone: '',
    targetAreas: '',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
    financingStatus: '',
    notes: '',
  };
}

function emptySellerLeadForm(): SellerLeadForm {
  return {
    clientName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    targetPrice: '',
    timeline: '',
    occupancyStatus: '',
    notes: '',
  };
}

function formatCurrency(amount: number) {
  if (!amount) return '--';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function AdminRealtorTools() {
  usePageMeta('Admin Realtor Tools', 'Track buyer and seller intake records.', { robots: 'noindex,nofollow' });
  const [buyerLeads, setBuyerLeads] = useState<BuyerLeadRecord[]>([]);
  const [sellerLeads, setSellerLeads] = useState<SellerLeadRecord[]>([]);
  const [buyerForm, setBuyerForm] = useState<BuyerLeadForm>(emptyBuyerLeadForm());
  const [sellerForm, setSellerForm] = useState<SellerLeadForm>(emptySellerLeadForm());
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, buyersPayload, sellersPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminBuyerLeads(),
      fetchAdminSellerLeads(),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setBuyerLeads(buyersPayload.leads);
    setSellerLeads(sellersPayload.leads);
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  async function saveBuyerLead() {
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/buyer-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          clientName: buyerForm.clientName,
          email: buyerForm.email,
          phone: buyerForm.phone,
          targetAreas: buyerForm.targetAreas,
          budgetMin: Number(buyerForm.budgetMin || 0),
          budgetMax: Number(buyerForm.budgetMax || 0),
          timeline: buyerForm.timeline,
          financingStatus: buyerForm.financingStatus,
          notes: buyerForm.notes,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save buyer lead.');
      await loadData();
      setBuyerForm(emptyBuyerLeadForm());
      setStatusMessage('Buyer intake saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save buyer lead.');
    } finally {
      setBusy(false);
    }
  }

  async function saveSellerLead() {
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/seller-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          clientName: sellerForm.clientName,
          email: sellerForm.email,
          phone: sellerForm.phone,
          propertyAddress: sellerForm.propertyAddress,
          targetPrice: Number(sellerForm.targetPrice || 0),
          timeline: sellerForm.timeline,
          occupancyStatus: sellerForm.occupancyStatus,
          notes: sellerForm.notes,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save seller lead.');
      await loadData();
      setSellerForm(emptySellerLeadForm());
      setStatusMessage('Seller intake saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save seller lead.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Realtor Tools</p>
          <h1>Buyer and seller intake</h1>
          <p>Private working records for consultations, follow-up, pricing conversations, and pipeline tracking.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Buyer intake</h2>
            </div>
            <div className="form-shell">
              <div className="form-row">
                <div className="input-group"><label htmlFor="buyer-client-name">Client Name</label><input id="buyer-client-name" value={buyerForm.clientName} onChange={(event) => setBuyerForm({ ...buyerForm, clientName: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="buyer-email">Email</label><input id="buyer-email" type="email" value={buyerForm.email} onChange={(event) => setBuyerForm({ ...buyerForm, email: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="buyer-phone">Phone</label><input id="buyer-phone" value={buyerForm.phone} onChange={(event) => setBuyerForm({ ...buyerForm, phone: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="buyer-areas">Target Areas</label><input id="buyer-areas" value={buyerForm.targetAreas} onChange={(event) => setBuyerForm({ ...buyerForm, targetAreas: event.target.value })} placeholder="Union, Middlesex, Essex..." /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="buyer-budget-min">Budget Min</label><input id="buyer-budget-min" type="number" value={buyerForm.budgetMin} onChange={(event) => setBuyerForm({ ...buyerForm, budgetMin: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="buyer-budget-max">Budget Max</label><input id="buyer-budget-max" type="number" value={buyerForm.budgetMax} onChange={(event) => setBuyerForm({ ...buyerForm, budgetMax: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="buyer-timeline">Timeline</label><input id="buyer-timeline" value={buyerForm.timeline} onChange={(event) => setBuyerForm({ ...buyerForm, timeline: event.target.value })} placeholder="30 days, 3 months, just starting..." /></div>
                <div className="input-group"><label htmlFor="buyer-financing">Financing Status</label><input id="buyer-financing" value={buyerForm.financingStatus} onChange={(event) => setBuyerForm({ ...buyerForm, financingStatus: event.target.value })} placeholder="Cash, pre-approved, needs lender..." /></div>
              </div>
              <div className="input-group"><label htmlFor="buyer-notes">Notes</label><textarea id="buyer-notes" value={buyerForm.notes} onChange={(event) => setBuyerForm({ ...buyerForm, notes: event.target.value })} /></div>
              <button className="button button-primary" type="button" onClick={saveBuyerLead} disabled={busy}>Save buyer intake</button>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Seller intake</h2>
            </div>
            <div className="form-shell">
              <div className="form-row">
                <div className="input-group"><label htmlFor="seller-client-name">Client Name</label><input id="seller-client-name" value={sellerForm.clientName} onChange={(event) => setSellerForm({ ...sellerForm, clientName: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="seller-email">Email</label><input id="seller-email" type="email" value={sellerForm.email} onChange={(event) => setSellerForm({ ...sellerForm, email: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="seller-phone">Phone</label><input id="seller-phone" value={sellerForm.phone} onChange={(event) => setSellerForm({ ...sellerForm, phone: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="seller-address">Property Address</label><input id="seller-address" value={sellerForm.propertyAddress} onChange={(event) => setSellerForm({ ...sellerForm, propertyAddress: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="seller-target-price">Target Price</label><input id="seller-target-price" type="number" value={sellerForm.targetPrice} onChange={(event) => setSellerForm({ ...sellerForm, targetPrice: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="seller-timeline">Timeline</label><input id="seller-timeline" value={sellerForm.timeline} onChange={(event) => setSellerForm({ ...sellerForm, timeline: event.target.value })} placeholder="ASAP, 60 days, later this year..." /></div>
              </div>
              <div className="input-group"><label htmlFor="seller-occupancy">Occupancy Status</label><input id="seller-occupancy" value={sellerForm.occupancyStatus} onChange={(event) => setSellerForm({ ...sellerForm, occupancyStatus: event.target.value })} placeholder="Owner occupied, tenant occupied, vacant..." /></div>
              <div className="input-group"><label htmlFor="seller-notes">Notes</label><textarea id="seller-notes" value={sellerForm.notes} onChange={(event) => setSellerForm({ ...sellerForm, notes: event.target.value })} /></div>
              <button className="button button-primary" type="button" onClick={saveSellerLead} disabled={busy}>Save seller intake</button>
            </div>
          </section>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Saved buyer records</h2>
            <p>{buyerLeads.length} total</p>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-head">
              <span>Client</span>
              <span>Contact</span>
              <span>Search</span>
              <span>Notes</span>
            </div>
            {buyerLeads.map((lead) => (
              <div className="admin-data-row" key={lead.id}>
                <div>
                  <strong>{lead.client_name}</strong>
                  <p>{new Date(lead.created_at).toLocaleDateString('en-US')}</p>
                </div>
                <div>
                  <p>{lead.email}</p>
                  <p>{lead.phone || 'No phone'}</p>
                </div>
                <div>
                  <p>{lead.target_areas || 'No areas yet'}</p>
                  <p>{formatCurrency(lead.budget_min)} to {formatCurrency(lead.budget_max)}</p>
                  <p>{lead.timeline || 'No timeline'} | {lead.financing_status || 'No financing note'}</p>
                </div>
                <div><p>{lead.notes || 'No notes saved.'}</p></div>
              </div>
            ))}
            {!buyerLeads.length ? <p className="admin-empty-note">No buyer intake records saved yet.</p> : null}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Saved seller records</h2>
            <p>{sellerLeads.length} total</p>
          </div>
          <div className="admin-data-table">
            <div className="admin-data-head">
              <span>Client</span>
              <span>Contact</span>
              <span>Property</span>
              <span>Notes</span>
            </div>
            {sellerLeads.map((lead) => (
              <div className="admin-data-row" key={lead.id}>
                <div>
                  <strong>{lead.client_name}</strong>
                  <p>{new Date(lead.created_at).toLocaleDateString('en-US')}</p>
                </div>
                <div>
                  <p>{lead.email}</p>
                  <p>{lead.phone || 'No phone'}</p>
                </div>
                <div>
                  <p>{lead.property_address || 'No address saved'}</p>
                  <p>{formatCurrency(lead.target_price)}</p>
                  <p>{lead.timeline || 'No timeline'} | {lead.occupancy_status || 'No occupancy note'}</p>
                </div>
                <div><p>{lead.notes || 'No notes saved.'}</p></div>
              </div>
            ))}
            {!sellerLeads.length ? <p className="admin-empty-note">No seller intake records saved yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminRealtorTools;
