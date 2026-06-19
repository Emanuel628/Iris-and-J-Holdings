import AdminPlaceholderPage from '../../components/admin/AdminPlaceholderPage';

function AdminPolicies() {
  return (
    <AdminPlaceholderPage
      title="Policies"
      description="Route for terms, house rules, refund policies, notary notices, and other controlled policy content."
      links={[
        {
          href: '/admin/site-content',
          label: 'Site Content',
          detail: 'Existing page content editor can hold policy copy until a dedicated policy editor is built.',
        },
      ]}
    />
  );
}

export default AdminPolicies;
