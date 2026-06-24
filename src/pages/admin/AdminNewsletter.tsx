import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  fetchAdminMe,
  fetchAdminNewsletterCampaigns,
  fetchAdminNewsletterConfig,
  fetchAdminNewsletterSubscribers,
  type AdminNewsletterConfigPayload,
  type NewsletterCampaignRecord,
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

function todayLabel() {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
}

function newsletterParagraphs(body: string) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function AdminNewsletter() {
  usePageMeta('Admin Newsletter', 'Compose and send the Iris & J Holdings newsletter.', { robots: 'noindex,nofollow' });
  const [config, setConfig] = useState<AdminNewsletterConfigPayload | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberRecord[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaignRecord[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<NewsletterCampaignRecord | null>(null);
  const [title, setTitle] = useState('Iris & J Holdings Newsletter');
  const [date, setDate] = useState(todayLabel());
  const [body, setBody] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function loadData() {
    const [me, configPayload, subscribersPayload, campaignsPayload] = await Promise.all([
      fetchAdminMe(),
      fetchAdminNewsletterConfig(),
      fetchAdminNewsletterSubscribers(),
      fetchAdminNewsletterCampaigns().catch(() => ({ campaigns: [] as NewsletterCampaignRecord[] })),
    ]);
    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }
    setConfig(configPayload);
    setSubscribers(subscribersPayload.subscribers);
    setCampaigns(campaignsPayload.campaigns);
  }

  async function deleteCampaign(id: number) {
    setDeletingId(id);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/newsletter/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Could not delete campaign.');
      }
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      setStatusMessage('Campaign deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete campaign.');
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  const activeCount = useMemo(() => subscribers.filter((subscriber) => subscriber.status === 'active').length, [subscribers]);
  const previewParagraphs = useMemo(() => newsletterParagraphs(body), [body]);

  async function deleteSubscriber(id: number) {
    setBusyId(id);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const response = await fetch(`/api/admin/newsletter-subscribers/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Could not delete subscriber.');
      }
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      setStatusMessage('Subscriber permanently deleted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete subscriber.');
    } finally {
      setBusyId(null);
    }
  }

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

  async function sendNewsletter() {
    setSendState('sending');
    setStatusMessage('');
    setErrorMessage('');
    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ title, date, body }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Could not send the newsletter.');
      }
      await loadData();
      setStatusMessage(`Newsletter sent to ${payload.sentCount || activeCount} subscribers.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send the newsletter.');
    } finally {
      setSendState('idle');
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page newsletter-admin-page">
        <div className="page-intro">
          <p className="eyebrow">Newsletter</p>
          <h1>Compose newsletter</h1>
          <p>Daiana can write the headline, date, and message here, preview it, then send it to everyone currently subscribed.</p>
        </div>

        {!config?.enabled ? (
          <p className="form-status form-status-error" role="alert">
            Newsletter sending is not configured yet. Add `DATABASE_URL` and `RESEND_API_KEY` before sending.
          </p>
        ) : null}

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Send setup</h2>
            </div>
            <div className="admin-overview-grid admin-overview-cards">
              <div>
                <span>Active subscribers</span>
                <strong>{config?.activeCount ?? activeCount}</strong>
              </div>
              <div>
                <span>Total records</span>
                <strong>{config?.totalCount ?? subscribers.length}</strong>
              </div>
              <div>
                <span>Email delivery</span>
                <strong>{config?.enabled ? 'Ready' : 'Off'}</strong>
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
                <span>New subscribers come from the public newsletter form and any public forms that include the newsletter opt-in.</span>
              </a>
            </div>
          </section>
        </section>

        <section className="admin-panel newsletter-admin-composer">
          <div className="admin-section-head">
            <h2>Draft</h2>
            <div className="admin-inline-actions">
              <button className="button-secondary" type="button" onClick={() => setPreviewOpen((open) => !open)}>
                {previewOpen ? 'Hide preview' : 'Preview'}
              </button>
              <button className="button button-primary" type="button" onClick={sendNewsletter} disabled={sendState === 'sending' || !config?.enabled}>
                {sendState === 'sending' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>

          <div className="form-shell">
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="newsletter-title">Title</label>
                <input id="newsletter-title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              </div>
              <div className="input-group">
                <label htmlFor="newsletter-date">Date</label>
                <input id="newsletter-date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="newsletter-body">Text</label>
              <textarea
                id="newsletter-body"
                rows={12}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the newsletter here. Leave a blank line between paragraphs."
                required
              />
            </div>
          </div>
        </section>

        {previewOpen ? (
          <section className="admin-panel newsletter-email-preview-shell">
            <div className="admin-section-head">
              <h2>Email preview</h2>
            </div>
            <article className="newsletter-email-preview">
              <header className="newsletter-email-preview-head">
                <strong>Iris &amp; J Holdings</strong>
                <span>Real Estate · Mobile Notary · Orlando Vacation Rentals</span>
              </header>
              <div className="newsletter-email-preview-body">
                {date ? <p className="newsletter-email-preview-date">{date}</p> : null}
                <h3>{title || 'Iris & J Holdings Newsletter'}</h3>
                {previewParagraphs.length ? previewParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>No newsletter copy yet.</p>}
              </div>
              <footer className="newsletter-email-preview-foot">
                <p>Iris &amp; J Holdings · Real estate through All Star Real Estate Agency · Mobile notary and Orlando vacation rentals offered independently through Iris &amp; J Holdings.</p>
                <p>Every recipient email includes an unsubscribe link.</p>
              </footer>
            </article>
          </section>
        ) : null}

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
                  {subscriber.status === 'active' ? (
                    <button
                      className="button-secondary"
                      type="button"
                      onClick={() => updateStatus(subscriber, 'unsubscribed')}
                      disabled={busyId === subscriber.id}
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      className="button-secondary button-danger"
                      type="button"
                      onClick={() => deleteSubscriber(subscriber.id)}
                      disabled={busyId === subscriber.id}
                    >
                      {busyId === subscriber.id ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!subscribers.length ? <p className="admin-empty-note">No newsletter subscribers yet.</p> : null}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Sent history</h2>
          </div>
          <div className="admin-data-table admin-newsletter-table">
            <div className="admin-data-head admin-newsletter-history-head">
              <span>Title</span>
              <span>Recipients</span>
              <span>Status</span>
              <span>Sent</span>
              <span>Actions</span>
            </div>
            {campaigns.map((campaign) => (
              <div className="admin-data-row admin-newsletter-history-row" key={campaign.id}>
                <div>
                  <button
                    className="admin-campaign-title-link"
                    type="button"
                    onClick={() => setViewingCampaign((prev) => prev?.id === campaign.id ? null : campaign)}
                  >
                    {campaign.title || campaign.subject || '(Untitled)'}
                  </button>
                </div>
                <div>
                  <p>{campaign.recipient_count ?? '—'}</p>
                </div>
                <div>
                  <p>{campaign.status}</p>
                </div>
                <div>
                  <p>{campaign.sent_at ? formatDateTime(campaign.sent_at) : formatDateTime(campaign.created_at)}</p>
                </div>
                <div className="admin-campaign-actions">
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => setViewingCampaign((prev) => prev?.id === campaign.id ? null : campaign)}
                  >
                    {viewingCampaign?.id === campaign.id ? 'Close' : 'View'}
                  </button>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => deleteCampaign(campaign.id)}
                    disabled={deletingId === campaign.id}
                  >
                    {deletingId === campaign.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
            {!campaigns.length ? <p className="admin-empty-note">No newsletters sent yet.</p> : null}
          </div>

          {viewingCampaign ? (
            <section className="admin-panel newsletter-email-preview-shell" style={{ marginTop: '1.5rem' }}>
              <div className="admin-section-head">
                <h2>
                  {viewingCampaign.title || viewingCampaign.subject || '(Untitled)'}
                  {viewingCampaign.sent_at ? <span className="admin-campaign-sent-label"> — sent {formatDateTime(viewingCampaign.sent_at)}</span> : null}
                </h2>
                <button className="button-secondary" type="button" onClick={() => setViewingCampaign(null)}>Close</button>
              </div>
              <article className="newsletter-email-preview">
                <header className="newsletter-email-preview-head">
                  <strong>Iris &amp; J Holdings</strong>
                  <span>Real Estate · Mobile Notary · Orlando Vacation Rentals</span>
                </header>
                <div className="newsletter-email-preview-body">
                  <p className="newsletter-email-preview-date">
                    {viewingCampaign.sent_at
                      ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(viewingCampaign.sent_at))
                      : ''}
                  </p>
                  <h3>{viewingCampaign.title || viewingCampaign.subject || 'Iris & J Holdings Newsletter'}</h3>
                  {newsletterParagraphs(viewingCampaign.body || '').map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {!viewingCampaign.body ? <p className="admin-empty-note">No body text was stored for this campaign.</p> : null}
                </div>
                <footer className="newsletter-email-preview-foot">
                  <p>Iris &amp; J Holdings · Real estate through All Star Real Estate Agency · Mobile notary and Orlando vacation rentals offered independently through Iris &amp; J Holdings.</p>
                  <p>Every recipient email included an immediate unsubscribe link.</p>
                </footer>
              </article>
            </section>
          ) : null}
        </section>

        {statusMessage ? <p className="form-status form-status-success">{statusMessage}</p> : null}
        {errorMessage ? <p className="form-status form-status-error" role="alert">{errorMessage}</p> : null}
      </div>
    </AdminLayout>
  );
}

export default AdminNewsletter;
