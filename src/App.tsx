import Home from './pages/public/Home';
import Buy from './pages/public/Buy';
import Sell from './pages/public/Sell';
import HomeValue from './pages/public/HomeValue';
import MobileNotary from './pages/public/MobileNotary';
import Resources from './pages/public/Resources';
import About from './pages/public/About';
import BookContact from './pages/public/BookContact';
import VacationRentals from './pages/public/VacationRentals';
import BookingSuccess from './pages/public/BookingSuccess';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfUse from './pages/public/TermsOfUse';
import NotFound from './pages/public/NotFound';
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
  '/contact': BookContact,
  '/vacation-rentals': VacationRentals,
  '/booking-success': BookingSuccess,
  '/privacy': PrivacyPolicy,
  '/terms': TermsOfUse,
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

  return (
    <>
      <Page />
      <ViewportModeToggle />
    </>
  );
}

export default App;
