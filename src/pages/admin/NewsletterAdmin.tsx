import { useEffect, useState } from 'react';
import { usePageMeta } from '../../lib/usePageMeta';

type ImageRow = { url: string; caption: string };
type ListingRow = { title: string; url: string; image: string; description: string };
type Status = 'idle' | 'sending' | 'sent' | 'error';

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function NewsletterAdmin() {
  usePageMeta('Newsletter', 'Compose and send the Iris & J Holdings newsletter.');

  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [title, setTitle] = useState('Iris & J Holdings Newsletter');
  const [date, setDate] = useState(todayLabel());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<ImageRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/newsletter/config')
      .then((res) => res.json())
      .then((data) => setEnabled(Boolean(data.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  function addImage() {
    setImages((rows) => [...rows, { url: '', caption: '' }]);
  }
  function addListing() {
    setListings((rows) => [...rows, { title: '', url: '', image: '', description: '' }]);
  }

  async function send() {
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          title,
          date,
          subject: subject || title,
          body,
          images: images.filter((i) => i.url.trim()),
          listings: listings.filter((l) => l.title.trim() || l.url.trim()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not send the newsletter.');
      setStatus('sent');
      setMessage('Newsletter sent to your subscribers.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not send the newsletter.');
    }
  }

  return (
    <main className="page-main">
      <section className="page-content newsletter-admin">
        <div className="page-intro">
          <p className="eyebrow">Admin</p>
          <h1>Compose newsletter</h1>
          <p>Write the update, add photos or listings, then send it to everyone subscribed.</p>
          {enabled === false && (
            <p className="form-status form-status-error" role="alert">
              The newsletter isn’t configured yet (needs RESEND_API_KEY and RESEND_AUDIENCE_ID). You can still
              draft here, but sending won’t work until those are set.
            </p>
          )}
        </div>

        <div className="info-panel form-shell">
          <div className="form-row">
            <div className="input-group"><label htmlFor="nl-title">Title</label><input id="nl-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="input-group"><label htmlFor="nl-date">Date</label><input id="nl-date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div className="input-group"><label htmlFor="nl-subject">Email subject (optional)</label><input id="nl-subject" placeholder={title} value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="input-group">
            <label htmlFor="nl-body">Newsletter text</label>
            <textarea id="nl-body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your update here. Leave a blank line between paragraphs." />
          </div>

          <div className="nl-section">
            <div className="nl-section-head"><strong>Photos</strong><button type="button" className="text-link" onClick={addImage}>+ Add photo</button></div>
            {images.map((img, i) => (
              <div className="form-row" key={`img-${i}`}>
                <div className="input-group"><label>Image URL</label><input value={img.url} onChange={(e) => setImages((r) => r.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} placeholder="https://…" /></div>
                <div className="input-group"><label>Caption</label><input value={img.caption} onChange={(e) => setImages((r) => r.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} /></div>
              </div>
            ))}
          </div>

          <div className="nl-section">
            <div className="nl-section-head"><strong>Listings</strong><button type="button" className="text-link" onClick={addListing}>+ Add listing</button></div>
            {listings.map((l, i) => (
              <div className="nl-listing" key={`lst-${i}`}>
                <div className="form-row">
                  <div className="input-group"><label>Listing title</label><input value={l.title} onChange={(e) => setListings((r) => r.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} /></div>
                  <div className="input-group"><label>Listing link</label><input value={l.url} onChange={(e) => setListings((r) => r.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} placeholder="https://…" /></div>
                </div>
                <div className="form-row">
                  <div className="input-group"><label>Image URL</label><input value={l.image} onChange={(e) => setListings((r) => r.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)))} placeholder="https://…" /></div>
                  <div className="input-group"><label>Short description</label><input value={l.description} onChange={(e) => setListings((r) => r.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="input-group"><label htmlFor="nl-token">Admin passcode</label><input id="nl-token" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Required to send" /></div>

          <button className="button button-primary" type="button" onClick={send} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send newsletter'}
          </button>
          {message && <p className={`form-status form-status-${status === 'sent' ? 'success' : 'error'}`} role="status">{message}</p>}
        </div>
      </section>
    </main>
  );
}

export default NewsletterAdmin;
