// Fetches an Airbnb (or other) iCal export and turns it into blocked date
// ranges. Results are cached briefly so we don't hit the calendar URL on every
// request. Ranges use YYYY-MM-DD strings; `end` is exclusive (the checkout day),
// which matches the iCal DTEND convention.

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache = { at: 0, url: '', ranges: [] };

function toIso(yyyymmdd) {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function addDay(iso) {
  const next = new Date(`${iso}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function parseIcalRanges(ical) {
  const ranges = [];
  const events = String(ical).split('BEGIN:VEVENT').slice(1);

  for (const event of events) {
    const startMatch = event.match(/DTSTART[^:\n]*:(\d{8})/);
    if (!startMatch) continue;
    const endMatch = event.match(/DTEND[^:\n]*:(\d{8})/);
    const start = toIso(startMatch[1]);
    const end = endMatch ? toIso(endMatch[1]) : addDay(start);
    if (end > start) {
      ranges.push({ start, end });
    }
  }

  return ranges.sort((a, b) => (a.start < b.start ? -1 : 1));
}

export async function getBlockedRanges(icalUrl) {
  if (!icalUrl) return [];

  const now = Date.now();
  if (cache.url === icalUrl && now - cache.at < CACHE_TTL_MS) {
    return cache.ranges;
  }

  try {
    const response = await fetch(icalUrl, { headers: { Accept: 'text/calendar' } });
    if (!response.ok) {
      throw new Error(`iCal request failed: ${response.status}`);
    }
    const text = await response.text();
    const ranges = parseIcalRanges(text);
    cache = { at: now, url: icalUrl, ranges };
    return ranges;
  } catch (error) {
    console.error('Airbnb availability fetch failed:', error);
    // Fall back to the last good data (or empty) so the page still renders.
    return cache.url === icalUrl ? cache.ranges : [];
  }
}

// True if [checkIn, checkOut) overlaps any blocked [start, end) range.
export function overlapsBlocked(checkIn, checkOut, ranges) {
  return ranges.some((range) => checkIn < range.end && range.start < checkOut);
}
