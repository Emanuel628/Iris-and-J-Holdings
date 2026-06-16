import PublicLayout from '../../components/layout/PublicLayout';
import FinalCTA from '../../components/sections/FinalCTA';
import Hero from '../../components/sections/Hero';
import ProcessSteps from '../../components/sections/ProcessSteps';
import ServiceSelector from '../../components/sections/ServiceSelector';
import Testimonials from '../../components/sections/Testimonials';
import TrustSection from '../../components/sections/TrustSection';
import { usePageMeta } from '../../lib/usePageMeta';

function Home() {
  usePageMeta(
    '',
    'New Jersey real estate guidance and mobile notary services with a calm, organized approach. Buy, sell, home value, and notary help in Union, Middlesex, and Essex Counties.',
  );
  return (
    <PublicLayout>
      <main id="top">
        <Hero />
        <ServiceSelector />
        <TrustSection />
        <ProcessSteps />
        <Testimonials />
        <FinalCTA />
      </main>
    </PublicLayout>
  );
}

export default Home;
