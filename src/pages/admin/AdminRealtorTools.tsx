import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
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
  id?: number;
  clientName: string;
  email: string;
  phone: string;
  targetAreas: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  financingStatus: string;
  approvalStatus: string;
  notes: string;
};

type SellerLeadForm = {
  id?: number;
  clientName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  targetPrice: string;
  timeline: string;
  occupancyStatus: string;
  notes: string;
};

const CUSTOM_OPTION = '__custom__';
const BUYER_TIMELINE_OPTIONS = ['7 days', '14 days', '30 days', '60 days', '90 days', '6 months', '1 year', '2+ years'];
const BUYER_FINANCING_OPTIONS = ['Cash', 'Conventional loan', 'FHA loan', 'VA loan', 'USDA loan', 'Other financing'];
const BUYER_APPROVAL_OPTIONS = ['Pre-approved', 'Looking for approval', 'Needs lender referral', 'Paying cash'];
const SELLER_TIMELINE_OPTIONS = ['ASAP', '30 days', '60 days', '90 days', '6 months', '1 year'];
const SELLER_OCCUPANCY_OPTIONS = ['Owner occupied', 'Tenant occupied', 'Vacant', 'Seasonal use'];

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
    approvalStatus: '',
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

function renderSelectWithCustom({
  id,
  label,
  value,
  options,
  customActive,
  setCustomActive,
  onSelectChange,
  onCustomChange,
  customPlaceholder,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  customActive: boolean;
  setCustomActive: (value: boolean) => void;
  onSelectChange: (value: string) => void;
  onCustomChange: (value: string) => void;
  customPlaceholder: string;
}) {
  const selectedValue = customActive ? CUSTOM_OPTION : value;

  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <div className="admin-select-shell">
        <select
          id={id}
          value={selectedValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (nextValue === CUSTOM_OPTION) {
              setCustomActive(true);
              if (options.includes(value)) {
                onCustomChange('');
              }
              return;
            }
            setCustomActive(false);
            onSelectChange(nextValue);
          }}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
          <option value={CUSTOM_OPTION}>Custom</option>
        </select>
        <ChevronsUpDown size={16} aria-hidden="true" />
      </div>
      {customActive ? (
        <input
          value={value}
          onChange={(event) => onCustomChange(event.target.value)}
          placeholder={customPlaceholder}
        />
      ) : null}
    </div>
  );
}

