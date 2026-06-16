import PublicLayout from '../../components/layout/PublicLayout';
import FinalCTA from '../../components/sections/FinalCTA';
import Hero from '../../components/sections/Hero';
import ProcessSteps from '../../components/sections/ProcessSteps';
import ServiceSelector from '../../components/sections/ServiceSelector';
import TrustSection from '../../components/sections/TrustSection';

function Home() {
  return (
    <PublicLayout>
      <main id="top">
        <Hero />
        <ServiceSelector />
        <TrustSection />
        <ProcessSteps />
        <FinalCTA />
      </main>
    </PublicLayout>
  );
}

export default Home;
