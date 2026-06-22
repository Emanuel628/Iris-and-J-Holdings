import AdminLayout from './AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
  links?: { href: string; label: string; detail: string }[];
};

function AdminPlaceholderPage({ title, description, eyebrow = 'Admin', links = [] }: AdminPlaceholderPageProps) {
  usePageMeta(title, description, { robots: 'noindex,nofollow' });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Route Ready</h2>
          </div>
          <p className="admin-route-copy">
            This route is in place so the control center can expand without reworking navigation again. The program UI can be built directly onto this page next.
          </p>
        </section>

        {links.length ? (
          <section className="admin-section">
            <div className="admin-section-head">
              <h2>Related Pages</h2>
            </div>
            <div className="admin-route-list">
              {links.map((link) => (
                <a key={link.href} href={link.href}>
                  <strong>{link.label}</strong>
                  <span>{link.detail}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AdminLayout>
  );
}

export default AdminPlaceholderPage;
