import type { FormEvent } from 'react';

const FORM_ENDPOINT = '/api/contact';

function formatLabel(key: string) {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function sendWebsiteRequest(event: FormEvent<HTMLFormElement>, subject: string) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const originalButtonText = submitButton?.textContent ?? 'Send Message';
  const formData = new FormData(form);
  const fields = Object.fromEntries(
    Array.from(formData.entries())
      .map(([key, value]) => [formatLabel(key), String(value).trim()] as const)
      .filter(([, value]) => value.length > 0),
  );

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
  }

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ subject, fields }),
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    form.reset();
    window.alert('Message sent. Daiana will receive it by email.');
  } catch {
    window.alert('Message could not be sent. Please try again or call Daiana directly.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  }
}
