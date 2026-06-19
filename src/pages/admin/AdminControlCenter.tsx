import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { fetchAdminDashboard, fetchAdminMe, type AdminUser, type DashboardSummary } from '../../lib/adminAuth';
import { usePageMeta } from '../../lib/usePageMeta';

function AdminControlCenter() {
  usePageMeta('Control Center', 'Admin control center for Iris & J Holdings.', { robots: 'noindex,nofollow' });
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  async function loadData() {
    const [me, dashboard] = await Promise.all([
      fetchAdminMe(),
      fetchAdminDashboard(),
    ]);

    if (!me?.user) {
      window.location.href = '/admin/login';
      return;
    }

    setUser(me.user);
    setSummary(dashboard.summary);
  }

  useEffect(() => {
    loadData().catch(() => {
      window.location.href = '/admin/login';
    });
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="page-intro">
          <p className="eyebrow">Control Center</p>
          <h1>Iris &amp; J Holdings admin.</h1>
          {user ? <p>Signed in as {user.email}.</p> : <p>Loading your admin session...</p>}
        </div>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Overview</h2>
          </div>
          <div className="admin-overview-grid">
            <div>
              <span>Number of rentals</span>
              <strong>{summary?.rentals ?? '--'}</strong>
            </div>
            <div>
              <span>Booked dates</span>
              <strong>{summary?.vacationBookings ?? '--'}</strong>
            </div>
            <div>
              <span>Notary requests</span>
              <strong>{summary?.notaryRequests ?? '--'}</strong>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <h2>Programs</h2>
          </div>
          <div className="admin-route-list">
            <a href="/admin/rentals">
              <strong>Rentals</strong>
              <span>Create listings, update pricing, swap images, and manage manual availability holds.</span>
            </a>
            <a href="/admin/vacation-bookings">
              <strong>Booked Dates</strong>
              <span>Open the vacation bookings queue with guest names, dates, contact details, totals, and status controls.</span>
            </a>
            <a href="/admin/notary-requests">
              <strong>Notary Requests</strong>
              <span>Review appointment requests, signer details, city, notes, and request status.</span>
            </a>
            <a href="/admin/site-content">
              <strong>Site Content</strong>
              <span>Edit page copy and hero image URLs for the public-facing site.</span>
            </a>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminControlCenter;
