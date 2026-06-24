import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { escapeHtml, escapeJsonForHtml, normalizedSeoPath } from './lib/common.mjs';

const notaryFaqSeo = [
  ['Which areas do you serve?', 'Primarily Union, Middlesex, and Essex Counties, with additional areas available by request based on distance and scheduling.'],
  ['What should I have ready before the appointment?', 'Share the city, document type, number of signers, your preferred time, and any notes. Bring a valid, unexpired government-issued photo ID for every signer, and leave documents unsigned until we meet.'],
  ['Is a fee required to book?', 'Yes. The travel or booking fee is paid through secure checkout when you submit the request. Notary fees are separate and depend on the document type and number of notarizations. Daiana confirms the details by email.'],
  ['What types of documents can you notarize?', 'General notarizations, real estate documents, affidavits, and consent forms, among others. Share the document type when booking so Daiana can confirm.'],
];

const vacationFaqSeo = [
  ['Where is the rental located?', 'In the Orlando and Central Florida area, close to the major theme parks. The exact address is shared after booking.'],
  ['How do I book?', 'Pick your dates on the availability calendar, continue to the guest intake page, review the house rules, and check out securely. A stay is confirmed after payment is completed and a booking confirmation is issued by email.'],
  ['What is included in the price?', 'The nightly rate plus a one-time cleaning fee is shown on the calendar before checkout. Any additional property-specific terms, fees, or house rules are confirmed before booking.'],
  ['Have a question before booking?', 'Use the question form on the page and Daiana will get back to you by email about dates, the property, or anything else.'],
];

