import { useEffect, useState } from 'react';

export type SiteContentField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
};

export type SiteContentTemplate = {
  pageKey: string;
  pageLabel: string;
  route: string;
  category: 'content' | 'policy' | 'chrome' | 'system';
  title: string;
  heroImageUrl?: string;
  fields: SiteContentField[];
  defaults: Record<string, string>;
};

export const siteContentTemplates: SiteContentTemplate[] = [
  {
    pageKey: 'home',
    pageLabel: 'Home',
    route: '/',
    category: 'content',
    title: 'Home',
    heroImageUrl: '/images/site/home-hero.svg',
    fields: [
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'primaryCtaLabel', label: 'Primary CTA Label' },
      { key: 'secondaryCtaLabel', label: 'Secondary CTA Label' },
    ],
    defaults: {
      heroTitle: 'Your Next Move, Made Clear.',
      heroDescription:
        'Buying, selling, or signing important documents can feel like a lot. Iâ€™ll help you understand the next step, make a plan, and move forward with confidence â€” real estate throughout New Jersey, mobile notary service, and Orlando vacation rentals.',
      primaryCtaLabel: 'Find the Right Service',
      secondaryCtaLabel: 'Book a Call',
    },
  },
  {
    pageKey: 'buy',
    pageLabel: 'Buy',
    route: '/buy',
    category: 'content',
    title: 'Buy',
    heroImageUrl: '/images/site/buy-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'introEyebrow', label: 'Intro Eyebrow' },
      { key: 'introTitle', label: 'Intro Title', type: 'textarea' },
      { key: 'introDescription', label: 'Intro Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Buyer Guidance',
      heroTitle: 'Buying a home starts with a clear plan.',
      heroDescription:
        'Whether this is your first home or your next move, Daiana helps you understand your budget, narrow your search, prepare with confidence, and know what to expect before closing.',
      introEyebrow: 'What to expect',
      introTitle: 'Get your bearings before you start touring.',
      introDescription:
        'Start with a no-pressure conversation about your budget and pre-approval, the neighborhoods and home types that fit, and how New Jerseyâ€™s process works â€” from making an offer and attorney review to inspections and the closing timeline.',
    },
  },
  {
    pageKey: 'sell',
    pageLabel: 'Sell',
    route: '/sell',
    category: 'content',
    title: 'Sell',
    heroImageUrl: '/images/site/sell-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'intakeEyebrow', label: 'Intake Eyebrow' },
      { key: 'intakeTitle', label: 'Intake Title', type: 'textarea' },
      { key: 'intakeDescription', label: 'Intake Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Seller Strategy',
      heroTitle: 'Selling your home takes more than a listing.',
      heroDescription:
        'Pricing, preparation, timing, and presentation all matter. Daiana helps homeowners understand the market and move forward with a clear plan.',
      intakeEyebrow: 'Seller intake',
      intakeTitle: 'Start with the details that shape the strategy.',
      intakeDescription: 'Share the property, timing, and any questions so Daiana can respond with a clearer next step.',
    },
  },
  {
    pageKey: 'home-value',
    pageLabel: 'Home Value',
    route: '/home-value',
    category: 'content',
    title: 'Home Value',
    heroImageUrl: '/images/site/home-value-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'introEyebrow', label: 'Intro Eyebrow' },
      { key: 'introTitle', label: 'Intro Title', type: 'textarea' },
      { key: 'introDescription', label: 'Intro Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Home Value Review',
      heroTitle: 'Find out what your home may be worth.',
      heroDescription:
        'Share a few property details and Daiana will review local market activity to help you understand your options. This is a helpful starting point, not a formal appraisal.',
      introEyebrow: 'Property details',
      introTitle: 'A few details to get started.',
      introDescription:
        'Daiana reviews recent comparable sales, current nearby listings, and your homeâ€™s condition and updates, then follows up by email with a price range and the reasoning behind it. Thereâ€™s no cost and no obligation.',
    },
  },
  {
    pageKey: 'mobile-notary',
    pageLabel: 'Mobile Notary',
    route: '/mobile-notary',
    category: 'content',
    title: 'Mobile Notary',
    heroImageUrl: '/images/site/notary-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'bookingEyebrow', label: 'Booking Eyebrow' },
      { key: 'bookingTitle', label: 'Booking Title', type: 'textarea' },
      { key: 'bookingDescription', label: 'Booking Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Mobile Notary',
      heroTitle: 'Mobile notary service, by appointment.',
      heroDescription:
        'Mobile notary help is available by appointment, primarily in Union, Middlesex, and Essex Counties, with additional areas available by request.',
      bookingEyebrow: 'Request an appointment',
      bookingTitle: 'Pick a date and time.',
      bookingDescription:
        'Choose your preferred date and time, then pay the travel / booking fee to send the request. Daiana will confirm the appointment time, service area, document type, signer requirements, and any separate notary fees by email.',
    },
  },
  {
    pageKey: 'vacation-rentals',
    pageLabel: 'Vacation Rentals',
    route: '/vacation-rentals',
    category: 'content',
    title: 'Vacation Rentals',
    heroImageUrl: '/images/site/vacation-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'availabilityEyebrow', label: 'Availability Eyebrow' },
      { key: 'availabilityTitle', label: 'Availability Title', type: 'textarea' },
      { key: 'availabilityDescription', label: 'Availability Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Vacation Rentals',
      heroTitle: 'Book your Orlando vacation stay.',
      heroDescription:
        'Check the calendar for open dates in Orlando and Central Florida, then reserve with secure checkout. Prefer to ask first? Send Daiana a question and sheâ€™ll follow up by email.',
      availabilityEyebrow: 'Availability',
      availabilityTitle: 'Available dates for the rental.',
      availabilityDescription:
        'Open dates are available to book; grayed-out dates are already taken. Pick your check-in and check-out here, then continue to a separate intake page for guest details, house rules, and checkout.',
    },
  },
  {
    pageKey: 'about',
    pageLabel: 'About',
    route: '/about',
    category: 'content',
    title: 'About',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'About Daiana',
      heroTitle: 'Real estate and notary help that keeps things simple.',
      heroDescription:
        'Daiana Castro, REALTORÂ®, provides real estate services throughout New Jersey through All Star Real Estate Agency. She also offers mobile notary services and independently manages Orlando vacation rental accommodations through Iris & J Holdings.',
    },
  },
  {
    pageKey: 'resources',
    pageLabel: 'Resources',
    route: '/resources',
    category: 'content',
    title: 'Resources',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Resources',
      heroTitle: 'Helpful info before youâ€™re ready to reach out.',
      heroDescription:
        'Not everyone is ready for a call right away. Start with a buyer guide, seller guide, or local market update and come back when the timing feels right.',
    },
  },
  {
    pageKey: 'book',
    pageLabel: 'Book / Contact',
    route: '/book',
    category: 'content',
    title: 'Book or Contact',
    heroImageUrl: '/images/site/contact-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Book or Contact',
      heroTitle: 'Tell Daiana what you need.',
      heroDescription:
        'Tell Daiana what you need and sheâ€™ll point you to the right next step â€” a buyer consultation, seller strategy call, mobile notary appointment, or a general question. Sheâ€™ll follow up by email.',
    },
  },
  {
    pageKey: 'header',
    pageLabel: 'Header',
    route: 'Site chrome',
    category: 'chrome',
    title: 'Header',
    fields: [
      { key: 'brandLine', label: 'Brand Line' },
      { key: 'ctaLabel', label: 'CTA Label' },
      { key: 'buyLabel', label: 'Buy Label' },
      { key: 'sellLabel', label: 'Sell Label' },
      { key: 'notaryLabel', label: 'Notary Label' },
      { key: 'vacationLabel', label: 'Vacation Label' },
      { key: 'aboutLabel', label: 'About Label' },
    ],
    defaults: {
      brandLine: 'Brokered by All Star Real Estate Agency',
      ctaLabel: 'Book a Call',
      buyLabel: 'Buy',
      sellLabel: 'Sell',
      notaryLabel: 'Notary',
      vacationLabel: 'Vacation Rentals',
      aboutLabel: 'About',
    },
  },
  {
    pageKey: 'footer',
    pageLabel: 'Footer',
    route: 'Site chrome',
    category: 'chrome',
    title: 'Footer',
    fields: [
      { key: 'brokerageTitle', label: 'Brokerage Title' },
      { key: 'brokerageBody', label: 'Brokerage Body', type: 'textarea' },
      { key: 'brokerageOffice', label: 'Brokerage Office' },
      { key: 'contactTitle', label: 'Contact Title' },
      { key: 'contactName', label: 'Contact Name' },
      { key: 'contactRole', label: 'Contact Role' },
      { key: 'contactLicense', label: 'Contact License' },
      { key: 'contactPhone', label: 'Contact Phone' },
      { key: 'contactEmail', label: 'Contact Email' },
      { key: 'contactLocation', label: 'Contact Location' },
      { key: 'aboutTitle', label: 'About Title' },
      { key: 'aboutBody', label: 'About Body', type: 'textarea' },
      { key: 'aboutLinkLabel', label: 'About Link Label' },
      { key: 'copyright', label: 'Copyright' },
    ],
    defaults: {
      brokerageTitle: 'Brokerage',
      brokerageBody:
        'Real estate services are provided by Daiana Castro, REALTORÂ®, Licensed NJ Real Estate Salesperson, through All Star Real Estate Agency, a licensed New Jersey real estate brokerage. 1416B Morris Ave, Union, NJ 07083.',
      brokerageOffice: 'Brokerage office: (908) 964-5005',
      contactTitle: 'Contact',
      contactName: 'Daiana Castro, REALTORÂ®',
      contactRole: 'Licensed NJ Real Estate Salesperson',
      contactLicense: 'NJ Real Estate License #2190570',
      contactPhone: 'Mobile: (908) 499-6320',
      contactEmail: 'listingsbyd@gmail.com',
      contactLocation: 'Union, Middlesex & Essex Counties, NJ',
      aboutTitle: 'About',
      aboutBody: 'Real estate through All Star Real Estate Agency. Mobile notary and vacation rental services through Iris & J Holdings.',
      aboutLinkLabel: 'About Daiana',
      copyright: '© 2026 Iris & J Holdings. All rights reserved.',
    },
  },
  {
    pageKey: 'terms',
    pageLabel: 'Terms of Use',
    route: '/terms',
    category: 'policy',
    title: 'Terms of Use',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'bodyHtml', label: 'Body HTML', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Terms of Use',
      heroTitle: 'Website terms and important service disclosures.',
      heroDescription: 'These terms explain how this website may be used and how real estate, mobile notary, and vacation rental services are presented through Iris & J Holdings.',
      bodyHtml: '',
    },
  },
  {
    pageKey: 'privacy',
    pageLabel: 'Privacy Policy',
    route: '/privacy',
    category: 'policy',
    title: 'Privacy Policy',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'bodyHtml', label: 'Body HTML', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Privacy Policy',
      heroTitle: 'How submitted information is handled.',
      heroDescription: 'This page explains how information you choose to submit through contact forms, appointment requests, resource requests, home value requests, and vacation rental interest requests is delivered and used. This website does not store form submissions in a website database.',
      bodyHtml: '',
    },
  },
  {
    pageKey: 'accessibility',
    pageLabel: 'Accessibility & Fair Housing',
    route: '/accessibility',
    category: 'policy',
    title: 'Accessibility & Fair Housing',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'bodyHtml', label: 'Body HTML', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Accessibility & Fair Housing',
      heroTitle: 'Open, accessible, and equal opportunity.',
      heroDescription: 'We want this website and the services presented here to be clear, usable, and available on an equal opportunity basis. This page explains our accessibility efforts and fair housing commitment.',
      bodyHtml: '',
    },
  },
  {
    pageKey: 'refund-cancellation-policy',
    pageLabel: 'Refund & Cancellation Policy',
    route: '/refund-cancellation-policy',
    category: 'policy',
    title: 'Refund & Cancellation Policy',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'bodyHtml', label: 'Body HTML', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Refund & Cancellation Policy',
      heroTitle: 'Clear terms before you pay.',
      heroDescription: 'This policy explains how refunds, cancellations, rescheduling, and no-shows are handled for mobile notary booking / travel fees and Orlando vacation rental bookings through Iris & J Holdings.',
      bodyHtml: '',
    },
  },
  {
    pageKey: 'house-rules',
    pageLabel: 'House Rules',
    route: '/house-rules',
    category: 'policy',
    title: 'House Rules',
    heroImageUrl: '/images/site/vacation-hero.jpg',
    fields: [
      { key: 'heroEyebrow', label: 'Hero Eyebrow' },
      { key: 'heroTitle', label: 'Hero Title', type: 'textarea' },
      { key: 'heroDescription', label: 'Hero Description', type: 'textarea' },
      { key: 'bodyHtml', label: 'Body HTML', type: 'textarea' },
    ],
    defaults: {
      heroEyebrow: 'Vacation Rentals',
      heroTitle: 'House rules for the Orlando stay.',
      heroDescription: '',
      bodyHtml: '',
    },
  },
  { pageKey: 'contact', pageLabel: 'Contact Alias', route: '/contact', category: 'system', title: 'Contact Alias', fields: [], defaults: {} },
  { pageKey: 'booking-success', pageLabel: 'Booking Success', route: '/booking-success', category: 'system', title: 'Booking Success', fields: [], defaults: {} },
  { pageKey: 'notary-success', pageLabel: 'Notary Success', route: '/notary-success', category: 'system', title: 'Notary Success', fields: [], defaults: {} },
  { pageKey: 'manage-booking', pageLabel: 'Manage Booking', route: '/manage-booking', category: 'system', title: 'Manage Booking', fields: [], defaults: {} },
  { pageKey: 'vacation-rental-intake', pageLabel: 'Vacation Rental Intake', route: '/vacation-rental-intake', category: 'system', title: 'Vacation Rental Intake', fields: [], defaults: {} },
];

export function getSiteContentTemplate(pageKey: string) {
  return siteContentTemplates.find((template) => template.pageKey === pageKey);
}

export function parseSiteContentBody(body: string | null | undefined, defaults: Record<string, string>) {
  if (!body) return defaults;
  try {
    const parsed = JSON.parse(body) as Record<string, string>;
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function stringifySiteContentBody(values: Record<string, string>) {
  return JSON.stringify(values);
}

export function usePublicSiteContent(pageKey: string, defaults: Record<string, string>) {
  const [content, setContent] = useState(defaults);
  const [heroImageUrl, setHeroImageUrl] = useState('');

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`/api/site-content-public?pageKey=${encodeURIComponent(pageKey)}`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const payload = (await res.json()) as { entry?: { body?: string; hero_image_url?: string } };
        if (!alive || !payload.entry) return;
        setContent(parseSiteContentBody(payload.entry.body, defaults));
        setHeroImageUrl(payload.entry.hero_image_url || '');
      } catch {
        // Keep defaults when public content has not been configured yet.
      }
    }

    setContent(defaults);
    setHeroImageUrl('');
    load();
    return () => {
      alive = false;
    };
  }, [pageKey]);

  return { content, heroImageUrl };
}

