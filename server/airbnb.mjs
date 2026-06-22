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

async function getBlockedRangesForUrl(icalUrl) {
  if (!icalUrl) return [];

  const now = Date.now();
  const cached = cache.get(icalUrl);
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return cached.ranges;
  }

  try {
    const response = await fetch(icalUrl, { headers: { Accept: 'text/calendar' } });
    if (!response.ok) {
      throw new Error(`iCal request failed: ${response.status}`);
    }
    const text = await response.text();
    const ranges = parseIcalRanges(text);
    cache.set(icalUrl, { at: now, ranges });
    return ranges;
  } catch (error) {
    console.error('Airbnb availability fetch failed:', error);
    // Fall back to the last good data for this URL so the page still renders.
    return cached?.ranges || [];
  }
}

export async function getBlockedRanges(icalInput) {
  const urls = calendarUrls(icalInput);
  if (urls.length === 0) return [];

  const ranges = await Promise.all(urls.map((url) => getBlockedRangesForUrl(url)));
  return mergeRanges(ranges.flat());
}

// True if [checkIn, checkOut) overlaps any blocked [start, end) range.
export function overlapsBlocked(checkIn, checkOut, ranges) {
  return ranges.some((range) => checkIn < range.end && range.start < checkOut);
}
