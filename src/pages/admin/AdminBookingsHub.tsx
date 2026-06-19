import AdminPlaceholderPage from '../../components/admin/AdminPlaceholderPage';

function AdminBookingsHub() {
  return (
    <AdminPlaceholderPage
      title="Bookings"
      description="Route hub for paid vacation bookings, notary requests, cancellations, date changes, and booking operations."
      links={[
        {
          href: '/admin/vacation-bookings',
          label: 'Booked Dates',
          detail: 'Vacation booking records with guest details, dates, totals, and status controls.',
        },
        {
          href: '/admin/notary-requests',
          label: 'Notary Requests',
          detail: 'Paid notary appointment requests with signer details and request status.',
        },
      ]}
    />
  );
}

export default AdminBookingsHub;
