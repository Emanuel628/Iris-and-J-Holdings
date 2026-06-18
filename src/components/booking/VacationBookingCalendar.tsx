import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { vacationHouseRules } from '../../content/vacationHouseRules';

type BlockedRange = { start: string; end: string };

type Availability = {
  blocked: BlockedRange[];
  nightlyRateCents: number;
  cleaningFeeCents: number;
  currency: string;
  bookingEnabled: boolean;
};

type Guest = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

let nextGuestId = 2;

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayIso() {
  const d = new Date();
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(isoStr: string, amount: number) {
  const d = new Date(`${isoStr}T00:00:00`);
  d.setDate(d.getDate() + amount);
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}

function nightsBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`)) / 86_400_000);
}

function monthCells(year: number, month: number) {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: startDow }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatMoney(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function createGuest(): Guest {
  const guest = { id: nextGuestId, fullName: '', email: '', phone: '' };
  nextGuestId += 1;
  return guest;
}

function VacationBookingCalendar() {
  const [data, setData] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState(false);
  const today = todayIso();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [primaryGuest, setPrimaryGuest] = useState<Guest>({ id: 1, fullName: '', email: '', phone: '' });
  const [additionalGuests, setAdditionalGuests] = useState<Guest[]>([]);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [rulesScrolled, setRulesScrolled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const rulesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/availability')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload: Availability) => {
        if (active) setData(payload);
      })
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, []);

  const blockedNights = useMemo(() => {
    const set = new Set<string>();
    for (const range of data?.blocked ?? []) {
      let cursor = range.start;
      let guard = 0;
      while (cursor < range.end && guard < 800) {
        set.add(cursor);
        cursor = addDays(cursor, 1);
        guard += 1;
      }
    }
    return set;
  }, [data]);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const nightlyTotal = nights * (data?.nightlyRateCents ?? 0);
  const cleaning = data?.cleaningFeeCents ?? 0;
  const total = nights > 0 ? nightlyTotal + cleaning : 0;
  const currency = data?.currency ?? 'usd';
  const guestCount = additionalGuests.length + 1;

  function updatePrimaryGuest<K extends keyof Guest>(key: K, value: Guest[K]) {
    setPrimaryGuest((current) => ({ ...current, [key]: value }));
  }

  function updateAdditionalGuest(id: number, key: keyof Guest, value: string) {
    setAdditionalGuests((current) => current.map((guest) => (
      guest.id === id ? { ...guest, [key]: value } : guest
    )));
  }

  function addGuest() {
    if (guestCount >= 10) return;
    setAdditionalGuests((current) => [...current, createGuest()]);
  }

  function removeGuest(id: number) {
    setAdditionalGuests((current) => current.filter((guest) => guest.id !== id));
  }

  function rangeHasBlockedNight(from: string, toExclusive: string) {
    let cursor = from;
    while (cursor < toExclusive) {
      if (blockedNights.has(cursor)) return true;
      cursor = addDays(cursor, 1);
    }
    return false;
  }

  function selectDate(date: string) {
    setBookingError('');
    if (!checkIn || checkOut) {
      setCheckIn(date);
      setCheckOut('');
      return;
    }
    if (date <= checkIn || rangeHasBlockedNight(checkIn, date)) {
      setCheckIn(date);
      setCheckOut('');
      return;
    }
    setCheckOut(date);
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
      setBookingError('Primary Guest #1 must include full name, email, and phone number.');
      return;
    }

    if (additionalGuests.some((guest) => !guest.fullName.trim())) {
      setBookingError('Each added guest must include a full name.');
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
          checkIn,
          checkOut,
          primaryGuest: {
            fullName: primaryGuest.fullName.trim(),
            email: primaryGuest.email.trim(),
            phone: primaryGuest.phone.trim(),
          },
          additionalGuests: additionalGuests.map((guest) => ({
            fullName: guest.fullName.trim(),
            email: guest.email.trim(),
            phone: guest.phone.trim(),
          })),
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

  function goToMonth(offset: number) {
    setView((current) => {
      const next = new Date(current.year, current.month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const atCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();

  return (
    <div className="availability-calendar availability-calendar-extended">
      <div className="cal-bar">
        <button type="button" className="cal-arrow" onClick={() => goToMonth(-1)} disabled={atCurrentMonth} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <p className="cal-title">{MONTHS[view.month]} {view.year}</p>
        <button type="button" className="cal-arrow" onClick={() => goToMonth(1)} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      {loadError ? (
        <p className="cal-note">The calendar could not load right now. Please refresh, or send Daiana a question below.</p>
      ) : !data ? (
        <p className="cal-note">Loading availability...</p>
      ) : (
        <>
          <div className="cal-grid">
            {WEEKDAYS.map((weekday) => (
              <span className="cal-weekday" key={weekday}>{weekday}</span>
            ))}
            {monthCells(view.year, view.month).map((day, index) => {
              if (day === null) {
                return <span className="cal-day is-empty" key={`empty-${index}`} aria-hidden="true" />;
              }
              const date = iso(view.year, view.month, day);
              const isBlocked = blockedNights.has(date);
              const disabled = date < today || isBlocked;
              const isStart = date === checkIn;
              const isEnd = date === checkOut;
              const inRange = Boolean(checkIn && checkOut && date > checkIn && date < checkOut);
              const classes = [
                'cal-day',
                disabled ? 'is-disabled' : 'is-open',
                isBlocked ? 'is-blocked' : '',
                isStart ? 'is-start' : '',
                isEnd ? 'is-end' : '',
                inRange ? 'is-range' : '',
              ].filter(Boolean).join(' ');

              return (
                <button
                  type="button"
                  className={classes}
                  key={date}
                  disabled={disabled}
                  aria-pressed={isStart || isEnd}
                  aria-label={`${MONTHS[view.month]} ${day}, ${view.year}${isBlocked ? ' - booked' : ''}`}
                  onClick={() => selectDate(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <ul className="cal-legend" aria-hidden="true">
            <li><span className="swatch swatch-open" /> Available</li>
            <li><span className="swatch swatch-booked" /> Booked</li>
            <li><span className="swatch swatch-selected" /> Your dates</li>
          </ul>

          <div className="cal-summary">
            {checkIn && checkOut ? (
              <>
                <div className="cal-summary-dates">
                  <div><span>Check-in</span><strong>{checkIn}</strong></div>
                  <ArrowRight size={16} aria-hidden="true" />
                  <div><span>Check-out</span><strong>{checkOut}</strong></div>
                </div>
                <dl className="cal-price">
                  <div>
                    <dt>{formatMoney(data.nightlyRateCents, currency)} x {nights} night{nights > 1 ? 's' : ''}</dt>
                    <dd>{formatMoney(nightlyTotal, currency)}</dd>
                  </div>
                  {cleaning > 0 && (
                    <div>
                      <dt>Cleaning fee</dt>
                      <dd>{formatMoney(cleaning, currency)}</dd>
                    </div>
                  )}
                  <div className="cal-price-total">
                    <dt>Total</dt>
                    <dd>{formatMoney(total, currency)}</dd>
                  </div>
                </dl>
                {data.bookingEnabled ? (
                  <>
                    <div className="booking-intake">
                      <div className="booking-intake-header">
                        <div>
                          <p className="eyebrow">Guest intake</p>
                          <h3>Guest details for this stay.</h3>
                        </div>
                        <p className="guest-count">{guestCount} of 10 guests</p>
                      </div>

                      <div className="guest-card">
                        <div className="guest-card-header">
                          <strong>Primary Guest #1</strong>
                        </div>
                        <div className="form-row">
                          <div className="input-group">
                            <label htmlFor="vacation-primary-name">Full Name</label>
                            <input
                              id="vacation-primary-name"
                              autoComplete="name"
                              value={primaryGuest.fullName}
                              onChange={(event) => updatePrimaryGuest('fullName', event.target.value)}
                              required
                            />
                          </div>
                          <div className="input-group">
                            <label htmlFor="vacation-primary-email">Email</label>
                            <input
                              id="vacation-primary-email"
                              type="email"
                              autoComplete="email"
                              value={primaryGuest.email}
                              onChange={(event) => updatePrimaryGuest('email', event.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="input-group">
                          <label htmlFor="vacation-primary-phone">Phone Number</label>
                          <input
                            id="vacation-primary-phone"
                            type="tel"
                            autoComplete="tel"
                            value={primaryGuest.phone}
                            onChange={(event) => updatePrimaryGuest('phone', event.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="guest-section">
                        <div className="guest-section-header">
                          <strong>Additional Guests</strong>
                          <button className="button-secondary guest-add-button" type="button" onClick={addGuest} disabled={guestCount >= 10}>
                            <Plus size={16} /> Add Guest
                          </button>
                        </div>
                        {additionalGuests.length === 0 ? (
                          <p className="cal-note">Add each additional guest staying at the property. Maximum occupancy is 10 guests.</p>
                        ) : (
                          <div className="guest-list">
                            {additionalGuests.map((guest, index) => (
                              <div className="guest-card" key={guest.id}>
                                <div className="guest-card-header">
                                  <strong>Guest #{index + 2}</strong>
                                  <button className="guest-remove-button" type="button" onClick={() => removeGuest(guest.id)}>
                                    <Minus size={14} /> Remove
                                  </button>
                                </div>
                                <div className="form-row">
                                  <div className="input-group">
                                    <label htmlFor={`vacation-guest-name-${guest.id}`}>Full Name</label>
                                    <input
                                      id={`vacation-guest-name-${guest.id}`}
                                      value={guest.fullName}
                                      onChange={(event) => updateAdditionalGuest(guest.id, 'fullName', event.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="input-group">
                                    <label htmlFor={`vacation-guest-email-${guest.id}`}>Email</label>
                                    <input
                                      id={`vacation-guest-email-${guest.id}`}
                                      type="email"
                                      value={guest.email}
                                      onChange={(event) => updateAdditionalGuest(guest.id, 'email', event.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="input-group">
                                  <label htmlFor={`vacation-guest-phone-${guest.id}`}>Phone Number</label>
                                  <input
                                    id={`vacation-guest-phone-${guest.id}`}
                                    type="tel"
                                    value={guest.phone}
                                    onChange={(event) => updateAdditionalGuest(guest.id, 'phone', event.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rules-scroll-shell">
                        <div className="guest-card-header">
                          <strong>House rules and booking terms</strong>
                          <span className="scroll-status">{rulesScrolled ? 'Scroll complete' : 'Scroll to unlock agreement'}</span>
                        </div>
                        <div className="rules-scroll-box" ref={rulesRef} onScroll={handleRulesScroll} tabIndex={0}>
                          <p>
                            Please review the house rules, terms, and cancellation details before checkout. This stay is
                            not confirmed until Stripe payment is fully completed and a confirmation email is issued.
                          </p>
                          <ul className="detail-list">
                            {vacationHouseRules.map((rule) => (
                              <li key={rule}>{rule}</li>
                            ))}
                          </ul>
                          <p>
                            Review the full documents before paying: <a href="/house-rules" target="_blank" rel="noreferrer">House Rules</a>,{' '}
                            <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>, and{' '}
                            <a href="/refund-cancellation-policy#vacation-rentals" target="_blank" rel="noreferrer">
                              Vacation Rental Refund &amp; Cancellation Policy
                            </a>.
                          </p>
                        </div>
                      </div>

                      <label className="form-note agreement-note" htmlFor="vacation-policy-agree">
                        <input
                          id="vacation-policy-agree"
                          name="policyAgreement"
                          type="checkbox"
                          checked={policyAgreed}
                          onChange={(event) => setPolicyAgreed(event.target.checked)}
                          disabled={!rulesScrolled}
                        />{' '}
                        I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>,{' '}
                        <a href="/house-rules" target="_blank" rel="noreferrer">House Rules</a>, and{' '}
                        <a href="/refund-cancellation-policy#vacation-rentals" target="_blank" rel="noreferrer">
                          Vacation Rental Refund &amp; Cancellation Policy
                        </a>.
                      </label>
                    </div>
                    <button className="button button-primary" type="button" onClick={startCheckout} disabled={submitting}>
                      {submitting ? 'Starting checkout...' : 'Continue to secure checkout'} <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <p className="cal-note">
                    Online checkout is coming soon. <a className="text-link" href="#questions">Send Daiana a question</a> and she will confirm these dates.
                  </p>
                )}
                {bookingError && <p className="form-status form-status-error" role="alert">{bookingError}</p>}
              </>
            ) : (
              <p className="cal-prompt">
                {checkIn ? 'Now choose your check-out date.' : 'Select your check-in date to begin.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default VacationBookingCalendar;
