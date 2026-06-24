import { useState, type FormEvent } from 'react';

type BarState = 'idle' | 'sending' | 'success' | 'error';

function HomeNewsletterBar() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<BarState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setErrorMessage('');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source: 'home-page' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Could not subscribe right now.');
      }
      setEmail('');
      setState('success');
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not subscribe right now.');
    }
  }

  return (
    <section className="home-newsletter-bar" aria-label="Newsletter signup">
      <div className="home-newsletter-bar-inner">
        <p className="home-newsletter-bar-label">Stay in the loop</p>
        {state === 'success' ? (
          <p className="home-newsletter-bar-confirm">You&rsquo;re subscribed &mdash; updates will arrive in your inbox.</p>
        ) : (
          <form className="home-newsletter-bar-form" onSubmit={submit}>
            <label htmlFor="home-newsletter-email" className="sr-only">Email address</label>
            <input
              id="home-newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={state === 'sending'}
            />
            <button type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
        {state === 'error' && errorMessage ? (
          <p className="home-newsletter-bar-error" role="alert">{errorMessage}</p>
        ) : null}
      </div>
    </section>
  );
}

export default HomeNewsletterBar;
