import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminBlockedDates,
  fetchAdminDashboard,
  fetchAdminMe,
  fetchAdminRentals,
  fetchAdminSiteContent,
  type AdminUser,
  type BlockedDateRecord,
  type DashboardSummary,
  type RentalRecord,
  type SiteContentRecord,
} from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

type RentalForm = {
  id?: number;
  slug: string;
  title: string;
  locationLabel: string;
  description: string;
  nightlyRateCents: string;
  cleaningFeeCents: string;
  maxGuests: string;
  heroImageUrl: string;
  galleryImageUrls: string;
  amenities: string;
  isActive: boolean;
};

type BlockForm = {
  rentalId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

type ContentForm = {
  pageKey: string;
  title: string;
  body: string;
  heroImageUrl: string;
};

function emptyRentalForm(): RentalForm {
  return {
    slug: '',
    title: '',
    locationLabel: '',
    description: '',
    nightlyRateCents: '',
    cleaningFeeCents: '',
    maxGuests: '10',
    heroImageUrl: '',
    galleryImageUrls: '',
    amenities: '',
    isActive: true,
  };
}

function toRentalForm(rental: RentalRecord): RentalForm {
  return {
    id: rental.id,
    slug: rental.slug,
    title: rental.title,
    locationLabel: rental.location_label,
    description: rental.description,
    nightlyRateCents: String(rental.nightly_rate_cents),
    cleaningFeeCents: String(rental.cleaning_fee_cents),
    maxGuests: String(rental.max_guests),
    heroImageUrl: rental.hero_image_url,
    galleryImageUrls: (rental.gallery_image_urls || []).join('\n'),
    amenities: (rental.amenities || []).join('\n'),
    isActive: rental.is_active,
  };
}

function toContentForm(entry: SiteContentRecord): ContentForm {
  return {
    pageKey: entry.page_key,
    title: entry.title,
    body: entry.body,
    heroImageUrl: entry.hero_image_url,
  };
}

function AdminDashboard() {
  usePageMeta('Control Center', 'Admin control center for Iris & J Holdings.', { robots: 'noindex,nofollow' });
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRecord[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContentRecord[]>([]);
  const [rentalForm, setRentalForm] = useState<RentalForm>(emptyRentalForm());
  const [blockForm, setBlockForm] = useState<BlockForm>({ rentalId: '', startDate: '', endDate: '', reason: '' });
  const [contentForm, setContentForm] = useState<ContentForm>({ pageKey: '', title: '', body: '', heroImageUrl: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    const [me, dashboard, rentalsPayload, blockedPayload, contentPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminDashboard(),
      fetchAdminRentals(),
      fetchAdminBlockedDates(),
      fetchAdminSiteContent(),
    ]);

    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }

    setUser(me.user);
    setSummary(dashboard.summary);
    setRentals(rentalsPayload.rentals);
    setBlockedDates(blockedPayload.blockedDates);
    setSiteContent(contentPayload.entries);

    if (!contentForm.pageKey && contentPayload.entries[0]) {
      setContentForm(toContentForm(contentPayload.entries[0]));
    }
    if (!blockForm.rentalId && rentalsPayload.rentals[0]) {
      setBlockForm((current) => ({ ...current, rentalId: String(rentalsPayload.rentals[0].id) }));
    }
  }

  useEffect(() => {
    loadAll().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  const contentOptions = useMemo(() => siteContent.map((entry) => ({ key: entry.page_key, title: entry.title })), [siteContent]);

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST', headers: { Accept: 'application/json' } }).catch(() => undefined);
    window.location.href = '/admin/login';
  }

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
          slug: rentalForm.slug,
          title: rentalForm.title,
          locationLabel: rentalForm.locationLabel,
          description: rentalForm.description,
          nightlyRateCents: Number(rentalForm.nightlyRateCents || 0),
          cleaningFeeCents: Number(rentalForm.cleaningFeeCents || 0),
          maxGuests: Number(rentalForm.maxGuests || 10),
          heroImageUrl: rentalForm.heroImageUrl,
          galleryImageUrls: rentalForm.galleryImageUrls,
          amenities: rentalForm.amenities,
          isActive: rentalForm.isActive,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save rental.');
      await loadAll();
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
      await loadAll();
      setStatusMessage('Blocked date saved.');
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
      await loadAll();
      setStatusMessage('Blocked date removed.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete blocked date.');
    } finally {
      setBusy(false);
    }
  }

  async function saveContent() {
    setBusy(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(contentForm),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not save content.');
      await loadAll();
      setStatusMessage('Site content saved.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save content.');
    } finally {
      setBusy(false);
    }
  }

  function chooseContent(pageKey: string) {
    const entry = siteContent.find((item) => item.page_key === pageKey);
    if (entry) setContentForm(toContentForm(entry));
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="page-intro">
          <p className="eyebrow">Control Center</p>
          <h1>Iris &amp; J Holdings admin.</h1>
          {user ? <p>Signed in as {user.email}.</p> : <p>Loading your admin session...</p>}
        </div>

        {summary ? (
          <div className="content-grid">
            <section className="content-card"><h3>Rentals</h3><p>{summary.rentals}</p></section>
            <section className="content-card"><h3>Blocked Dates</h3><p>{summary.blockedDates}</p></section>
            <section className="content-card"><h3>Vacation Bookings</h3><p>{summary.vacationBookings}</p></section>
            <section className="content-card"><h3>Notary Requests</h3><p>{summary.notaryRequests}</p></section>
          </div>
        ) : null}

        <div className="content-grid two">
          <section className="content-card">
            <h3>Create or update rental</h3>
            <div className="form-shell">
              <div className="input-group">
                <label htmlFor="admin-rental-select">Existing Rental</label>
                <select id="admin-rental-select" value={rentalForm.id || ''} onChange={(event) => {
                  const rental = rentals.find((item) => item.id === Number(event.target.value));
                  setRentalForm(rental ? toRentalForm(rental) : emptyRentalForm());
                }}>
                  <option value="">New rental</option>
                  {rentals.map((rental) => (
                    <option key={rental.id} value={rental.id}>{rental.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="admin-rental-slug">Slug</label><input id="admin-rental-slug" value={rentalForm.slug} onChange={(event) => setRentalForm({ ...rentalForm, slug: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="admin-rental-title">Title</label><input id="admin-rental-title" value={rentalForm.title} onChange={(event) => setRentalForm({ ...rentalForm, title: event.target.value })} /></div>
              </div>
              <div className="input-group"><label htmlFor="admin-rental-location">Location</label><input id="admin-rental-location" value={rentalForm.locationLabel} onChange={(event) => setRentalForm({ ...rentalForm, locationLabel: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="admin-rental-description">Description</label><textarea id="admin-rental-description" value={rentalForm.description} onChange={(event) => setRentalForm({ ...rentalForm, description: event.target.value })} /></div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="admin-rental-rate">Nightly Rate (cents)</label><input id="admin-rental-rate" type="number" value={rentalForm.nightlyRateCents} onChange={(event) => setRentalForm({ ...rentalForm, nightlyRateCents: event.target.value })} /></div>
                <div className="input-group"><label htmlFor="admin-rental-cleaning">Cleaning Fee (cents)</label><input id="admin-rental-cleaning" type="number" value={rentalForm.cleaningFeeCents} onChange={(event) => setRentalForm({ ...rentalForm, cleaningFeeCents: event.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="input-group"><label htmlFor="admin-rental-max-guests">Max Guests</label><input id="admin-rental-max-guests" type="number" value={rentalForm.maxGuests} onChange={(event) => setRentalForm({ ...rentalForm, maxGuests: event.target.value })} /></div>
                <label className="form-note" htmlFor="admin-rental-active"><input id="admin-rental-active" type="checkbox" checked={rentalForm.isActive} onChange={(event) => setRentalForm({ ...rentalForm, isActive: event.target.checked })} /> Active rental</label>
              </div>
              <div className="input-group"><label htmlFor="admin-rental-hero">Hero Image URL</label><input id="admin-rental-hero" value={rentalForm.heroImageUrl} onChange={(event) => setRentalForm({ ...rentalForm, heroImageUrl: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="admin-rental-gallery">Gallery Image URLs</label><textarea id="admin-rental-gallery" value={rentalForm.galleryImageUrls} onChange={(event) => setRentalForm({ ...rentalForm, galleryImageUrls: event.target.value })} placeholder="One URL per line" /></div>
              <div className="input-group"><label htmlFor="admin-rental-amenities">Amenities</label><textarea id="admin-rental-amenities" value={rentalForm.amenities} onChange={(event) => setRentalForm({ ...rentalForm, amenities: event.target.value })} placeholder="One amenity per line" /></div>
              <button className="button button-primary" type="button" onClick={saveRental} disabled={busy}>Save rental</button>
            </div>
          </section>

          <section className="content-card">
            <h3>Block rental dates</h3>
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
              <button className="button button-primary" type="button" onClick={createBlockedDate} disabled={busy}>Save blocked dates</button>
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

          <section className="content-card">
            <h3>Edit site content</h3>
            <div className="form-shell">
              <div className="input-group">
                <label htmlFor="admin-content-page">Page</label>
                <select id="admin-content-page" value={contentForm.pageKey} onChange={(event) => chooseContent(event.target.value)}>
                  <option value="">Select page</option>
                  {contentOptions.map((entry) => (
                    <option key={entry.key} value={entry.key}>{entry.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group"><label htmlFor="admin-content-title">Title</label><input id="admin-content-title" value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="admin-content-image">Hero Image URL</label><input id="admin-content-image" value={contentForm.heroImageUrl} onChange={(event) => setContentForm({ ...contentForm, heroImageUrl: event.target.value })} /></div>
              <div className="input-group"><label htmlFor="admin-content-body">Body</label><textarea id="admin-content-body" value={contentForm.body} onChange={(event) => setContentForm({ ...contentForm, body: event.target.value })} /></div>
              <button className="button button-primary" type="button" onClick={saveContent} disabled={busy}>Save page content</button>
            </div>
          </section>

          <section className="content-card">
            <h3>Current content entries</h3>
            <div className="admin-list">
              {siteContent.map((entry) => (
                <button className="admin-list-row admin-list-button" type="button" key={entry.id} onClick={() => chooseContent(entry.page_key)}>
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{entry.page_key}</p>
                  </div>
                  <span>Edit</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}

        <div className="page-actions">
          <button className="button button-primary" type="button" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
