import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminConfirmEmailChange() {
  usePageMeta('Confirm Email Change', 'Confirm the Iris & J Holdings admin email change.', { robots: 'noindex,nofollow' });
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working');
  const [message, setMessage] = useState('Verifying the email change now.');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || '';
    if (!token) {
      setStatus('error');
      setMessage('This email verification link is invalid.');
      return;
    }

    fetch('/api/admin/confirm-email-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.message || 'Could not confirm the email change.');
        setStatus('done');
        setMessage('Email updated. Use the new email address the next time you sign in.');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Could not confirm the email change.');
      });
  }, []);

  return (
    <AdminLayout showNav={false}>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Confirm email change</h1>
          <p>{message}</p>
        </div>
        <div className="page-actions">
          <a className="button button-primary" href="/admin/settings">Back to settings</a>
          {status === 'done' ? <a className="button-secondary" href="/admin/login">Go to sign in</a> : null}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminConfirmEmailChange;
