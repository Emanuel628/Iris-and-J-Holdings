import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminNotaryRequests, type NotaryRequestRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function AdminNotaryRequests() {
  usePageMeta('Admin Notary Requests', 'Review paid notary booking requests.', { robots: 'noindex,nofollow' });
  const [requests, setRequests] = useState<NotaryRequestRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, requestsPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminNotaryRequests(),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setRequests(requestsPayload.requests);
  }

  useEffect(() => {
    let alive = true;

    async function refresh() {
      await loadData();
    }

    refresh().catch(() => {
      window.location.href = '/admin/login';
    });
    const interval = window.setInterval(() => {
      if (!alive) return;
      refresh().catch(() => undefined);
    }, 15000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  async function updateRequestStatus(id: number, nextStatus: string) {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/notary-requests/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not update notary request status.');
      await loadData();
      setStatusMessage('Notary request status updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update notary request status.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Notary requests</h1>
          <p>Paid requests with signer details, appointment timing, service notes, and status controls.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Appointments</h2>
            <p>{requests.length} total</p>
          </div>
          <div className="admin-list">
            {requests.map((request) => (
              <article className="admin-list-row admin-record" key={request.id}>
                <div className="admin-record-copy">
                  <strong>{request.full_name}</strong>
                  <p>{request.appointment_date} at {request.appointment_time} | {request.city || 'No city provided'}</p>
                  <p>{request.email} | {request.phone || 'No phone'} | {request.document_type || 'No document type'}</p>
                  <p>Status: {request.status} | Total: {formatCurrency(request.amount_total_cents, request.currency)}</p>
                  <p>Notes: {request.notes || 'No notes submitted.'}</p>
                </div>
                <div className="admin-inline-actions">
                  <button className="button-secondary" type="button" onClick={() => updateRequestStatus(request.id, 'reviewed')} disabled={busy}>Reviewed</button>
                  <button className="button-secondary" type="button" onClick={() => updateRequestStatus(request.id, 'confirmed')} disabled={busy}>Confirmed</button>
                </div>
              </article>
            ))}
            {!requests.length ? <p>No notary requests yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminNotaryRequests;
