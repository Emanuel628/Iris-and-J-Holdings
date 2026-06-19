import AdminPlaceholderPage from '../../components/admin/AdminPlaceholderPage';

function AdminMediaLibrary() {
  return (
    <AdminPlaceholderPage
      title="Media Library"
      description="Route for page-by-page image management, hero swaps, rental galleries, and future asset uploads."
      links={[
        {
          href: '/admin/rentals',
          label: 'Rentals',
          detail: 'Current rental records already support hero and gallery image URLs.',
        },
        {
          href: '/admin/site-content',
          label: 'Site Content',
          detail: 'Current site content records already support hero image URL editing.',
        },
      ]}
    />
  );
}

export default AdminMediaLibrary;
