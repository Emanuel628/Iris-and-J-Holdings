import type { FormEvent } from 'react';

const FORM_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT ?? '';

function formatLabel(key: string) {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function sendWebsiteRequest(event: FormEvent<HTMLFormElement>, subject: string) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(
    Array.from(formData.entries())
      .map(([key, value]) => [formatLabel(key), String(value).trim()] as const)
      .filter(([, value]) => value.length > 0),
  );

  if (!FORM_ENDPOINT) {
    window.alert('Message sending is not configured yet.');
    return;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ subject, ...payload }),
  });

  if (!response.ok) {
    window.alert('Message could not be sent. Please try again.');
    return;
  }

  form.reset();
  window.alert('Message sent.');
}
