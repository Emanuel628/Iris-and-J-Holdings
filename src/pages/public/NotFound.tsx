import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function NotFound() {
  usePageMeta('Page Not Found', 'The page you were looking for isn’t here.');
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Page not found</p>
            <h1>This page took a wrong turn.</h1>
            <p>
              The page you were looking for isn’t here. Let’s get you back to a clear next step.
            </p>
            <div className="page-actions">
              <a className="button button-primary" href="/">Back to Home</a>
              <a className="text-link" href="/book?service=General%20Question#contact-form">Contact Daiana</a>
            </div>
          </div>
          <div className="page-hero-visual" aria-hidden="true" />
        </section>
      </main>
    </PublicLayout>
  );
}

export default NotFound;
