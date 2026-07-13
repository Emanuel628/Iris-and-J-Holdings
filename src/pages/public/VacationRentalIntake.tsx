import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import { vacationHouseRules } from '../../content/vacationHouseRules';
import { calculateStaySubtotal } from '../../lib/rentalPricing';
import { usePageMeta } from '../../lib/usePageMeta';

type Availability = {
  blocked: { start: string; end: string }[];
  nightlyRateCents: number;
  weekendRateCents: number;
  cleaningFeeCents: number;
  currency: string;
  bookingEnabled: boolean;
};

type Guest = {
  fullName: string;
  email: string;
  phone: string;
};

function nightsBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`)) / 86_400_000);
}

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function formatShortDate(value: string) {
  if (!value) return value;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  }).format(date);
}

function VacationRentalIntake() {
  usePageMeta(
    'Vacation Rental Intake',
    'Complete primary booker details and review house rules before Orlando vacation rental checkout.',
    { robots: 'noindex,nofollow' },
  );

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const checkIn = params.get('checkIn') || '';
  const checkOut = params.get('checkOut') || '';
  const rentalId = Number(params.get('rentalId') || 0) || undefined;
  const [data, setData] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState('');
  const [primaryGuest, setPrimaryGuest] = useState<Guest>({ fullName: '', email: '', phone: '' });
  const [guestCount, setGuestCount] = useState(1);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [rulesScrolled, setRulesScrolled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const rulesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setLoadError('Select your dates first.');
      return;
    }

    let active = true;
    const query = new URLSearchParams();
    if (rentalId) query.set('rentalId', String(rentalId));
    fetch(`/api/availability${query.toString() ? `?${query.toString()}` : ''}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload: Availability) => {
        if (active) setData(payload);
      })
      .catch(() => active && setLoadError('Could not load booking details right now.'));
    return () => {
      active = false;
    };
  }, [checkIn, checkOut, rentalId]);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const stayRates = checkIn && checkOut && data
    ? calculateStaySubtotal(checkIn, checkOut, data.nightlyRateCents, data.weekendRateCents)
    : { subtotal: 0 };
  const nightlyTotal = stayRates.subtotal;
  const cleaning = data?.cleaningFeeCents ?? 0;
  const total = nights > 0 ? nightlyTotal + cleaning : 0;
  const currency = data?.currency ?? 'usd';

  function updatePrimaryGuest<K extends keyof Guest>(key: K, value: Guest[K]) {
    setPrimaryGuest((current) => ({ ...current, [key]: value }));
  }

  function updateGuestCount(value: string) {
    const nextCount = Number(value);
    if (!Number.isFinite(nextCount)) return;
    setGuestCount(Math.min(10, Math.max(1, Math.round(nextCount))));
  }

  function handleRulesScroll() {
    const element = rulesRef.current;
    if (!element || rulesScrolled) return;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 8) {
      setRulesScrolled(true);
    }
  }

  async function startCheckout() {
    setBookingError('');

    if (!primaryGuest.fullName.trim() || !primaryGuest.email.trim() || !primaryGuest.phone.trim()) {
      setBookingError('Primary booker must include full name, email, and phone number.');
      return;
    }
    if (guestCount < 1 || guestCount > 10) {
      setBookingError('Guest count must be between 1 and 10.');
      return;
    }
    if (!rulesScrolled) {
      setBookingError('Please scroll through the house rules and terms before checkout.');
      return;
    }
    if (!policyAgreed) {
      setBookingError('Please agree to the terms, house rules, and cancellation policy before checkout.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          rentalId,
          checkIn,
          checkOut,
          primaryGuest: {
            fullName: primaryGuest.fullName.trim(),
            email: primaryGuest.email.trim(),
            phone: primaryGuest.phone.trim(),
          },
          guestCount,
          additionalGuests: [],
          houseRulesAgreed: true,
          termsAgreed: true,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload.url) {
        throw new Error(payload.message || 'Could not start checkout. Please try again.');
      }
      window.location.href = payload.url;
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Could not start checkout.');
      setSubmitting(false);
    }
  }

  const backParams = new URLSearchParams({ checkIn, checkOut });
  if (rentalId) backParams.set('rentalId', String(rentalId));

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Vacation Rentals</p>
            <h1>Complete the booking intake.</h1>
            <p>
              Review your selected dates, enter the primary booker details, and accept the house rules and terms before secure checkout.
            </p>
            <div className="notice-box">
              <strong>Selected stay:</strong> {checkIn ? formatShortDate(checkIn) : 'Missing check-in'} to {checkOut ? formatShortDate(checkOut) : 'Missing check-out'}
            </div>
          </div>
          <div className="page-hero-visual vacation-hero-visual" aria-hidden="true" />
        </section>

        <section className="page-content">
          <div className="split-section vacation-booking">
            <div className="page-intro">
              <p className="eyebrow">Booking details</p>
              <h2>Guest information and checkout.</h2>
              {loadError ? (
                <p>{loadError}</p>
              ) : (
                <>
                  <p>This step collects the primary booker details, total guest count, and required agreements before payment.</p>
                  <dl className="cal-price">
                    <div>
                      <dt>Check-in</dt>
                      <dd>{formatShortDate(checkIn)}</dd>
                    </div>
                    <div>
                      <dt>Check-out</dt>
                      <dd>{formatShortDate(checkOut)}</dd>
                    </div>
                    <div>
                      <dt>Stay total</dt>
                      <dd>{formatMoney(total, currency)}</dd>
                    </div>
                  </dl>
                </>
              )}
            </div>

            <div className="info-panel form-shell">
              <div className="booking-intake">
                <div className="booking-intake-header">
                  <div>
                    <p className="eyebrow">Guest intake</p>
                    <h3>Primary booker details.</h3>
                  </div>
                  <p className="guest-count">{guestCount} of 10 guests</p>
                </div>

                <div className="guest-card">
                  <div className="guest-card-header">
                    <strong>Primary Booker</strong>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="vacation-primary-name">Full Name</label>
                      <input id="vacation-primary-name" autoComplete="name" value={primaryGuest.fullName} onChange={(event) => updatePrimaryGuest('fullName', event.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label htmlFor="vacation-primary-email">Email</label>
                      <input id="vacation-primary-email" type="email" autoComplete="email" value={primaryGuest.email} onChange={(event) => updatePrimaryGuest('email', event.target.value)} required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="vacation-primary-phone">Phone Number</label>
                    <input id="vacation-primary-phone" type="tel" autoComplete="tel" value={primaryGuest.phone} onChange={(event) => updatePrimaryGuest('phone', event.target.value)} required />
                  </div>
                </div>

                <div className="guest-card">
                  <div className="guest-card-header">
                    <strong>Total Overnight Guests</strong>
                  </div>
                  <div className="input-group">
                    <label htmlFor="vacation-guest-count">Guest Count</label>
                    <input id="vacation-guest-count" type="number" min="1" max="10" value={guestCount} onChange={(event) => updateGuestCount(event.target.value)} required />
                  </div>
                  <p className="cal-note">Maximum occupancy is 10 guests.</p>
                </div>

                <div className="rules-scroll-shell">
                  <div className="guest-card-header">
                    <strong>House rules and booking terms</strong>
                    <span className="scroll-status">{rulesScrolled ? 'Scroll complete' : 'Scroll to unlock agreement'}</span>
                  </div>
                  <div className="rules-scroll-box" ref={rulesRef} onScroll={handleRulesScroll} tabIndex={0}>
                    <p>
                      Please review the house rules, terms, and cancellation details before checkout. This stay is not confirmed until Stripe payment is fully completed and a confirmation email is issued.
                    </p>
                    <ul className="detail-list">
                      {vacationHouseRules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                    <p>
                      Review the full documents before paying: <a href="/house-rules" target="_blank" rel="noreferrer">House Rules</a>, <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>, and <a href="/refund-cancellation-policy#vacation-rentals" target="_blank" rel="noreferrer">Vacation Rental Refund &amp; Cancellation Policy</a>.
                    </p>
                  </div>
                </div>

                <label className="form-note agreement-note" htmlFor="vacation-policy-agree">
                  <input id="vacation-policy-agree" name="policyAgreement" type="checkbox" checked={policyAgreed} onChange={(event) => setPolicyAgreed(event.target.checked)} disabled={!rulesScrolled} /> I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>, <a href="/house-rules" target="_blank" rel="noreferrer">House Rules</a>, and <a href="/refund-cancellation-policy#vacation-rentals" target="_blank" rel="noreferrer">Vacation Rental Refund &amp; Cancellation Policy</a>.
                </label>
              </div>

              <div className="page-actions">
                <a className="button-secondary" href={`/vacation-rentals?${backParams.toString()}`}>Back to dates</a>
                <button className="button button-primary" type="button" onClick={startCheckout} disabled={submitting || Boolean(loadError) || !data?.bookingEnabled}>
                  {submitting ? 'Starting checkout...' : 'Continue to secure checkout'} <ArrowRight size={16} />
                </button>
              </div>

              {bookingError && <p className="form-status form-status-error" role="alert">{bookingError}</p>}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentalIntake;
