import { useEffect, useMemo, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import AdminImagePicker from '../../components/admin/AdminImagePicker';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminBlockedDates, fetchAdminMe, fetchAdminRentals, type BlockedDateRecord, type RentalRecord } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type RentalForm = {
  id?: number;
  title: string;
  locationLabel: string;
  description: string;
  nightlyRate: string;
  cleaningFee: string;
  maxGuests: string;
  heroImages: string[];
  heroImageCaptions: string[];
  galleryImages: string[];
  galleryImageCaptions: string[];
  amenities: string;
  isActive: boolean;
};

type BlockForm = {
  rentalId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

function emptyRentalForm(): RentalForm {
  return {
    title: '',
    locationLabel: '',
    description: '',
    nightlyRate: '',
    cleaningFee: '',
    maxGuests: '10',
    heroImages: [],
    heroImageCaptions: [],
    galleryImages: [],
    galleryImageCaptions: [],
    amenities: '',
    isActive: true,
  };
}

function toRentalForm(rental: RentalRecord): RentalForm {
  return {
    id: rental.id,
    title: rental.title,
    locationLabel: rental.location_label,
    description: rental.description,
    nightlyRate: (rental.nightly_rate_cents / 100).toFixed(2),
    cleaningFee: (rental.cleaning_fee_cents / 100).toFixed(2),
    maxGuests: String(rental.max_guests),
    heroImages: rental.hero_image_url ? [rental.hero_image_url] : [],
    heroImageCaptions: rental.hero_image_captions || [],
    galleryImages: rental.gallery_image_urls || [],
    galleryImageCaptions: rental.gallery_image_captions || [],
    amenities: (rental.amenities || []).join('\n'),
    isActive: rental.is_active,
  };
}

function dollarsToCents(value: string) {
  const normalized = value.replace(/[^0-9.]/g, '');
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100);
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

function AdminRentals() {
  usePageMeta('Admin Rentals', 'Manage rentals and availability controls.', { robots: 'noindex,nofollow' });
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRecord[]>([]);
  const [rentalForm, setRentalForm] = useState<RentalForm>(emptyRentalForm());
  const [blockForm, setBlockForm] = useState<BlockForm>({ rentalId: '', startDate: '', endDate: '', reason: '' });
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const selectedRentalLabel = useMemo(
    () => rentals.find((item) => item.id === rentalForm.id)?.title ?? 'New rental',
    [rentals, rentalForm.id],
  );

  async function loadData() {
    const [me, rentalsPayload, blockedPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminRentals(),
      fetchAdminBlockedDates(),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setRentals(rentalsPayload.rentals);
    setBlockedDates(blockedPayload.blockedDates);
    if (!blockForm.rentalId && rentalsPayload.rentals[0]) {
      setBlockForm((current) => ({ ...current, rentalId: String(rentalsPayload.rentals[0].id) }));
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  async function saveRental() {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: rentalForm.id,
          title: rentalForm.title,
          locationLabel: rentalForm.locationLabel,
          description: rentalForm.description,
          nightlyRateCents: dollarsToCents(rentalForm.nightlyRate),
          cleaningFeeCents: dollarsToCents(rentalForm.cleaningFee),
          maxGuests: Number(rentalForm.maxGuests || 10),
          heroImageUrl: rentalForm.heroImages[0] || '',
          heroImageCaptions: rentalForm.heroImageCaptions,
          galleryImageUrls: rentalForm.galleryImages.join('\n'),
          galleryImageCaptions: rentalForm.galleryImageCaptions,
          amenities: rentalForm.amenities,
          isActive: rentalForm.isActive,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save rental.');
      await loadData();
      setStatusMessage('Rental saved.');
      setRentalForm(emptyRentalForm());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save rental.');
    } finally {
      setBusy(false);
    }
  }

  async function createBlockedDate() {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          rentalId: Number(blockForm.rentalId),
          startDate: blockForm.startDate,
          endDate: blockForm.endDate,
          reason: blockForm.reason,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not create blocked date.');
      await loadData();
      setStatusMessage('Availability hold saved.');
      setBlockForm((current) => ({ ...current, startDate: '', endDate: '', reason: '' }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create blocked date.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteBlockedDate(id: number) {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/blocked-dates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete blocked date.');
      await loadData();
      setStatusMessage('Availability hold removed.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete blocked date.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteRental() {
    if (!rentalForm.id) return;
    const confirmation = window.prompt('Type DELETE to permanently remove this rental.');
    if (confirmation === null) return;

    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/rentals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: rentalForm.id, confirmation }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete rental.');
      await loadData();
      setRentalForm(emptyRentalForm());
      setStatusMessage('Rental deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete rental.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Rentals</h1>
          <p>Manage rental records, rates, images, and manual availability controls.</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Rental Editor</h2>
            <div className="admin-select-shell">
              <label className="sr-only" htmlFor="admin-rental-select">Select rental</label>
              <select
                id="admin-rental-select"
                value={rentalForm.id || ''}
                onChange={(event) => {
                  const rental = rentals.find((item) => item.id === Number(event.target.value));
                  setRentalForm(rental ? toRentalForm(rental) : emptyRentalForm());
                }}
              >
                <option value="">{selectedRentalLabel}</option>
                {rentals.map((rental) => (
                  <option key={rental.id} value={rental.id}>{rental.title}</option>
                ))}
              </select>
              <ChevronsUpDown size={16} aria-hidden="true" />
            </div>
          </div>
          <div className="form-shell">
            <div className="form-row">
              <div className="input-group"><label htmlFor="admin-rental-title">Title</label><input id="admin-rental-title" value={rentalForm.title} onChange={(event) => setRentalForm({ ...rentalForm, title: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="admin-rental-location">Location</label><input id="admin-rental-location" value={rentalForm.locationLabel} onChange={(event) => setRentalForm({ ...rentalForm, locationLabel: event.target.value })} /></div>
            </div>
            <div className="input-group"><label htmlFor="admin-rental-description">Description</label><textarea id="admin-rental-description" value={rentalForm.description} onChange={(event) => setRentalForm({ ...rentalForm, description: event.target.value })} /></div>
            <div className="form-row">
              <div className="input-group"><label htmlFor="admin-rental-rate">Nightly Rate</label><input id="admin-rental-rate" inputMode="decimal" placeholder="$100.00" value={formatCurrencyInput(rentalForm.nightlyRate)} onChange={(event) => setRentalForm({ ...rentalForm, nightlyRate: parseCurrencyInput(event.target.value) })} /></div>
              <div className="input-group"><label htmlFor="admin-rental-cleaning">Cleaning Fee</label><input id="admin-rental-cleaning" inputMode="decimal" placeholder="$75.00" value={formatCurrencyInput(rentalForm.cleaningFee)} onChange={(event) => setRentalForm({ ...rentalForm, cleaningFee: parseCurrencyInput(event.target.value) })} /></div>
            </div>
            <div className="form-row">
              <div className="input-group"><label htmlFor="admin-rental-max-guests">Max Guests</label><input id="admin-rental-max-guests" type="number" value={rentalForm.maxGuests} onChange={(event) => setRentalForm({ ...rentalForm, maxGuests: event.target.value })} /></div>
              <label className="form-note" htmlFor="admin-rental-active"><input id="admin-rental-active" type="checkbox" checked={rentalForm.isActive} onChange={(event) => setRentalForm({ ...rentalForm, isActive: event.target.checked })} /> Active rental</label>
            </div>
            <AdminImagePicker
              label="Hero Images"
              images={rentalForm.heroImages}
              onChange={(heroImages) => setRentalForm({ ...rentalForm, heroImages })}
              captions={rentalForm.heroImageCaptions}
              onCaptionsChange={(heroImageCaptions) => setRentalForm({ ...rentalForm, heroImageCaptions })}
              helperText="The first image is used as the active hero image for the rental."
            />
            <AdminImagePicker
              label="Gallery Images"
              images={rentalForm.galleryImages}
              onChange={(galleryImages) => setRentalForm({ ...rentalForm, galleryImages })}
              captions={rentalForm.galleryImageCaptions}
              onCaptionsChange={(galleryImageCaptions) => setRentalForm({ ...rentalForm, galleryImageCaptions })}
            />
            <div className="input-group"><label htmlFor="admin-rental-amenities">Amenities</label><textarea id="admin-rental-amenities" value={rentalForm.amenities} onChange={(event) => setRentalForm({ ...rentalForm, amenities: event.target.value })} placeholder="One amenity per line" /></div>
            <div className="admin-inline-actions">
              <button className="button button-primary" type="button" onClick={saveRental} disabled={busy}>Save rental</button>
              {rentalForm.id ? <button className="button-secondary" type="button" onClick={deleteRental} disabled={busy}>Delete rental</button> : null}
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Availability Holds</h2>
          </div>
          <div className="form-shell">
            <div className="input-group">
              <label htmlFor="admin-block-rental">Rental</label>
              <select id="admin-block-rental" value={blockForm.rentalId} onChange={(event) => setBlockForm({ ...blockForm, rentalId: event.target.value })}>
                <option value="">Select rental</option>
                {rentals.map((rental) => (
                  <option key={rental.id} value={rental.id}>{rental.title}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="input-group"><label htmlFor="admin-block-start">Start Date</label><input id="admin-block-start" type="date" value={blockForm.startDate} onChange={(event) => setBlockForm({ ...blockForm, startDate: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="admin-block-end">End Date</label><input id="admin-block-end" type="date" value={blockForm.endDate} onChange={(event) => setBlockForm({ ...blockForm, endDate: event.target.value })} /></div>
            </div>
            <div className="input-group"><label htmlFor="admin-block-reason">Reason</label><input id="admin-block-reason" value={blockForm.reason} onChange={(event) => setBlockForm({ ...blockForm, reason: event.target.value })} /></div>
            <button className="button button-primary" type="button" onClick={createBlockedDate} disabled={busy}>Save availability hold</button>
          </div>

          <div className="admin-list">
            {blockedDates.map((entry) => (
              <div className="admin-list-row" key={entry.id}>
                <div>
                  <strong>{entry.rental_title}</strong>
                  <p>{entry.start_date} to {entry.end_date}{entry.reason ? ` • ${entry.reason}` : ''}</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => deleteBlockedDate(entry.id)} disabled={busy}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminRentals;
