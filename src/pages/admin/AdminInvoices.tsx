import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import VacationBookingCalendar from '../../components/booking/VacationBookingCalendar';
import { fetchAdminInvoices, fetchAdminMe, fetchAdminRentals, type AdminInvoiceRecord, type RentalRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type InvoiceForm = {
  id?: number;
  serviceType: 'vacation' | 'notary';
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  amount: string;
  description: string;
  notes: string;
  rentalId: string;
  checkIn: string;
  checkOut: string;
  guestCount: string;
  guestListText: string;
  appointmentDate: string;
  appointmentTime: string;
  city: string;
  documentType: string;
};

type SortOption = 'latest-created' | 'status' | 'recipient-name' | 'service-type';

function emptyInvoiceForm(): InvoiceForm {
  return {
    serviceType: 'vacation',
    recipientName: '',
    recipientEmail: 'listingsbyd@gmail.com',
    recipientPhone: '',
    amount: '',
    description: '',
    notes: '',
    rentalId: '',
    checkIn: '',
    checkOut: '',
    guestCount: '1',
    guestListText: '',
    appointmentDate: '',
    appointmentTime: '',
    city: '',
    documentType: '',
  };
}

function centsToDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function dollarsToCents(value: string) {
  const normalized = value.replace(/[^0-9.]/g, '');
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
}

function formatCurrency(amountTotalCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountTotalCents / 100);
}

function toInvoiceForm(invoice: AdminInvoiceRecord): InvoiceForm {
  return {
    id: invoice.id,
    serviceType: invoice.service_type,
    recipientName: invoice.recipient_name,
    recipientEmail: invoice.recipient_email,
    recipientPhone: invoice.recipient_phone,
    amount: centsToDollars(invoice.amount_total_cents),
    description: invoice.description,
    notes: invoice.notes,
    rentalId: invoice.rental_id ? String(invoice.rental_id) : '',
    checkIn: invoice.check_in || '',
    checkOut: invoice.check_out || '',
    guestCount: String(invoice.guest_count || 1),
    guestListText: invoice.guest_list_text || '',
    appointmentDate: invoice.appointment_date || '',
    appointmentTime: invoice.appointment_time || '',
    city: invoice.city || '',
    documentType: invoice.document_type || '',
  };
}

