import AdminLayout from '../../components/admin/AdminLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminHomeValueLab() {
  usePageMeta('Admin Home Value Lab', 'Plan the home value estimator data and API stack.', { robots: 'noindex,nofollow' });

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Home Value Lab</p>
          <h1>Estimator foundation</h1>
          <p>This route defines the data stack for a credible home value estimator before we expose anything publicly.</p>
        </div>

        <section className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>What a real estimator needs</h2>
            </div>
            <div className="admin-route-list">
              <div>
                <strong>Property facts feed</strong>
                <span>Bedrooms, bathrooms, square footage, lot size, year built, parcel identifiers, tax history, and prior sales.</span>
              </div>
              <div>
                <strong>Comparable sales</strong>
                <span>Recent nearby closed sales, active listings, pending data, and local trend adjustments.</span>
              </div>
              <div>
                <strong>Market model</strong>
                <span>A rules engine or AVM provider that returns both an estimate and a confidence range.</span>
              </div>
              <div>
                <strong>Human review layer</strong>
                <span>Daiana still needs the ability to review edge cases, upgrades, condition gaps, and pricing strategy.</span>
              </div>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-head">
              <h2>Implementation path</h2>
            </div>
            <div className="admin-route-list">
              <div>
                <strong>Phase 1</strong>
                <span>Collect address, beds, baths, square footage, condition, upgrades, and seller timeline in a structured intake form.</span>
              </div>
              <div>
                <strong>Phase 2</strong>
                <span>Connect a property-data or AVM source and store the response payload, comps, and generated range.</span>
              </div>
              <div>
                <strong>Phase 3</strong>
                <span>Show a customer-facing estimate band with a clear disclaimer that it is not an appraisal.</span>
              </div>
              <div>
                <strong>Phase 4</strong>
                <span>Let Daiana adjust presentation, add CMA notes, and convert the lead into a listing intake.</span>
              </div>
            </div>
          </section>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Research note</h2>
          </div>
          <p className="admin-route-copy">
            Zillow says its Zestimate uses public records, MLS feeds, user-submitted facts, market trends, and a neural-network-based model, and it presents a range rather than just one price. That means we should not ship a fake single-number tool. The next step is choosing the property-data or AVM source and then wiring the intake around it.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminHomeValueLab;
