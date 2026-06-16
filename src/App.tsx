import Home from './pages/public/Home';
import Buy from './pages/public/Buy';
import Sell from './pages/public/Sell';
import HomeValue from './pages/public/HomeValue';
import MobileNotary from './pages/public/MobileNotary';
import Resources from './pages/public/Resources';
import About from './pages/public/About';
import BookContact from './pages/public/BookContact';
import VacationRentals from './pages/public/VacationRentals';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfUse from './pages/public/TermsOfUse';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Leads from './pages/admin/Leads';
import Appointments from './pages/admin/Appointments';
import MediaLibrary from './pages/admin/MediaLibrary';
import SiteSettings from './pages/admin/SiteSettings';
import ViewportModeToggle from './components/ui/ViewportModeToggle';

const routes = {
  '/': Home,
  '/buy': Buy,
  '/sell': Sell,
  '/home-value': HomeValue,
  '/mobile-notary': MobileNotary,
  '/resources': Resources,
  '/about': About,
  '/book': BookContact,
  '/vacation-rentals': VacationRentals,
  '/privacy': PrivacyPolicy,
  '/terms': TermsOfUse,
  '/admin/login': AdminLogin,
  '/admin': AdminDashboard,
  '/admin/leads': Leads,
  '/admin/appointments': Appointments,
  '/admin/media': MediaLibrary,
  '/admin/settings': SiteSettings,
};

function App() {
  const path = window.location.pathname as keyof typeof routes;
  const Page = routes[path] ?? Home;

  return (
    <>
      <Page />
      <ViewportModeToggle />
    </>
  );
}

export default App;
