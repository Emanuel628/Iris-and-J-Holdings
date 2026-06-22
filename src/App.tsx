import Home from './pages/public/Home';
import AdminConfirmEmailChange from './pages/admin/AdminConfirmEmailChange';
import AdminControlCenter from './pages/admin/AdminControlCenter';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminLogin from './pages/admin/AdminLogin';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';
import AdminNotaryRequests from './pages/admin/AdminNotaryRequests';
import AdminRealtorTools from './pages/admin/AdminRealtorTools';
import AdminRegister from './pages/admin/AdminRegister';
import AdminRentals from './pages/admin/AdminRentals';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminVacationBookings from './pages/admin/AdminVacationBookings';
import AdminHomeValueLab from './pages/admin/AdminHomeValueLab';
import Buy from './pages/public/Buy';
import Sell from './pages/public/Sell';
import HomeValue from './pages/public/HomeValue';
import MobileNotary from './pages/public/MobileNotary';
import Resources from './pages/public/Resources';
import About from './pages/public/About';
import BookContact from './pages/public/BookContact';
import InvoiceSuccess from './pages/public/InvoiceSuccess';
import VacationRentals from './pages/public/VacationRentals';
import BookingSuccess from './pages/public/BookingSuccess';
import NotarySuccess from './pages/public/NotarySuccess';
import ManageBooking from './pages/public/ManageBooking';
import HouseRules from './pages/public/HouseRules';
import VacationRentalIntake from './pages/public/VacationRentalIntake';
import RefundCancellationPolicy from './pages/public/RefundCancellationPolicy';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfUse from './pages/public/TermsOfUse';
import Accessibility from './pages/public/Accessibility';
import NewsletterAdmin from './pages/admin/NewsletterAdmin';
import NotFound from './pages/public/NotFound';
import ViewportModeToggle from './components/ui/ViewportModeToggle';
import AccessibilityWidget from './components/ui/AccessibilityWidget';

const routes = {
  '/': Home,
  '/admin/confirm-email-change': AdminConfirmEmailChange,
  '/admin': AdminControlCenter,
  '/admin/forgot-password': AdminForgotPassword,
  '/admin/invoices': AdminInvoices,
  '/admin/login': AdminLogin,
  '/admin/media': AdminMediaLibrary,
  '/admin/notary-requests': AdminNotaryRequests,
  '/admin/realtor-tools': AdminRealtorTools,
  '/admin/register': AdminRegister,
  '/admin/rentals': AdminRentals,
  '/admin/reset-password': AdminResetPassword,
  '/admin/settings': AdminSettings,
  '/admin/site-content': AdminSiteContent,
  '/admin/vacation-bookings': AdminVacationBookings,
  '/admin/home-value-lab': AdminHomeValueLab,
  '/buy': Buy,
  '/sell': Sell,
  '/home-value': HomeValue,
  '/mobile-notary': MobileNotary,
  '/resources': Resources,
  '/about': About,
  '/book': BookContact,
  '/contact': BookContact,
  '/invoice-success': InvoiceSuccess,
  '/vacation-rentals': VacationRentals,
  '/booking-success': BookingSuccess,
  '/notary-success': NotarySuccess,
  '/manage-booking': ManageBooking,
  '/house-rules': HouseRules,
  '/vacation-rental-intake': VacationRentalIntake,
  '/refund-cancellation-policy': RefundCancellationPolicy,
  '/privacy': PrivacyPolicy,
  '/terms': TermsOfUse,
  '/accessibility': Accessibility,
  '/admin/newsletter': NewsletterAdmin,
};

function normalizePath(pathname: string) {
  // Treat "/buy/" the same as "/buy" so a trailing slash doesn't fall through.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function App() {
  const path = normalizePath(window.location.pathname) as keyof typeof routes;
  const Page = routes[path] ?? NotFound;
  const showAccessibilityWidget = path === '/accessibility';

  return (
    <>
      <Page />
      {showAccessibilityWidget ? <AccessibilityWidget /> : null}
      <ViewportModeToggle />
    </>
  );
}

export default App;
