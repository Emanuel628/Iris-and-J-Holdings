// Fetches Airbnb (or other iCal) exports and turns them into blocked date
// ranges. Results are cached briefly so we don't hit calendar URLs on every
// request. Ranges use YYYY-MM-DD strings; `end` is exclusive (the checkout day),
// which matches the iCal DTEND convention.

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function toIso(value) {
  const text = String(value || '').trim();
  const yyyymmdd = text.slice(0, 8);
  if (!/^\d{8}$/.test(yyyymmdd)) return '';
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function addDay(iso) {
  const next = new Date(`${iso}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

function unfoldIcal(ical) {
  return String(ical || '').replace(/\r?\n[ \t]/g, '');
}

function calendarUrls(value) {
  if (Array.isArray(value)) {
    return value.map((url) => String(url).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function mergeRanges(ranges) {
  const sorted = ranges
    .filter((range) => range?.start && range?.end && range.end > range.start)
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  const merged = [];
  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous || range.start > previous.end) {
      merged.push({ ...range });
    } else if (range.end > previous.end) {
      previous.end = range.end;
    }
  }

  return merged;
}

export function parseIcalRanges(ical) {
  const ranges = [];
  const events = unfoldIcal(ical).split('BEGIN:VEVENT').slice(1);

  for (const event of events) {
    const startMatch = event.match(/DTSTART[^:\n]*:([^\r\n]+)/);
    if (!startMatch) continue;

    const endMatch = event.match(/DTEND[^:\n]*:([^\r\n]+)/);
    const start = toIso(startMatch[1]);
    if (!start) continue;

    const end = endMatch ? toIso(endMatch[1]) : addDay(start);
    const normalizedEnd = end || addDay(start);

    if (normalizedEnd > start) {
      ranges.push({ start, end: normalizedEnd });
    }
  }

  return mergeRanges(ranges);
}

// `reliable: false` means we have no idea what's actually blocked on this calendar
// (the very first fetch failed and there's no prior cache to fall back to) - callers
// that are about to accept a real booking need to know that, rather than silently
// treating "we couldn't check" the same as "nothing is blocked".
async function getBlockedRangesForUrl(icalUrl) {
  if (!icalUrl) return { ranges: [], reliable: true };

  const now = Date.now();
  const cached = cache.get(icalUrl);
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return { ranges: cached.ranges, reliable: true };
  }

  try {
    const response = await fetch(icalUrl, {
      headers: { Accept: 'text/calendar' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`iCal request failed: ${response.status}`);
    }
    const text = await response.text();
    const ranges = parseIcalRanges(text);
    cache.set(icalUrl, { at: now, ranges });
    return { ranges, reliable: true };
  } catch (error) {
    console.error('Airbnb availability fetch failed:', error);
    if (cached) {
      // Stale, but it's real data from a previous successful fetch - better than nothing.
      return { ranges: cached.ranges, reliable: true };
    }
    return { ranges: [], reliable: false };
  }
}

export async function getBlockedRanges(icalInput) {
  const urls = calendarUrls(icalInput);
  if (urls.length === 0) return { ranges: [], reliable: true };

  const results = await Promise.all(urls.map((url) => getBlockedRangesForUrl(url)));
  return {
    ranges: mergeRanges(results.flatMap((result) => result.ranges)),
    reliable: results.every((result) => result.reliable),
  };
}

// True if [checkIn, checkOut) overlaps any blocked [start, end) range.
export function overlapsBlocked(checkIn, checkOut, ranges) {
  return ranges.some((range) => checkIn < range.end && range.start < checkOut);
}