export const publicSeoRoutes = {
  '/': {
    title: 'Iris & J Holdings | New Jersey Real Estate, Mobile Notary & Orlando Rentals',
    description: 'Iris & J Holdings helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex, and Essex Counties, and provides Orlando vacation rental booking.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Home',
  },
  '/buy': {
    title: 'Buy a Home in New Jersey | Iris & J Holdings',
    description: 'Buyer consultation and home search guidance in New Jersey, including budget review, pre-approval, offers, inspections, attorney review, and closing next steps.',
    image: 'https://www.irisjholdings.com/images/site/buy-hero.jpg',
    breadcrumb: 'Buy',
  },
  '/sell': {
    title: 'Sell Your Home in New Jersey | Iris & J Holdings',
    description: 'Seller strategy guidance in New Jersey for pricing, preparation, marketing, negotiation, attorney review, and closing through All Star Real Estate Agency.',
    image: 'https://www.irisjholdings.com/images/site/sell-hero.jpg',
    breadcrumb: 'Sell',
  },
  '/home-value': {
    title: 'New Jersey Home Value Review | Iris & J Holdings',
    description: 'Request a New Jersey home value review using recent comparable sales, nearby listings, condition, updates, and local market activity. Not a formal appraisal.',
    image: 'https://www.irisjholdings.com/images/site/home-value-hero.jpg',
    breadcrumb: 'Home Value',
  },
  '/mobile-notary': {
    title: 'Mobile Notary in Union, Middlesex and Essex Counties | Iris & J Holdings',
    description: 'Mobile notary appointments for Union County, Middlesex County, and Essex County, NJ, including general notarizations, real estate documents, affidavits, and consent forms.',
    image: 'https://www.irisjholdings.com/images/site/notary-hero.jpg',
    breadcrumb: 'Mobile Notary',
  },
  '/resources': {
    title: 'Real Estate Resources for NJ Buyers and Sellers | Iris & J Holdings',
    description: 'Plain-language New Jersey buyer guides, seller guides, and local market updates for people preparing to buy, sell, or request a home value review.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Resources',
  },
  '/about': {
    title: 'About Daiana Castro, REALTOR | Iris & J Holdings',
    description: 'Meet Daiana Castro, REALTOR and mobile notary serving New Jersey buyers, sellers, and notary clients through Iris & J Holdings and All Star Real Estate Agency.',
    image: 'https://www.irisjholdings.com/images/site/daiana-portrait.jpg',
    breadcrumb: 'About',
  },
  '/book': {
    title: 'Book a Consultation or Notary Appointment | Iris & J Holdings',
    description: 'Contact Daiana Castro to schedule a New Jersey buyer consultation, seller strategy call, home value review, mobile notary appointment, or general question.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Book',
  },
  '/contact': {
    title: 'Book a Consultation or Notary Appointment | Iris & J Holdings',
    description: 'Contact Daiana Castro to schedule a New Jersey buyer consultation, seller strategy call, home value review, mobile notary appointment, or general question.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Book',
    canonicalPath: '/book',
  },
  '/vacation-rentals': {
    title: 'Orlando Vacation Rental Near Theme Parks | Iris & J Holdings',
    description: 'Check availability and book an Orlando vacation rental in Central Florida near major theme parks with secure checkout, amenities, FAQs, and booking questions.',
    image: 'https://www.irisjholdings.com/images/site/vacation-hero.jpg',
    breadcrumb: 'Vacation Rentals',
  },
  '/refund-cancellation-policy': {
    title: 'Refund and Cancellation Policy | Iris & J Holdings',
    description: 'Refund, cancellation, rescheduling, and no-show policy for Iris & J Holdings mobile notary booking fees and Orlando vacation rental bookings.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Refund and Cancellation Policy',
  },
  '/privacy': {
    title: 'Privacy Policy | Iris & J Holdings',
    description: 'Privacy Policy for Iris & J Holdings, including website forms, contact requests, mobile notary appointment requests, home value requests, and vacation rental inquiries.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms of Use | Iris & J Holdings',
    description: 'Terms of Use for Iris & J Holdings, including real estate service disclosures, mobile notary notices, vacation rental terms, and website use rules.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Terms of Use',
  },
  '/accessibility': {
    title: 'Accessibility and Fair Housing | Iris & J Holdings',
    description: 'Accessibility statement and fair housing commitment for Iris & J Holdings and real estate services provided through All Star Real Estate Agency in New Jersey.',
    image: 'https://www.irisjholdings.com/images/site/contact-hero.jpg',
    breadcrumb: 'Accessibility and Fair Housing',
  },
  '/house-rules': {
    title: 'Vacation Rental House Rules | Iris & J Holdings',
    description: 'House rules for Orlando vacation rental bookings through Iris & J Holdings, including occupancy, parking, quiet hours, and guest list requirements.',
    image: 'https://www.irisjholdings.com/images/site/vacation-hero.jpg',
    breadcrumb: 'House Rules',
  },
};

function pageTypeForPath(pathname) {
  if (pathname === '/about') return 'AboutPage';
  if (pathname === '/book' || pathname === '/contact') return 'ContactPage';
  if (pathname === '/resources') return 'CollectionPage';
  return 'WebPage';
}

function canonicalPathForSeo(pathname) {
  const route = publicSeoRoutes[pathname];
  return route?.canonicalPath || pathname;
}

function breadcrumbSchema(pathname, label, siteUrl) {
  if (pathname === '/') return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: label,
        item: `${siteUrl}${canonicalPathForSeo(pathname)}`,
      },
    ],
  };
}

function faqSchema(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };
}

function serviceSchema(pathname, siteUrl) {
  if (pathname === '/buy') {
    return { '@type': 'Service', name: 'New Jersey Buyer Consultation', serviceType: 'Real estate buyer consultation', areaServed: 'New Jersey', provider: { '@id': `${siteUrl}/#organization` } };
  }
  if (pathname === '/sell') {
    return { '@type': 'Service', name: 'New Jersey Seller Strategy', serviceType: 'Real estate seller consultation', areaServed: 'New Jersey', provider: { '@id': `${siteUrl}/#organization` } };
  }
  if (pathname === '/home-value') {
    return { '@type': 'Service', name: 'New Jersey Home Value Review', serviceType: 'Home value estimate and comparative market review', areaServed: 'New Jersey', provider: { '@id': `${siteUrl}/#organization` } };
  }
  if (pathname === '/mobile-notary') {
    return { '@type': 'Service', name: 'Mobile Notary Service', serviceType: 'Mobile notary', areaServed: ['Union County, NJ', 'Middlesex County, NJ', 'Essex County, NJ'], provider: { '@id': `${siteUrl}/#organization` } };
  }
  if (pathname === '/vacation-rentals') {
    return { '@type': 'Service', name: 'Orlando Vacation Rental Booking', serviceType: 'Vacation rental accommodations', areaServed: 'Orlando, FL', provider: { '@id': `${siteUrl}/#organization` } };
  }
  return null;
}

