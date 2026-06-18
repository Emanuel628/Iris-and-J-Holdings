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
    'Iris & J Holdings helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex, and Essex Counties, and provides Orlando vacation rental booking.',
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
