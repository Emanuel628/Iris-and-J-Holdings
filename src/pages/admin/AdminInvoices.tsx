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

function formatCurrencyInput(value: string) {
  const normalized = value.replace(/[^0-9.]/g, '');
  if (!normalized) return '';
  const [whole, decimal = ''] = normalized.split('.');
  const formattedWhole = new Intl.NumberFormat('en-US').format(Number(whole || 0));
  return decimal.length ? `$${formattedWhole}.${decimal.slice(0, 2)}` : `$${formattedWhole}`;
}

function parseCurrencyInput(value: string) {
  return value.replace(/[^0-9.]/g, '');
}

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function formatDisplayDate(value: string | null) {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function invoicePrimaryLine(invoice: AdminInvoiceRecord) {
  if (invoice.service_type === 'vacation') {
    const rental = invoice.rental_title || 'Vacation rental';
    const dates = invoice.check_in && invoice.check_out
      ? `${formatDisplayDate(invoice.check_in)} to ${formatDisplayDate(invoice.check_out)}`
      : 'Dates not entered';
    return `${rental} | ${dates}`;
  }
  const appointment = invoice.appointment_date
    ? `${formatDisplayDate(invoice.appointment_date)}${invoice.appointment_time ? ` at ${invoice.appointment_time}` : ''}`
    : 'Appointment date not entered';
  return `Notary appointment | ${appointment}`;
}

function invoiceDetailsLine(invoice: AdminInvoiceRecord) {
  const contact = [
    invoice.recipient_email,
    invoice.recipient_phone || 'No phone',
  ].filter(Boolean).join(' | ');
  const guestDetails = invoice.service_type === 'vacation'
    ? ` | ${invoice.guest_count || 1} guest${Number(invoice.guest_count || 1) === 1 ? '' : 's'}`
    : '';
  return `${contact}${guestDetails}`;
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
    checkIn: dateInputValue(invoice.check_in),
    checkOut: dateInputValue(invoice.check_out),
    guestCount: String(invoice.guest_count || 1),
    guestListText: invoice.guest_list_text || '',
    appointmentDate: dateInputValue(invoice.appointment_date),
    appointmentTime: invoice.appointment_time || '',
    city: invoice.city || '',
    documentType: invoice.document_type || '',
  };
}

function updateInvoicePaymentLink(invoices: AdminInvoiceRecord[], id: number, checkoutUrl: string) {
  return invoices.map((invoice) => (
    invoice.id === id
      ? {
        ...invoice,
        stripe_checkout_url: checkoutUrl || invoice.stripe_checkout_url,
        status: invoice.status === 'approved' ? invoice.status : 'sent',
      }
      : invoice
  ));
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
      const payload = await res.json().catch(() => ({} as { message?: string; id?: number }));
      if (!res.ok) throw new Error(payload.message || `Could not save invoice. Server returned ${res.status}.`);
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
      const payload = await res.json().catch(() => ({} as { message?: string; checkoutUrl?: string }));
      if (!res.ok) throw new Error(payload.message || `Could not send invoice. Server returned ${res.status}.`);
      await loadData();
      if (payload.checkoutUrl) {
        setInvoices((current) => updateInvoicePaymentLink(current, id, payload.checkoutUrl || ''));
      }
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

  async function refundInvoice(id: number) {
    const confirmation = window.prompt('Type REFUND to refund this invoice payment in Stripe.');
    if (confirmation === null) return;
    if (confirmation !== 'REFUND') {
      setErrorMessage('Refund cancelled. Type REFUND to confirm.');
      return;
    }
    setBusy(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/invoices/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not refund invoice.');
      await loadData();
      setStatusMessage(payload.alreadyRefunded ? 'Invoice was already refunded.' : 'Invoice refunded in Stripe.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not refund invoice.');
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
                <div className="input-group"><label htmlFor="invoice-amount">Amount</label><input id="invoice-amount" inputMode="decimal" placeholder="$100.00" value={formatCurrencyInput(invoiceForm.amount)} onChange={(event) => setInvoiceForm({ ...invoiceForm, amount: parseCurrencyInput(event.target.value) })} /></div>
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
                {invoiceForm.id ? <button className="button-secondary" type="button" onClick={() => sendInvoice(invoiceForm.id!)} disabled={busy}>Send invoice</button> : null}
                {invoiceForm.id ? <button className="button-secondary" type="button" onClick={() => setInvoiceForm(emptyInvoiceForm())} disabled={busy}>New invoice</button> : null}
              </div>
              <p className="form-note">Use Send invoice after saving to email a Stripe payment link. The Payment link button appears in the invoice list after the link is created.</p>
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
                  <p>{invoicePrimaryLine(invoice)}</p>
                  <p><a href={`mailto:${invoice.recipient_email}`}>{invoiceDetailsLine(invoice)}</a></p>
                  <p>Status: {invoice.status} | Total: {formatCurrency(invoice.amount_total_cents, invoice.currency)}</p>
                  {invoice.description ? <p>{invoice.description}</p> : null}
                  {invoice.notes ? <p>Notes: {invoice.notes}</p> : null}
                </div>
                <div className="admin-inline-actions">
                  <button className="button-secondary" type="button" onClick={() => setInvoiceForm(toInvoiceForm(invoice))} disabled={busy}>Edit</button>
                  <button className="button-secondary" type="button" onClick={() => sendInvoice(invoice.id)} disabled={busy}>Send</button>
                  {invoice.stripe_checkout_url ? <a className="button-secondary" href={invoice.stripe_checkout_url} target="_blank" rel="noreferrer">Payment link</a> : null}
                  <button className="button-secondary" type="button" onClick={() => updateInvoiceStatus(invoice.id, 'approved')} disabled={busy}>Approve</button>
                  <button className="button-secondary" type="button" onClick={() => refundInvoice(invoice.id)} disabled={busy || invoice.status === 'refunded'}>Refund</button>
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
