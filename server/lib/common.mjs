export function clean(value) {
  return String(value ?? '').trim();
}

export function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCookies(req) {
  const header = String(req.headers.cookie || '');
  const cookies = {};
  for (const pair of header.split(';')) {
    const [key, ...rest] = pair.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

export function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly !== false) parts.push('HttpOnly');
  parts.push('Path=/');
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.secure) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

export function clearCookie(res, name, options = {}) {
  setCookie(res, name, '', { ...options, maxAge: 0 });
}

export function metadataValue(value) {
  return clean(value).slice(0, 500);
}

export function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function normalizedSeoPath(pathname) {
  const cleaned = clean(pathname || '/');
  if (!cleaned || cleaned === '/') return '/';
  return cleaned.replace(/\/+$/, '') || '/';
}

export function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function nightsBetween(checkIn, checkOut) {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function validateStay(checkIn, checkOut) {
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) {
    return { ok: false, message: 'Please choose valid check-in and check-out dates.' };
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { ok: false, message: 'Check-out must be after check-in.' };
  if (nights > 30) return { ok: false, message: 'Please choose a stay of 30 nights or fewer.' };
  if (checkIn < todayIso()) return { ok: false, message: 'Check-in cannot be in the past.' };
  return { ok: true, nights };
}

export function money(cents, currency) {
  return `${(cents / 100).toFixed(2)} ${String(currency).toUpperCase()}`;
}

export function buildOrigin(req) {
  return `${req.protocol}://${req.get('host')}`;
}

export function formatTimeLabel(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(clean(value));
  if (!match) return clean(value);
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function summarizeGuestList(primaryGuest, additionalGuests) {
  const lines = [];
  const allGuests = [primaryGuest, ...additionalGuests].filter(Boolean);

  for (const [index, guest] of allGuests.entries()) {
    const label = index === 0 ? 'Primary Guest #1' : `Guest #${index + 1}`;
    const parts = [clean(guest.fullName)];
    if (clean(guest.email)) parts.push(`email: ${clean(guest.email)}`);
    if (clean(guest.phone)) parts.push(`phone: ${clean(guest.phone)}`);
    lines.push(`${label}: ${parts.filter(Boolean).join(' | ')}`);
  }

  return lines.join('\n');
}
