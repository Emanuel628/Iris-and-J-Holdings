import { useState, type FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminRegister() {
  usePageMeta('Admin Register', 'Create the first admin user for Iris & J Holdings.', { robots: 'noindex,nofollow' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.message || 'Could not create the admin account.');
      }
      window.location.href = '/admin';
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not create the admin account.');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-auth-shell info-panel">
        <p className="eyebrow">Admin</p>
        <h1>Create the first admin</h1>
        <p>Use this once to create Daiana&apos;s admin access. After the first account exists, registration closes.</p>
        <form className="form-shell" onSubmit={submit}>
          <div className="input-group">
            <label htmlFor="admin-register-name">Full Name</label>
            <input id="admin-register-name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="admin-register-email">Email</label>
            <input id="admin-register-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="admin-register-password">Password</label>
            <input id="admin-register-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <button className="button button-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Creating account...' : 'Create admin account'}
          </button>
          {status === 'error' ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
        </form>
        <div className="page-actions">
          <a className="text-link" href="/admin/login">Back to sign in</a>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminRegister;
