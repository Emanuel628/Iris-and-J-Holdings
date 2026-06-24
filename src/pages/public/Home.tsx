import PublicLayout from '../../components/layout/PublicLayout';
import FinalCTA from '../../components/sections/FinalCTA';
import Hero from '../../components/sections/Hero';
import HomeNewsletterBar from '../../components/sections/HomeNewsletterBar';
import ProcessSteps from '../../components/sections/ProcessSteps';
import ServiceSelector from '../../components/sections/ServiceSelector';
import Testimonials from '../../components/sections/Testimonials';
import TrustSection from '../../components/sections/TrustSection';
import { usePageMeta } from '../../lib/usePageMeta';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://www.irisjholdings.com/#webpage',
      'url': 'https://www.irisjholdings.com/',
      'name': 'Iris & J Holdings | NJ Real Estate, Mobile Notary & Orlando Rentals',
      'description': 'NJ REALTOR® Daiana Castro helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex & Essex Counties, and provides Orlando vacation rental booking.',
      'isPartOf': { '@id': 'https://www.irisjholdings.com/#website' },
      'about': { '@id': 'https://www.irisjholdings.com/#localbusiness' },
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        'url': 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
      },
    },
    {
      '@type': 'ItemList',
      'name': 'Iris & J Holdings Services',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Buy a Home in New Jersey',
          'url': 'https://www.irisjholdings.com/buy',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Sell Your Home in New Jersey',
          'url': 'https://www.irisjholdings.com/sell',
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Mobile Notary – Union, Middlesex & Essex County NJ',
          'url': 'https://www.irisjholdings.com/mobile-notary',
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': 'Orlando Vacation Rental',
          'url': 'https://www.irisjholdings.com/vacation-rentals',
        },
      ],
    },
  ],
};

function Home() {
  usePageMeta(
    '',
    'NJ REALTOR® Daiana Castro helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex & Essex Counties, and provides Orlando vacation rental booking. Call (908) 499-6320.',
    { jsonLd: homeJsonLd },
  );
  return (
    <PublicLayout>
      <main id="top">
        <Hero />
        <ServiceSelector />
        <TrustSection />
        <ProcessSteps />
        <Testimonials />
        <HomeNewsletterBar />
        <FinalCTA />
      </main>
    </PublicLayout>
  );
}

export default Home;
