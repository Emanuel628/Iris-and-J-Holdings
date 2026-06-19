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

type VacationBookingCalendarProps = {
  rentalId?: number;
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

function VacationBookingCalendar({ rentalId }: VacationBookingCalendarProps) {
  const [data, setData] = useState<Availability | null>(null);
  const [loadError, setLoadError] = useState(false);
  const today = todayIso();
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [calendarError, setCalendarError] = useState('');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (rentalId) params.set('rentalId', String(rentalId));
    fetch(`/api/availability${params.toString() ? `?${params.toString()}` : ''}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload: Availability) => {
        if (active) setData(payload);
      })
      .catch(() => active && setLoadError(true));
    return () => {
      active = false;
    };
  }, [rentalId]);

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

  function rangeHasBlockedNight(from: string, toExclusive: string) {
    let cursor = from;
    while (cursor < toExclusive) {
      if (blockedNights.has(cursor)) return true;
      cursor = addDays(cursor, 1);
    }
    return false;
  }

  function selectDate(date: string) {
    setCalendarError('');
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

  function continueToIntake() {
    if (!checkIn || !checkOut) {
      setCalendarError('Please select both check-in and check-out dates.');
      return;
    }
    const params = new URLSearchParams({ checkIn, checkOut });
    if (rentalId) params.set('rentalId', String(rentalId));
    window.location.href = `/vacation-rental-intake?${params.toString()}`;
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
                  <div><span>Check-in</span><strong>{formatShortDate(checkIn)}</strong></div>
                  <ArrowRight size={16} aria-hidden="true" />
                  <div><span>Check-out</span><strong>{formatShortDate(checkOut)}</strong></div>
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
                    <p className="cal-note">
                      Continue to the guest intake page to enter traveler details, review the house rules, and complete secure checkout.
                    </p>
                    <button className="button button-primary" type="button" onClick={continueToIntake}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <p className="cal-note">
                    Online checkout is coming soon. <a className="text-link" href="#questions">Send Daiana a question</a> and she will confirm these dates.
                  </p>
                )}
                {calendarError && <p className="form-status form-status-error" role="alert">{calendarError}</p>}
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


