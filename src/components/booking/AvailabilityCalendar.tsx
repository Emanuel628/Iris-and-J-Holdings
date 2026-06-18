import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

type BlockedRange = { start: string; end: string };

type Availability = {
  blocked: BlockedRange[];
  nightlyRateCents: number;
  cleaningFeeCents: number;
  currency: string;
  bookingEnabled: boolean;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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

function AvailabilityCalendar() {
  const [data, setData] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState(false);
  const today = todayIso();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [email, setEmail] = useState('');
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

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
  const trimmedEmail = email.trim();

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
    if (!checkIn || (checkIn && checkOut)) {
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

  async function startCheckout() {
    setBookingError('');

    if (!trimmedEmail) {
      setBookingError('Please enter your email so we can send your confirmation and receipt.');
      return;
    }

    if (!policyAgreed) {
      setBookingError('Please agree to the Vacation Rental Refund & Cancellation Policy before checkout.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, email: trimmedEmail }),
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
    <div className="availability-calendar">
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
        <p className="cal-note">The calendar couldn’t load right now. Please refresh, or send Daiana a question below.</p>
      ) : !data ? (
        <p className="cal-note">Loading availability…</p>
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
                  aria-label={`${MONTHS[view.month]} ${day}, ${view.year}${isBlocked ? ' — booked' : ''}`}
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
                    <dt>{formatMoney(data.nightlyRateCents, currency)} × {nights} night{nights > 1 ? 's' : ''}</dt>
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
                    <div className="input-group">
                      <label htmlFor="vacation-booking-email">Email for confirmation and receipt</label>
                      <input
                        id="vacation-booking-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                    <label className="form-note" htmlFor="vacation-policy-agree">
                      <input
                        id="vacation-policy-agree"
                        name="policyAgreement"
                        type="checkbox"
                        checked={policyAgreed}
                        onChange={(event) => setPolicyAgreed(event.target.checked)}
                      />{' '}
                      I agree to the{' '}
                      <a href="/refund-cancellation-policy#vacation-rentals" target="_blank" rel="noreferrer">
                        Vacation Rental Refund &amp; Cancellation Policy
                      </a>.
                    </label>
                    <button className="button button-primary" type="button" onClick={startCheckout} disabled={submitting}>
                      {submitting ? 'Starting checkout…' : 'Check out & book'} <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <p className="cal-note">
                    Online checkout is coming soon. <a className="text-link" href="#interest-list">Send Daiana a question</a> and she’ll confirm these dates.
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

export default AvailabilityCalendar;
