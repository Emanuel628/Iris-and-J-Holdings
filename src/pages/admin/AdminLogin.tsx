import { useState, type FormEvent } from 'react';
import AdminAuthHeader from '../../components/admin/AdminAuthHeader';
import AdminLayout from '../../components/admin/AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminLogin() {
  usePageMeta('Admin Login', 'Secure admin login for Iris & J Holdings.', { robots: 'noindex,nofollow' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Incorrect Email or password');
        }
        throw new Error(payload.message || 'Could not sign in.');
      }
      window.location.href = '/admin';
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not sign in.');
    }
  }

  return (
    <AdminLayout showNav={false}>
      <div className="admin-auth-page-shell">
        <AdminAuthHeader />
        <div className="admin-auth-page">
        <section className="admin-auth-shell info-panel">
          <h1>Sign in</h1>
          <form className="form-shell" onSubmit={submit}>
            <div className="input-group">
              <label htmlFor="admin-login-email">Email</label>
              <input id="admin-login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="input-group">
              <label htmlFor="admin-login-password">Password</label>
              <input id="admin-login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <button className="button button-primary" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Signing in...' : 'Sign in'}
            </button>
            {status === 'error' ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
          </form>
          <div className="page-actions">
            <a className="text-link" href="/admin/register">Create admin account</a>
            <a className="text-link" href="/admin/forgot-password">Forgot password</a>
          </div>
        </section>
        <aside className="admin-auth-visual page-hero-image-frame" aria-label="Iris and J Holdings admin sign in">
          <img src="/images/site/vacation-hero.jpg" alt="Warm interior styled to match the Iris and J Holdings palette" />
        </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminLogin;

