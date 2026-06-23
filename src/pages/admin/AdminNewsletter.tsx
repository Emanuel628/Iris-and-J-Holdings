import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminMe,
  fetchAdminNewsletterSubscribers,
  type NewsletterSubscriberRecord,
} from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function formatDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function AdminNewsletter() {
  usePageMeta('Admin Newsletter', 'View and manage newsletter subscribers.', { robots: 'noindex,nofollow' });
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  async function loadData() {
    const [me, payload] = await Promise.all([fetchAdminMe(), fetchAdminNewsletterSubscribers()]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setSubscribers(payload.subscribers);
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  const activeCount = useMemo(() => subscribers.filter((subscriber) => subscriber.status === 'active').length, [subscribers]);

  async function updateStatus(subscriber: NewsletterSubscriberRecord, status: 'active' | 'unsubscribed') {
    setBusyId(subscriber.id);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const response = await fetch('/api/admin/newsletter-subscribers/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: subscriber.id, status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Could not update subscriber.');
      }
      await loadData();
      setStatusMessage(status === 'active' ? 'Subscriber reactivated.' : 'Subscriber archived.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update subscriber.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Newsletter</p>
          <h1>Subscribers</h1>
          <p>Track newsletter signups from the public site and keep the mailing list clean.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>List health</h2>
            </div>
            <div className="admin-overview-grid admin-overview-cards">
              <div>
                <span>Active</span>
                <strong>{activeCount}</strong>
              </div>
              <div>
                <span>Archived</span>
                <strong>{subscribers.length - activeCount}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{subscribers.length}</strong>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Public entry point</h2>
            </div>
            <div className="admin-route-list">
              <a href="/resources#newsletter-signup">
                <strong>Resources page signup</strong>
                <span>The public subscribe form now lives on the Resources page and links from the footer.</span>
              </a>
            </div>
          </section>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Subscriber list</h2>
          </div>
          <div className="admin-data-table admin-newsletter-table">
            <div className="admin-data-head admin-newsletter-head">
              <span>Name</span>
              <span>Email</span>
              <span>Source</span>
              <span>Status</span>
              <span>Updated</span>
              <span>Action</span>
            </div>
            {subscribers.map((subscriber) => (
              <div className="admin-data-row admin-newsletter-row" key={subscriber.id}>
                <div>
                  <strong>{subscriber.full_name || 'No name provided'}</strong>
                </div>
                <div>
                  <p><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></p>
                </div>
                <div>
                  <p>{subscriber.source || 'website'}</p>
                </div>
                <div>
                  <p>{subscriber.status}</p>
                </div>
                <div>
                  <p>{formatDateTime(subscriber.updated_at || subscriber.created_at)}</p>
                </div>
                <div>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => updateStatus(subscriber, subscriber.status === 'active' ? 'unsubscribed' : 'active')}
                    disabled={busyId === subscriber.id}
                  >
                    {subscriber.status === 'active' ? 'Archive' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
            {!subscribers.length ? <p className="admin-empty-note">No newsletter subscribers yet.</p> : null}
          </div>
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminNewsletter;