function baseStructuredData(siteUrl) {
  return [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'Iris & J Holdings',
      url: `${siteUrl}/`,
      description: 'New Jersey real estate guidance, mobile notary appointments, and Orlando vacation rental booking.',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Iris & J Holdings',
      url: `${siteUrl}/`,
      telephone: '+1-908-499-6320',
      email: 'listingsbyd@gmail.com',
      image: `${siteUrl}/images/site/daiana-portrait.jpg`,
      description: 'Marketing site for New Jersey real estate services provided by Daiana Castro through All Star Real Estate Agency, plus mobile notary services and Orlando vacation rentals through Iris & J Holdings.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1416B Morris Ave',
        addressLocality: 'Union',
        addressRegion: 'NJ',
        postalCode: '07083',
        addressCountry: 'US',
      },
      areaServed: ['New Jersey', 'Union County, NJ', 'Middlesex County, NJ', 'Essex County, NJ', 'Orlando, FL'],
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#daiana-castro`,
      name: 'Daiana Castro',
      jobTitle: 'REALTOR and Mobile Notary',
      telephone: '+1-908-499-6320',
      email: 'listingsbyd@gmail.com',
      image: `${siteUrl}/images/site/daiana-portrait.jpg`,
      worksFor: {
        '@type': 'RealEstateAgent',
        name: 'All Star Real Estate Agency',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1416B Morris Ave',
          addressLocality: 'Union',
          addressRegion: 'NJ',
          postalCode: '07083',
          addressCountry: 'US',
        },
        telephone: '+1-908-964-5005',
      },
    },
  ];
}

