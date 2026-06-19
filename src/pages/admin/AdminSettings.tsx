import AdminPlaceholderPage from '../../components/admin/AdminPlaceholderPage';

function AdminSettings() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      description="Route for admin security, site configuration, booking defaults, Stripe-related controls, and future operational settings."
      links={[
        {
          href: '/admin/login',
          label: 'Auth',
          detail: 'Admin login, password reset, and current security controls are already active.',
        },
      ]}
    />
  );
}

export default AdminSettings;
