import type { FormEvent } from 'react';

export const LISTINGS_EMAIL = 'listingsbyd@gmail.com';

function formatLabel(key: string) {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function sendMailRequest(event: FormEvent<HTMLFormElement>, subject: string) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const lines = Array.from(formData.entries())
    .map(([key, value]) => [formatLabel(key), String(value).trim()] as const)
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `${label}: ${value}`);

  const body = encodeURIComponent(lines.join('\n'));
  const emailSubject = encodeURIComponent(subject);

  window.location.href = `mailto:${LISTINGS_EMAIL}?subject=${emailSubject}&body=${body}`;
}

export function buildMailto(subject: string, body: string) {
  return `mailto:${LISTINGS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