function AdminInvoices() {
  usePageMeta('Admin Invoices', 'Create and manage custom invoices for vacation rentals and notary appointments.', { robots: 'noindex,nofollow' });
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoiceRecord[]>([]);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>(emptyInvoiceForm());
  const [sortBy, setSortBy] = useState<SortOption>('latest-created');
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, rentalsPayload, invoicesPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminRentals(),
      fetchAdminInvoices(),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setRentals(rentalsPayload.rentals);
    setInvoices(invoicesPayload.invoices);
    setInvoiceForm((current) => {
      if (current.rentalId || !rentalsPayload.rentals[0]) return current;
      return { ...current, rentalId: String(rentalsPayload.rentals[0].id) };
    });
  }

  useEffect(() => {
    let alive = true;
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
    const interval = window.setInterval(() => {
      if (!alive) return;
      loadData().catch(() => undefined);
    }, 15000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const sortedInvoices = useMemo(() => {
    const items = [...invoices];
    if (sortBy === 'recipient-name') {
      return items.sort((a, b) => a.recipient_name.localeCompare(b.recipient_name));
    }
    if (sortBy === 'status') {
      return items.sort((a, b) => a.status.localeCompare(b.status) || b.created_at.localeCompare(a.created_at));
    }
    if (sortBy === 'service-type') {
      return items.sort((a, b) => a.service_type.localeCompare(b.service_type) || b.created_at.localeCompare(a.created_at));
    }
    return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [invoices, sortBy]);

  async function saveInvoice() {
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/invoices/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: invoiceForm.id,
          serviceType: invoiceForm.serviceType,
          recipientName: invoiceForm.recipientName,
          recipientEmail: invoiceForm.recipientEmail,
          recipientPhone: invoiceForm.recipientPhone,
          amountTotalCents: dollarsToCents(invoiceForm.amount),
          description: invoiceForm.description,
          notes: invoiceForm.notes,
          rentalId: invoiceForm.rentalId,
          checkIn: invoiceForm.checkIn,
          checkOut: invoiceForm.checkOut,
          guestCount: invoiceForm.guestCount,
          guestListText: invoiceForm.guestListText,
          appointmentDate: invoiceForm.appointmentDate,
          appointmentTime: invoiceForm.appointmentTime,
          city: invoiceForm.city,
          documentType: invoiceForm.documentType,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save invoice.');
      await loadData();
      setStatusMessage('Invoice saved.');
      setInvoiceForm((current) => ({ ...current, id: payload.id || current.id }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save invoice.');
    } finally {
      setBusy(false);
    }
  }

  async function sendInvoice(id: number) {
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not send invoice.');
      await loadData();
      setStatusMessage('Invoice emailed with payment link.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send invoice.');
    } finally {
      setBusy(false);
    }
  }

  async function updateInvoiceStatus(id: number, status: string) {
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/invoices/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not update invoice.');
      await loadData();
      setStatusMessage(status === 'approved' ? 'Invoice approved and synced into the queue.' : 'Invoice updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update invoice.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteInvoice(id: number) {
    const confirmation = window.prompt('Type DELETE to permanently remove this invoice.');
    if (confirmation === null) return;
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/invoices/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, confirmation }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete invoice.');
      await loadData();
      if (invoiceForm.id === id) {
        setInvoiceForm(emptyInvoiceForm());
      }
      setStatusMessage('Invoice deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete invoice.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Quotes and invoices</h1>
          <p>Create custom vacation-rental or notary invoices, email payment links, then approve them into the live queues when ready.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>{invoiceForm.id ? 'Edit invoice' : 'New invoice'}</h2>
              <div className="admin-select-shell admin-sort-shell">
                <label className="sr-only" htmlFor="invoice-service-type">Service type</label>
                <select id="invoice-service-type" value={invoiceForm.serviceType} onChange={(event) => setInvoiceForm({ ...invoiceForm, serviceType: event.target.value as 'vacation' | 'notary' })}>
                  <option value="vacation">Vacation rental</option>
                  <option value="notary">Notary appointment</option>
                </select>
                <ChevronsUpDown size={16} aria-hidden="true" />
              </div>
            </div>

            <div className="form-shell">
              <div className="form-row">
                <div className="input-group"><label htmlFor="invoice-recipient-name">Recipient Name</label><input id="invoice-recipient-name" value={invoiceForm.recipientName} onChange={(event) => setInvoiceForm({ ...invoiceForm, recipientName: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="invoice-recipient-email">Recipient Email</label><input id="invoice-recipient-email" type="email" value={invoiceForm.recipientEmail} onChange={(event) => setInvoiceForm({ ...invoiceForm, recipientEmail: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="invoice-recipient-phone">Recipient Phone</label><input id="invoice-recipient-phone" value={invoiceForm.recipientPhone} onChange={(event) => setInvoiceForm({ ...invoiceForm, recipientPhone: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="invoice-amount">Amount</label><input id="invoice-amount" inputMode="decimal" placeholder="100.00" value={invoiceForm.amount} onChange={(event) => setInvoiceForm({ ...invoiceForm, amount: event.target.value })} /></div>
              </div>
              <div className="input-group"><label htmlFor="invoice-description">Description</label><input id="invoice-description" value={invoiceForm.description} onChange={(event) => setInvoiceForm({ ...invoiceForm, description: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="invoice-notes">Notes</label><textarea id="invoice-notes" value={invoiceForm.notes} onChange={(event) => setInvoiceForm({ ...invoiceForm, notes: event.target.value })} /></div>

              {invoiceForm.serviceType === 'vacation' ? (
                <>
                  <div className="input-group">
                    <label htmlFor="invoice-rental-id">Rental</label>
                    <div className="admin-select-shell">
                      <select id="invoice-rental-id" value={invoiceForm.rentalId} onChange={(event) => setInvoiceForm({ ...invoiceForm, rentalId: event.target.value })}>
                        <option value="">Select rental</option>
                        {rentals.map((rental) => (
                          <option key={rental.id} value={rental.id}>{rental.title}</option>
                        ))}
                      </select>
                      <ChevronsUpDown size={16} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group"><label htmlFor="invoice-check-in">Check-in</label><input id="invoice-check-in" type="date" value={invoiceForm.checkIn} onChange={(event) => setInvoiceForm({ ...invoiceForm, checkIn: event.target.value })} /></div>
                    <div className="input-group"><label htmlFor="invoice-check-out">Check-out</label><input id="invoice-check-out" type="date" value={invoiceForm.checkOut} onChange={(event) => setInvoiceForm({ ...invoiceForm, checkOut: event.target.value })} /></div>
                  </div>
                  <div className="form-row">
                    <div className="input-group"><label htmlFor="invoice-guest-count">Guest Count</label><input id="invoice-guest-count" type="number" min="1" value={invoiceForm.guestCount} onChange={(event) => setInvoiceForm({ ...invoiceForm, guestCount: event.target.value })} /></div>
                  </div>
                  <div className="input-group"><label htmlFor="invoice-guest-list">Guest List</label><textarea id="invoice-guest-list" value={invoiceForm.guestListText} onChange={(event) => setInvoiceForm({ ...invoiceForm, guestListText: event.target.value })} /></div>
                </>
              ) : (
                <>
                  <div className="form-row">
                    <div className="input-group"><label htmlFor="invoice-appointment-date">Appointment Date</label><input id="invoice-appointment-date" type="date" value={invoiceForm.appointmentDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, appointmentDate: event.target.value })} /></div>
                    <div className="input-group"><label htmlFor="invoice-appointment-time">Appointment Time</label><input id="invoice-appointment-time" value={invoiceForm.appointmentTime} onChange={(event) => setInvoiceForm({ ...invoiceForm, appointmentTime: event.target.value })} placeholder="09:00" /></div>
                  </div>
                  <div className="form-row">
                    <div className="input-group"><label htmlFor="invoice-city">City / Town</label><input id="invoice-city" value={invoiceForm.city} onChange={(event) => setInvoiceForm({ ...invoiceForm, city: event.target.value })} /></div>
                    <div className="input-group"><label htmlFor="invoice-document-type">Document Type</label><input id="invoice-document-type" value={invoiceForm.documentType} onChange={(event) => setInvoiceForm({ ...invoiceForm, documentType: event.target.value })} /></div>
                  </div>
                </>
              )}

              <div className="admin-inline-actions">
                <button className="button button-primary" type="button" onClick={saveInvoice} disabled={busy}>Save invoice</button>
                {invoiceForm.id ? <button className="button-secondary" type="button" onClick={() => setInvoiceForm(emptyInvoiceForm())} disabled={busy}>New invoice</button> : null}
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Availability calendar</h2>
              <p>Vacation sync</p>
            </div>
            <VacationBookingCalendar rentalId={Number(invoiceForm.rentalId || 0) || undefined} mode="admin" className="availability-calendar-extended" />
          </section>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Invoice list</h2>
            <div className="admin-queue-toolbar">
              <p>{invoices.length} total</p>
              <div className="admin-select-shell admin-sort-shell">
                <label className="sr-only" htmlFor="invoice-sort">Sort invoices</label>
                <select id="invoice-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
                  <option value="latest-created">Newest added</option>
                  <option value="status">Status</option>
                  <option value="recipient-name">Recipient name</option>
                  <option value="service-type">Service type</option>
                </select>
                <ChevronsUpDown size={16} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="admin-list">
            {sortedInvoices.map((invoice) => (
              <article className="admin-list-row admin-record admin-record-stack" key={invoice.id}>
                <div className="admin-record-copy">
                  <strong>{invoice.recipient_name}</strong>
                  <p>{invoice.service_type === 'vacation' ? `${invoice.check_in || ''} to ${invoice.check_out || ''}` : `${invoice.appointment_date || ''} at ${invoice.appointment_time || ''}`}</p>
                  <p>{invoice.recipient_email} | {invoice.recipient_phone || 'No phone'} | {invoice.service_type}</p>
                  <p>Status: {invoice.status} | Total: {formatCurrency(invoice.amount_total_cents, invoice.currency)}</p>
                  <p>{invoice.description || 'No description entered.'}</p>
                </div>
                <div className="admin-inline-actions">
                  <button className="button-secondary" type="button" onClick={() => setInvoiceForm(toInvoiceForm(invoice))} disabled={busy}>Edit</button>
                  <button className="button-secondary" type="button" onClick={() => sendInvoice(invoice.id)} disabled={busy}>Email</button>
                  {invoice.stripe_checkout_url ? <a className="button-secondary" href={invoice.stripe_checkout_url} target="_blank" rel="noreferrer">Payment link</a> : null}
                  <button className="button-secondary" type="button" onClick={() => updateInvoiceStatus(invoice.id, 'approved')} disabled={busy}>Approve</button>
                  <button className="button-secondary" type="button" onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')} disabled={busy}>Cancel</button>
                  <button className="button-secondary" type="button" onClick={() => deleteInvoice(invoice.id)} disabled={busy}>Delete</button>
                </div>
              </article>
            ))}
            {!sortedInvoices.length ? <p>No invoices yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminInvoices;
