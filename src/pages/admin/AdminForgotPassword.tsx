import { useState, type FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminForgotPassword() {
  usePageMeta('Forgot Password', 'Reset the Iris & J Holdings admin password.', { robots: 'noindex,nofollow' });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not start password reset.');
      setStatus('sent');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not start password reset.');
    }
  }

  return (
    <AdminLayout showNav={false}>
      <div className="admin-auth-shell info-panel">
        <h1>Forgot password</h1>
        <form className="form-shell" onSubmit={submit}>
          <div className="input-group">
            <label htmlFor="admin-forgot-email">Email</label>
            <input id="admin-forgot-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <button className="button button-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send reset link'}
          </button>
          {status === 'sent' ? <p className="form-status form-status-success">If the account exists, a reset link has been sent.</p> : null}
          {status === 'error' ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
        </form>
        <div className="page-actions">
          <a className="text-link" href="/admin/login">Back to sign in</a>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminForgotPassword;
