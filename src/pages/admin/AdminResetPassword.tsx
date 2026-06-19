import { useMemo, useState, type FormEvent } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminResetPassword() {
  usePageMeta('Reset Password', 'Set a new Iris & J Holdings admin password.', { robots: 'noindex,nofollow' });
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    if (!token) {
      setStatus('error');
      setErrorMessage('This reset link is invalid.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.message || 'Could not reset password.');
      window.location.href = '/admin';
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not reset password.');
    }
  }

  return (
    <AdminLayout showNav={false}>
      <div className="admin-auth-shell info-panel">
        <h1>Reset password</h1>
        <form className="form-shell" onSubmit={submit}>
          <div className="input-group">
            <label htmlFor="admin-reset-password">New Password</label>
            <input id="admin-reset-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="admin-reset-confirm">Confirm Password</label>
            <input id="admin-reset-confirm" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
          <button className="button button-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Resetting...' : 'Reset password'}
          </button>
          {status === 'error' ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminResetPassword;