function AdminRealtorTools() {
  usePageMeta('Admin Realtor Tools', 'Track buyer and seller intake records.', { robots: 'noindex,nofollow' });
  const [buyerLeads, setBuyerLeads] = useState<BuyerLeadRecord[]>([]);
  const [sellerLeads, setSellerLeads] = useState<SellerLeadRecord[]>([]);
  const [buyerForm, setBuyerForm] = useState<BuyerLeadForm>(emptyBuyerLeadForm());
  const [sellerForm, setSellerForm] = useState<SellerLeadForm>(emptySellerLeadForm());
  const [buyerTimelineCustom, setBuyerTimelineCustom] = useState(false);
  const [buyerFinancingCustom, setBuyerFinancingCustom] = useState(false);
  const [buyerApprovalCustom, setBuyerApprovalCustom] = useState(false);
  const [sellerTimelineCustom, setSellerTimelineCustom] = useState(false);
  const [sellerOccupancyCustom, setSellerOccupancyCustom] = useState(false);
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
          id: buyerForm.id,
          clientName: buyerForm.clientName,
          email: buyerForm.email,
          phone: buyerForm.phone,
          targetAreas: buyerForm.targetAreas,
          budgetMin: Number(buyerForm.budgetMin || 0),
          budgetMax: Number(buyerForm.budgetMax || 0),
          timeline: buyerForm.timeline,
          financingStatus: buyerForm.financingStatus,
          approvalStatus: buyerForm.approvalStatus,
          notes: buyerForm.notes,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save buyer lead.');
      await loadData();
      setBuyerForm(emptyBuyerLeadForm());
      setBuyerTimelineCustom(false);
      setBuyerFinancingCustom(false);
      setBuyerApprovalCustom(false);
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
          id: sellerForm.id,
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
      setSellerTimelineCustom(false);
      setSellerOccupancyCustom(false);
      setStatusMessage('Seller intake saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save seller lead.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteBuyerLead(id: number) {
    if (!window.confirm('Delete this buyer record?')) return;
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/buyer-leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete buyer record.');
      await loadData();
      if (buyerForm.id === id) {
        setBuyerForm(emptyBuyerLeadForm());
        setBuyerTimelineCustom(false);
        setBuyerFinancingCustom(false);
        setBuyerApprovalCustom(false);
      }
      setStatusMessage('Buyer record deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete buyer record.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteSellerLead(id: number) {
    if (!window.confirm('Delete this seller record?')) return;
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/seller-leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete seller record.');
      await loadData();
      if (sellerForm.id === id) {
        setSellerForm(emptySellerLeadForm());
        setSellerTimelineCustom(false);
        setSellerOccupancyCustom(false);
      }
      setStatusMessage('Seller record deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete seller record.');
    } finally {
      setBusy(false);
    }
  }

  const buyerLeadRows = useMemo(() => buyerLeads, [buyerLeads]);
  const sellerLeadRows = useMemo(() => sellerLeads, [sellerLeads]);

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
                {renderSelectWithCustom({
                  id: 'buyer-timeline',
                  label: 'Timeline',
                  value: buyerForm.timeline,
                  options: BUYER_TIMELINE_OPTIONS,
                  customActive: buyerTimelineCustom,
                  setCustomActive: setBuyerTimelineCustom,
                  onSelectChange: (value) => setBuyerForm({ ...buyerForm, timeline: value }),
                  onCustomChange: (value) => setBuyerForm({ ...buyerForm, timeline: value }),
                  customPlaceholder: 'Enter custom timeline',
                })}
                {renderSelectWithCustom({
                  id: 'buyer-financing',
                  label: 'Financing Status',
                  value: buyerForm.financingStatus,
                  options: BUYER_FINANCING_OPTIONS,
                  customActive: buyerFinancingCustom,
                  setCustomActive: setBuyerFinancingCustom,
                  onSelectChange: (value) => setBuyerForm({ ...buyerForm, financingStatus: value }),
                  onCustomChange: (value) => setBuyerForm({ ...buyerForm, financingStatus: value }),
                  customPlaceholder: 'Enter custom financing status',
                })}
              </div>
              <div className="form-row">
                {renderSelectWithCustom({
                  id: 'buyer-approval',
                  label: 'Approval Status',
                  value: buyerForm.approvalStatus,
                  options: BUYER_APPROVAL_OPTIONS,
                  customActive: buyerApprovalCustom,
                  setCustomActive: setBuyerApprovalCustom,
                  onSelectChange: (value) => setBuyerForm({ ...buyerForm, approvalStatus: value }),
                  onCustomChange: (value) => setBuyerForm({ ...buyerForm, approvalStatus: value }),
                  customPlaceholder: 'Enter custom approval status',
                })}
                <div className="input-group" aria-hidden="true" />
              </div>
              <div className="input-group"><label htmlFor="buyer-notes">Notes</label><textarea id="buyer-notes" value={buyerForm.notes} onChange={(event) => setBuyerForm({ ...buyerForm, notes: event.target.value })} /></div>
              <div className="admin-inline-actions">
                <button className="button button-primary" type="button" onClick={saveBuyerLead} disabled={busy}>{buyerForm.id ? 'Update buyer intake' : 'Save buyer intake'}</button>
                {buyerForm.id ? <button className="button-secondary" type="button" onClick={() => {
                  setBuyerForm(emptyBuyerLeadForm());
                  setBuyerTimelineCustom(false);
                  setBuyerFinancingCustom(false);
                  setBuyerApprovalCustom(false);
                }} disabled={busy}>Cancel edit</button> : null}
              </div>
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
                {renderSelectWithCustom({
                  id: 'seller-timeline',
                  label: 'Timeline',
                  value: sellerForm.timeline,
                  options: SELLER_TIMELINE_OPTIONS,
                  customActive: sellerTimelineCustom,
                  setCustomActive: setSellerTimelineCustom,
                  onSelectChange: (value) => setSellerForm({ ...sellerForm, timeline: value }),
                  onCustomChange: (value) => setSellerForm({ ...sellerForm, timeline: value }),
                  customPlaceholder: 'Enter custom timeline',
                })}
              </div>
              {renderSelectWithCustom({
                id: 'seller-occupancy',
                label: 'Occupancy Status',
                value: sellerForm.occupancyStatus,
                options: SELLER_OCCUPANCY_OPTIONS,
                customActive: sellerOccupancyCustom,
                setCustomActive: setSellerOccupancyCustom,
                onSelectChange: (value) => setSellerForm({ ...sellerForm, occupancyStatus: value }),
                onCustomChange: (value) => setSellerForm({ ...sellerForm, occupancyStatus: value }),
                customPlaceholder: 'Enter custom occupancy status',
              })}
              <div className="input-group"><label htmlFor="seller-notes">Notes</label><textarea id="seller-notes" value={sellerForm.notes} onChange={(event) => setSellerForm({ ...sellerForm, notes: event.target.value })} /></div>
              <div className="admin-inline-actions">
                <button className="button button-primary" type="button" onClick={saveSellerLead} disabled={busy}>{sellerForm.id ? 'Update seller intake' : 'Save seller intake'}</button>
                {sellerForm.id ? <button className="button-secondary" type="button" onClick={() => {
                  setSellerForm(emptySellerLeadForm());
                  setSellerTimelineCustom(false);
                  setSellerOccupancyCustom(false);
                }} disabled={busy}>Cancel edit</button> : null}
              </div>
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
            {buyerLeadRows.map((lead) => (
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
                  <p>{lead.approval_status || 'No approval note'}</p>
                </div>
                <div>
                  <p>{lead.notes || 'No notes saved.'}</p>
                  <div className="admin-inline-actions">
                    <button className="button-secondary" type="button" onClick={() => {
                      setBuyerForm({
                        id: lead.id,
                        clientName: lead.client_name,
                        email: lead.email,
                        phone: lead.phone,
                        targetAreas: lead.target_areas,
                        budgetMin: String(lead.budget_min || ''),
                        budgetMax: String(lead.budget_max || ''),
                        timeline: lead.timeline,
                        financingStatus: lead.financing_status,
                        approvalStatus: lead.approval_status,
                        notes: lead.notes,
                      });
                      setBuyerTimelineCustom(!BUYER_TIMELINE_OPTIONS.includes(lead.timeline));
                      setBuyerFinancingCustom(!BUYER_FINANCING_OPTIONS.includes(lead.financing_status));
                      setBuyerApprovalCustom(!BUYER_APPROVAL_OPTIONS.includes(lead.approval_status));
                    }}>Edit</button>
                    <button className="button-secondary" type="button" onClick={() => deleteBuyerLead(lead.id)} disabled={busy}>Delete</button>
                  </div>
                </div>
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
            {sellerLeadRows.map((lead) => (
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
                <div>
                  <p>{lead.notes || 'No notes saved.'}</p>
                  <div className="admin-inline-actions">
                    <button className="button-secondary" type="button" onClick={() => {
                      setSellerForm({
                        id: lead.id,
                        clientName: lead.client_name,
                        email: lead.email,
                        phone: lead.phone,
                        propertyAddress: lead.property_address,
                        targetPrice: String(lead.target_price || ''),
                        timeline: lead.timeline,
                        occupancyStatus: lead.occupancy_status,
                        notes: lead.notes,
                      });
                      setSellerTimelineCustom(!SELLER_TIMELINE_OPTIONS.includes(lead.timeline));
                      setSellerOccupancyCustom(!SELLER_OCCUPANCY_OPTIONS.includes(lead.occupancy_status));
                    }}>Edit</button>
                    <button className="button-secondary" type="button" onClick={() => deleteSellerLead(lead.id)} disabled={busy}>Delete</button>
                  </div>
                </div>
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
