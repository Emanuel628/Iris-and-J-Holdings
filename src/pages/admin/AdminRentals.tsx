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
  const [rentalBusy, setRentalBusy] = useState(false);
  const [holdBusy, setHoldBusy] = useState(false);
  const [rentalStatusMessage, setRentalStatusMessage] = useState('');
  const [rentalErrorMessage, setRentalErrorMessage] = useState('');
  const [holdStatusMessage, setHoldStatusMessage] = useState('');
  const [holdErrorMessage, setHoldErrorMessage] = useState('');
  const selectedRentalLabel = useMemo(
    () => rentals.find((item) => item.id === rentalForm.id)?.title ?? 'New rental',
    [rentals, rentalForm.id],
  );

  function isBlankRentalForm(form: RentalForm) {
    return !form.id
      && !form.title
      && !form.locationLabel
      && !form.description
      && !form.nightlyRate
      && !form.cleaningFee
      && !form.heroImages.length
      && !form.galleryImages.length
      && !form.amenities;
  }

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
    setRentalForm((current) => {
      if (current.id) {
        const matchingRental = rentalsPayload.rentals.find((item) => item.id === current.id);
        return matchingRental ? toRentalForm(matchingRental) : current;
      }

      if (isBlankRentalForm(current) && rentalsPayload.rentals[0]) {
        return toRentalForm(rentalsPayload.rentals[0]);
      }

      return current;
    });
    if (!blockForm.rentalId && rentalsPayload.rentals[0]) {
      setBlockForm((current) => ({ ...current, rentalId: String(rentalsPayload.rentals[0].id) }));
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  function startNewRental() {
    setRentalForm(emptyRentalForm());
    setRentalStatusMessage('');
    setRentalErrorMessage('');
  }

  async function saveRental() {
    setRentalBusy(true);
    setRentalErrorMessage('');
    setRentalStatusMessage('');
    try {
      const heroImages = rentalForm.heroImages.filter(Boolean);
      const heroImageCaptions = heroImages.map((_, index) => rentalForm.heroImageCaptions[index] || '');
      const galleryImages = rentalForm.galleryImages.filter(Boolean);
      const galleryImageCaptions = galleryImages.map((_, index) => rentalForm.galleryImageCaptions[index] || '');
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
          heroImageUrl: heroImages[0] || '',
          heroImageCaptions,
          galleryImageUrls: galleryImages,
          galleryImageCaptions,
          amenities: rentalForm.amenities,
          isActive: rentalForm.isActive,
        }),
      });
      const payload = await res.json().catch(() => ({} as { message?: string; rental?: RentalRecord | null }));
      if (!res.ok) throw new Error(payload.message || 'Could not save rental.');
      if (payload.rental) {
        setRentalForm(toRentalForm(payload.rental));
      }
      await loadData();
      setRentalStatusMessage('Rental saved.');
    } catch (error) {
      setRentalErrorMessage(error instanceof Error ? error.message : 'Could not save rental.');
    } finally {
      setRentalBusy(false);
    }
  }

  async function createBlockedDate() {
    setHoldBusy(true);
    setHoldErrorMessage('');
    setHoldStatusMessage('');
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
      setHoldStatusMessage('Availability hold saved.');
      setBlockForm((current) => ({ ...current, startDate: '', endDate: '', reason: '' }));
    } catch (error) {
      setHoldErrorMessage(error instanceof Error ? error.message : 'Could not create blocked date.');
    } finally {
      setHoldBusy(false);
    }
  }

  async function deleteBlockedDate(id: number) {
    setHoldBusy(true);
    setHoldErrorMessage('');
    setHoldStatusMessage('');
    try {
      const res = await fetch('/api/admin/blocked-dates/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not delete blocked date.');
      await loadData();
      setHoldStatusMessage('Availability hold removed.');
    } catch (error) {
      setHoldErrorMessage(error instanceof Error ? error.message : 'Could not delete blocked date.');
    } finally {
      setHoldBusy(false);
    }
  }

  async function deleteRental() {
    if (!rentalForm.id) return;
    const confirmation = window.prompt('Type DELETE to permanently remove this rental.');
    if (confirmation === null) return;

    setRentalBusy(true);
    setRentalErrorMessage('');
    setRentalStatusMessage('');
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
      setRentalStatusMessage('Rental deleted.');
    } catch (error) {
      setRentalErrorMessage(error instanceof Error ? error.message : 'Could not delete rental.');
    } finally {
      setRentalBusy(false);
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
            <div className="admin-inline-actions">
              <div className="admin-select-shell">
                <label className="sr-only" htmlFor="admin-rental-select">Select rental</label>
                <select
                  id="admin-rental-select"
                  value={rentalForm.id || ''}
                  onChange={(event) => {
                    const rental = rentals.find((item) => item.id === Number(event.target.value));
                    setRentalForm(rental ? toRentalForm(rental) : emptyRentalForm());
                    setRentalStatusMessage('');
                    setRentalErrorMessage('');
                  }}
                >
                  <option value="">{selectedRentalLabel === 'New rental' ? 'New rental' : `${selectedRentalLabel} (current)`}</option>
                  {rentals.map((rental) => (
                    <option key={rental.id} value={rental.id}>{rental.title}</option>
                  ))}
                </select>
                <ChevronsUpDown size={16} aria-hidden="true" />
              </div>
              <button className="button-secondary" type="button" onClick={startNewRental} disabled={rentalBusy}>
                New rental
              </button>
            </div>
          </div>
          <div className="form-shell">
            <p className="form-note">
              This section only creates or updates rental listings. Availability holds are managed separately below.
            </p>
            {!rentalForm.id ? (
              <p className="form-note">
                Fill in the title and location before saving a brand new rental.
              </p>
            ) : null}
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
              onChange={(heroImages) => setRentalForm((current) => ({ ...current, heroImages }))}
              captions={rentalForm.heroImageCaptions}
              onCaptionsChange={(heroImageCaptions) => setRentalForm((current) => ({ ...current, heroImageCaptions }))}
              helperText="The first image is used as the active hero image for the rental."
            />
            <AdminImagePicker
              label="Gallery Images"
              images={rentalForm.galleryImages}
              onChange={(galleryImages) => setRentalForm((current) => ({ ...current, galleryImages }))}
              captions={rentalForm.galleryImageCaptions}
              onCaptionsChange={(galleryImageCaptions) => setRentalForm((current) => ({ ...current, galleryImageCaptions }))}
            />
            <div className="input-group"><label htmlFor="admin-rental-amenities">Amenities</label><textarea id="admin-rental-amenities" value={rentalForm.amenities} onChange={(event) => setRentalForm({ ...rentalForm, amenities: event.target.value })} placeholder="One amenity per line" /></div>
            <div className="admin-inline-actions">
              <button className="button button-primary" type="button" onClick={saveRental} disabled={rentalBusy}>Save rental</button>
              {rentalForm.id ? <button className="button-secondary" type="button" onClick={deleteRental} disabled={rentalBusy}>Delete rental</button> : null}
            </div>
            {rentalStatusMessage ? <p className="form-status form-status-success">{rentalStatusMessage}</p> : null}
            {rentalErrorMessage ? <p className="form-status form-status-error" role="alert">{rentalErrorMessage}</p> : null}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Availability Holds</h2>
          </div>
          <div className="form-shell">
            <p className="form-note">
              This section only blocks or opens dates for an existing rental. It does not create or edit the rental itself.
            </p>
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
            <button className="button button-primary" type="button" onClick={createBlockedDate} disabled={holdBusy}>Save availability hold</button>
            {holdStatusMessage ? <p className="form-status form-status-success">{holdStatusMessage}</p> : null}
            {holdErrorMessage ? <p className="form-status form-status-error" role="alert">{holdErrorMessage}</p> : null}
          </div>

          <div className="admin-list">
            {blockedDates.map((entry) => (
              <div className="admin-list-row" key={entry.id}>
                <div>
                  <strong>{entry.rental_title}</strong>
                  <p>{entry.start_date} to {entry.end_date}{entry.reason ? ` • ${entry.reason}` : ''}</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => deleteBlockedDate(entry.id)} disabled={holdBusy}>Remove</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminRentals;
