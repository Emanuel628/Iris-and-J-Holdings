import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminMe, fetchAdminNotaryRequests, type NotaryRequestRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type NotaryForm = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  appointmentDate: string;
  appointmentTime: string;
  documentType: string;
  notes: string;
  status: string;
};

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function toNotaryForm(request: NotaryRequestRecord): NotaryForm {
  return {
    id: request.id,
    fullName: request.full_name,
    email: request.email,
    phone: request.phone,
    city: request.city,
    appointmentDate: request.appointment_date,
    appointmentTime: request.appointment_time,
    documentType: request.document_type,
    notes: request.notes,
    status: request.status,
  };
}

function AdminNotaryRequests() {
  usePageMeta('Notary Queue', 'Review paid notary booking requests.', { robots: 'noindex,nofollow' });
  const initialEditId = Number(new URLSearchParams(window.location.search).get('edit') || 0) || 0;
  const [requests, setRequests] = useState<NotaryRequestRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number>(initialEditId);
  const [form, setForm] = useState<NotaryForm | null>(null);
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
    setSelectedId((current) => {
      if (current && requestsPayload.requests.some((item) => item.id === current)) {
        return current;
      }
      return requestsPayload.requests[0]?.id || 0;
    });
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

  const selectedRequest = useMemo(
    () => requests.find((item) => item.id === selectedId) || null,
    [requests, selectedId],
  );

  useEffect(() => {
    if (selectedRequest) {
      setForm(toNotaryForm(selectedRequest));
      window.history.replaceState({}, '', `/admin/notary-requests?edit=${selectedRequest.id}`);
    } else {
      setForm(null);
      window.history.replaceState({}, '', '/admin/notary-requests');
    }
  }, [selectedRequest]);

  async function saveRequest() {
    if (!form) return;
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/notary-requests/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: form.id,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          documentType: form.documentType,
          notes: form.notes,
          status: form.status,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save notary request.');
      await loadData();
      setStatusMessage('Notary request updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save notary request.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteRequest(id: number) {
    const confirmation = window.prompt('Type DELETE to permanently remove this appointment.');
    if (confirmation === null) return;

    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/notary-requests/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, confirmation }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete notary request.');
      await loadData();
      setStatusMessage('Notary appointment deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete notary request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Notary queue</h1>
          <p>Live appointment records with signer details, dates, notes, totals, and management actions.</p>
        </div>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Queue</h2>
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
                    <button className="button-secondary" type="button" onClick={() => setSelectedId(request.id)} disabled={busy}>Edit</button>
                    <button className="button-secondary" type="button" onClick={() => deleteRequest(request.id)} disabled={busy}>Delete</button>
                  </div>
                </article>
              ))}
              {!requests.length ? <p>No notary requests yet.</p> : null}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Edit appointment</h2>
              <p>{selectedRequest ? `#${selectedRequest.id}` : 'Select an appointment'}</p>
            </div>
            {form ? (
              <div className="form-shell">
                <div className="form-row">
                  <div className="input-group"><label htmlFor="notary-full-name">Full Name</label><input id="notary-full-name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></div>
                  <div className="input-group"><label htmlFor="notary-email">Email</label><input id="notary-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="input-group"><label htmlFor="notary-phone">Phone</label><input id="notary-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
                  <div className="input-group"><label htmlFor="notary-city">City / Town</label><input id="notary-city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="input-group"><label htmlFor="notary-date">Appointment Date</label><input id="notary-date" type="date" value={form.appointmentDate} onChange={(event) => setForm({ ...form, appointmentDate: event.target.value })} /></div>
                  <div className="input-group"><label htmlFor="notary-time">Appointment Time</label><input id="notary-time" value={form.appointmentTime} onChange={(event) => setForm({ ...form, appointmentTime: event.target.value })} /></div>
                </div>
                <div className="input-group"><label htmlFor="notary-document-type">Document Type</label><input id="notary-document-type" value={form.documentType} onChange={(event) => setForm({ ...form, documentType: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="notary-notes">Notes</label><textarea id="notary-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
                <div className="input-group">
                  <label htmlFor="notary-status">Status</label>
                  <select id="notary-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    <option value="paid">Paid</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="admin-inline-actions">
                  <button className="button button-primary" type="button" onClick={saveRequest} disabled={busy}>Save changes</button>
                  <button className="button-secondary" type="button" onClick={() => deleteRequest(form.id)} disabled={busy}>Delete appointment</button>
                </div>
              </div>
            ) : (
              <p>Select an appointment from the queue to edit it.</p>
            )}
          </section>
        </div>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminNotaryRequests;
