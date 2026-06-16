import { useState } from 'react';
import type { FormEvent } from 'react';

const FORM_ENDPOINT = '/api/contact';

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

function formatLabel(key: string) {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

/**
 * Handles a public contact/booking form: collects the fields, posts them to the
 * email API, and exposes an inline status so the form can show calm feedback
 * instead of a browser alert. Fields whose name starts with "_" (e.g. the
 * "_gotcha" honeypot) are never sent as content.
 */
export function useContactForm(subject: string) {
  const [status, setStatus] = useState<SubmitStatus>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Bots fill the hidden honeypot. Pretend everything is fine and send nothing.
    if (String(formData.get('_gotcha') ?? '').trim().length > 0) {
      setStatus('success');
      form.reset();
      return;
    }

    const fields = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key]) => !key.startsWith('_'))
        .map(([key, value]) => [formatLabel(key), String(value).trim()] as const)
        .filter(([, value]) => value.length > 0),
    );

    setStatus('sending');

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
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return { status, submit };
}
