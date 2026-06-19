import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
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

type SortOption = 'upcoming' | 'latest-created' | 'client-name';

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function formatShortDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).format(date);
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
  const [editingId, setEditingId] = useState<number>(initialEditId);
  const [form, setForm] = useState<NotaryForm | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('upcoming');
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

  const sortedRequests = useMemo(() => {
    const items = [...requests];
    if (sortBy === 'client-name') {
      return items.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
    if (sortBy === 'latest-created') {
      return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return items.sort((a, b) => {
      const byDate = a.appointment_date.localeCompare(b.appointment_date);
      if (byDate !== 0) return byDate;
      return a.appointment_time.localeCompare(b.appointment_time);
    });
  }, [requests, sortBy]);

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
      setEditingId(0);
      setForm(null);
      window.history.replaceState({}, '', '/admin/notary-requests');
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
      if (editingId === id) {
        setEditingId(0);
        setForm(null);
        window.history.replaceState({}, '', '/admin/notary-requests');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete notary request.');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(request: NotaryRequestRecord) {
    setEditingId(request.id);
    setForm(toNotaryForm(request));
    window.history.replaceState({}, '', `/admin/notary-requests?edit=${request.id}`);
  }

  function cancelEdit() {
    setEditingId(0);
    setForm(null);
    window.history.replaceState({}, '', '/admin/notary-requests');
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Notary queue</h1>
          <p>Live appointment records with upcoming appointments first, later dates later, and direct row-level editing.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Queue</h2>
            <div className="admin-queue-toolbar">
              <p>{requests.length} total</p>
              <div className="admin-select-shell admin-sort-shell">
                <label className="sr-only" htmlFor="notary-sort">Sort appointments</label>
                <select id="notary-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
                  <option value="upcoming">Upcoming first</option>
                  <option value="latest-created">Newest added</option>
                  <option value="client-name">Client name</option>
                </select>
                <ChevronsUpDown size={16} aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="admin-list">
            {sortedRequests.map((request) => {
              const isEditing = editingId === request.id && form?.id === request.id;
              return (
                <article className="admin-list-row admin-record admin-record-stack" key={request.id}>
                  <div className="admin-record-copy">
                    <strong>{request.full_name}</strong>
                    <p>{formatShortDate(request.appointment_date)} at {request.appointment_time} | {request.city || 'No city provided'}</p>
                    <p><a href={`mailto:${request.email}`}>{request.email}</a> | {request.phone || 'No phone'} | {request.document_type || 'No document type'}</p>
                    <p>Status: {request.status} | Total: {formatCurrency(request.amount_total_cents, request.currency)}</p>
                    <p>Notes: {request.notes || 'No notes submitted.'}</p>
                  </div>
                  <div className="admin-inline-actions">
                    <button className="button-secondary" type="button" onClick={() => startEdit(request)} disabled={busy}>{isEditing ? 'Editing' : 'Edit'}</button>
                    <button className="button-secondary" type="button" onClick={() => deleteRequest(request.id)} disabled={busy}>Delete</button>
                  </div>
                  {isEditing && form ? (
                    <div className="form-shell admin-record-editor">
                      <div className="form-row">
                        <div className="input-group"><label htmlFor={`notary-full-name-${request.id}`}>Full Name</label><input id={`notary-full-name-${request.id}`} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></div>
                        <div className="input-group"><label htmlFor={`notary-email-${request.id}`}>Email</label><input id={`notary-email-${request.id}`} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
                      </div>
                      <div className="form-row">
                        <div className="input-group"><label htmlFor={`notary-phone-${request.id}`}>Phone</label><input id={`notary-phone-${request.id}`} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
                        <div className="input-group"><label htmlFor={`notary-city-${request.id}`}>City / Town</label><input id={`notary-city-${request.id}`} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
                      </div>
                      <div className="form-row">
                        <div className="input-group"><label htmlFor={`notary-date-${request.id}`}>Appointment Date</label><input id={`notary-date-${request.id}`} type="date" value={form.appointmentDate} onChange={(event) => setForm({ ...form, appointmentDate: event.target.value })} /></div>
                        <div className="input-group"><label htmlFor={`notary-time-${request.id}`}>Appointment Time</label><input id={`notary-time-${request.id}`} value={form.appointmentTime} onChange={(event) => setForm({ ...form, appointmentTime: event.target.value })} /></div>
                      </div>
                      <div className="input-group"><label htmlFor={`notary-document-type-${request.id}`}>Document Type</label><input id={`notary-document-type-${request.id}`} value={form.documentType} onChange={(event) => setForm({ ...form, documentType: event.target.value })} /></div>
                      <div className="input-group"><label htmlFor={`notary-notes-${request.id}`}>Notes</label><textarea id={`notary-notes-${request.id}`} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></div>
                      <div className="input-group">
                        <label htmlFor={`notary-status-${request.id}`}>Status</label>
                        <select id={`notary-status-${request.id}`} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                          <option value="paid">Paid</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="approved">Approved</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div className="admin-inline-actions">
                        <button className="button button-primary" type="button" onClick={saveRequest} disabled={busy}>Save changes</button>
                        <button className="button-secondary" type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {!sortedRequests.length ? <p>No notary requests yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminNotaryRequests;
