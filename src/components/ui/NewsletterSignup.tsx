import { useState, type FormEvent } from 'react';

type NewsletterSignupProps = {
  source?: string;
  title?: string;
  description?: string;
  compact?: boolean;
};

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

function NewsletterSignup({
  source = 'resources-page',
  title = 'Subscribe to the newsletter',
  description = 'Get occasional market updates, new listings, and practical home guidance by email.',
  compact = false,
}: NewsletterSignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, source }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Could not subscribe right now.');
      }
      setName('');
      setEmail('');
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not subscribe right now.');
    }
  }

  return (
    <section className={`newsletter-signup ${compact ? 'newsletter-signup-compact' : ''}`} aria-label="Newsletter signup">
      <div className="newsletter-signup-copy">
        <p className="eyebrow">Newsletter</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <form className="newsletter-signup-form" onSubmit={submit}>
        <div className="form-row">
          <div className="input-group">
            <label htmlFor={`newsletter-name-${source}`}>Name</label>
            <input
              id={`newsletter-name-${source}`}
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor={`newsletter-email-${source}`}>Email</label>
            <input
              id={`newsletter-email-${source}`}
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>
        <button className="button button-primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Subscribing...' : 'Subscribe'}
        </button>
        {status === 'success' ? <p className="form-status form-status-success">Subscribed. Future updates will go to your inbox.</p> : null}
        {status === 'error' ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </form>
    </section>
  );
}

export default NewsletterSignup;