function structuredDataForPath(pathname, seo, siteUrl) {
  const graph = baseStructuredData(siteUrl);
  graph.push({
    '@type': pageTypeForPath(pathname),
    '@id': `${siteUrl}${canonicalPathForSeo(pathname)}#webpage`,
    url: `${siteUrl}${canonicalPathForSeo(pathname)}`,
    name: seo.title,
    description: seo.description,
    isPartOf: { '@id': `${siteUrl}/#website` },
    about: { '@id': `${siteUrl}/#organization` },
    primaryImageOfPage: seo.image,
  });

  const breadcrumb = breadcrumbSchema(pathname, seo.breadcrumb || 'Page', siteUrl);
  if (breadcrumb) graph.push(breadcrumb);

  const service = serviceSchema(pathname, siteUrl);
  if (service) graph.push(service);

  if (pathname === '/mobile-notary') {
    graph.push(faqSchema(notaryFaqSeo));
  } else if (pathname === '/vacation-rentals') {
    graph.push(faqSchema(vacationFaqSeo));
  } else if (pathname === '/about') {
    graph.push({
      '@type': 'ProfilePage',
      mainEntity: { '@id': `${siteUrl}/#daiana-castro` },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function createServerSeoForPath({ defaultSeoImage, siteUrl }) {
  return function serverSeoForPath(pathname) {
    const normalized = normalizedSeoPath(pathname);
    if (normalized.startsWith('/admin') || normalized === '/booking-success' || normalized === '/notary-success' || normalized === '/invoice-success' || normalized === '/manage-booking' || normalized === '/vacation-rental-intake') {
      return {
        title: 'Iris & J Holdings',
        description: 'Iris & J Holdings',
        image: defaultSeoImage,
        robots: 'noindex,nofollow',
        canonicalPath: normalized,
        breadcrumb: 'Page',
      };
    }

    if (!publicSeoRoutes[normalized]) {
      return {
        title: 'Page Not Found | Iris & J Holdings',
        description: 'The requested page could not be found on Iris & J Holdings.',
        image: defaultSeoImage,
        robots: 'noindex,nofollow',
        canonicalPath: normalized,
        breadcrumb: 'Page Not Found',
      };
    }

    return {
      ...publicSeoRoutes[normalized],
      robots: 'index,follow',
      canonicalPath: canonicalPathForSeo(normalized),
    };
  };
}

export function registerSeoRoutes(app, options) {
  const { __dirname, defaultSeoImage, distDir, ensureAdminTables, pgPool, siteUrl } = options;
  let cachedSeoShell = null;
  const serverSeoForPath = createServerSeoForPath({ defaultSeoImage, siteUrl });

  async function readSeoShell() {
    if (cachedSeoShell) return cachedSeoShell;
    cachedSeoShell = await fs.readFile(path.join(__dirname, distDir, 'index.html'), 'utf8');
    return cachedSeoShell;
  }

  async function renderSeoShell(pathname) {
    const template = await readSeoShell();
    const seo = serverSeoForPath(pathname);
    const structuredData = structuredDataForPath(normalizedSeoPath(pathname), seo, siteUrl);
    const canonicalUrl = `${siteUrl}${seo.canonicalPath || '/'}`;

    return template
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
      .replace(/<meta(?=[^>]*name="description")[^>]*>/i, `<meta name="description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta(?=[^>]*name="robots")[^>]*>/i, `<meta name="robots" content="${escapeHtml(seo.robots)}" />`)
      .replace(/<link(?=[^>]*rel="canonical")[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`)
      .replace(/<meta(?=[^>]*property="og:title")[^>]*>/i, `<meta property="og:title" content="${escapeHtml(seo.title)}" />`)
      .replace(/<meta(?=[^>]*property="og:description")[^>]*>/i, `<meta property="og:description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta(?=[^>]*property="og:url")[^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`)
      .replace(/<meta(?=[^>]*property="og:image")[^>]*>/i, `<meta property="og:image" content="${escapeHtml(seo.image || defaultSeoImage)}" />`)
      .replace(/<meta(?=[^>]*name="twitter:title")[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`)
      .replace(/<meta(?=[^>]*name="twitter:description")[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta(?=[^>]*name="twitter:image")[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(seo.image || defaultSeoImage)}" />`)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">${escapeJsonForHtml(structuredData)}</script>`);
  }

  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (_req, res) => {
    const lastmod = new Date().toISOString().slice(0, 10);
    const indexedRoutes = Object.keys(publicSeoRoutes).filter((route) => route !== '/contact');
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...indexedRoutes.map((route) => `  <url><loc>${siteUrl}${route === '/' ? '/' : route}</loc><lastmod>${lastmod}</lastmod></url>`),
      '</urlset>',
    ].join('\n');
    res.type('application/xml').send(xml);
  });

  app.get('/uploads/:storageKey', async (req, res, next) => {
    try {
      if (!pgPool) return next();
      await ensureAdminTables();
      const storageKey = req.params.storageKey?.trim();
      if (!storageKey) return next();
      const result = await pgPool.query(
        `SELECT mime_type, original_name, file_data
         FROM uploaded_media
         WHERE storage_key = $1
         LIMIT 1`,
        [storageKey],
      );
      const media = result.rows[0];
      if (!media?.file_data) return next();
      if (media.original_name) {
        res.setHeader('Content-Disposition', `inline; filename="${String(media.original_name).replace(/"/g, '')}"`);
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.type(String(media.mime_type || '').trim() || 'application/octet-stream');
      return res.send(media.file_data);
    } catch (error) {
      console.error('Uploaded media fetch failed:', error);
      return res.status(500).end();
    }
  });

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use(express.static(path.join(__dirname, distDir)));

  app.get('*', async (req, res) => {
    try {
      const html = await renderSeoShell(req.path);
      res.type('html').send(html);
    } catch (error) {
      console.error('SEO shell render failed:', error);
      res.sendFile(path.join(__dirname, distDir, 'index.html'));
    }
  });
}
