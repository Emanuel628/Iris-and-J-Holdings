import { useEffect } from 'react';

const BASE_TITLE = 'Iris & J Holdings';
const DEFAULT_TITLE = 'Iris & J Holdings | New Jersey Real Estate, Mobile Notary & Orlando Rentals';
const SITE_URL = 'https://www.irisjholdings.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

const ROUTE_META: Record<string, { title?: string; description?: string; robots?: string }> = {
  '/': {
    description:
      'Iris & J Holdings helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex, and Essex Counties, and provides Orlando vacation rental booking.',
  },
  '/buy': {
    title: 'Buy a Home in New Jersey',
    description:
      'Buyer consultation and home search guidance in New Jersey, including budget review, pre-approval, offers, inspections, attorney review, and closing next steps.',
  },
  '/sell': {
    title: 'Sell Your Home in New Jersey',
    description:
      'Seller strategy guidance in New Jersey for pricing, preparation, marketing, negotiation, attorney review, and closing through All Star Real Estate Agency.',
  },
  '/home-value': {
    title: 'New Jersey Home Value Review',
    description:
      'Request a New Jersey home value review using recent comparable sales, nearby listings, condition, updates, and local market activity. Not a formal appraisal.',
  },
  '/mobile-notary': {
    title: 'Mobile Notary in Union, Middlesex & Essex Counties',
    description:
      'Mobile notary appointments for Union County, Middlesex County, and Essex County, NJ, including general notarizations, real estate documents, affidavits, and consent forms.',
  },
  '/resources': {
    title: 'Real Estate Resources for NJ Buyers & Sellers',
    description:
      'Plain-language New Jersey buyer guides, seller guides, and local market updates for people preparing to buy, sell, or request a home value review.',
  },
  '/about': {
    title: 'About Daiana Castro, REALTOR®',
    description:
      'Meet Daiana Castro, REALTOR® and mobile notary serving New Jersey buyers, sellers, and notary clients through Iris & J Holdings and All Star Real Estate Agency.',
  },
  '/book': {
    title: 'Book a Consultation or Notary Appointment',
    description:
      'Contact Daiana Castro to schedule a New Jersey buyer consultation, seller strategy call, home value review, mobile notary appointment, or general question.',
  },
  '/contact': {
    title: 'Book a Consultation or Notary Appointment',
    description:
      'Contact Daiana Castro to schedule a New Jersey buyer consultation, seller strategy call, home value review, mobile notary appointment, or general question.',
  },
  '/vacation-rentals': {
    title: 'Orlando Vacation Rental Near Theme Parks',
    description:
      'Check availability and book an Orlando vacation rental in Central Florida near major theme parks with secure checkout, amenities, FAQs, and booking questions.',
  },
  '/booking-success': {
    title: 'Booking Status',
    description: 'Your Orlando vacation rental booking status.',
    robots: 'noindex,nofollow',
  },
  '/notary-success': {
    title: 'Notary Booking Fee Received',
    description: 'Your mobile notary booking fee was received.',
    robots: 'noindex,nofollow',
  },
  '/refund-cancellation-policy': {
    title: 'Refund & Cancellation Policy',
    description:
      'Refund, cancellation, rescheduling, and no-show policy for Iris & J Holdings mobile notary booking fees and Orlando vacation rental bookings.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description:
      'Privacy Policy for Iris & J Holdings, including website forms, contact requests, mobile notary appointment requests, home value requests, and vacation rental inquiries.',
  },
  '/terms': {
    title: 'Terms of Use',
    description:
      'Terms of Use for Iris & J Holdings, including real estate service disclosures, mobile notary notices, vacation rental terms, and website use rules.',
  },
  '/accessibility': {
    title: 'Accessibility & Fair Housing',
    description:
      'Accessibility statement and fair housing commitment for Iris & J Holdings and real estate services provided through All Star Real Estate Agency in New Jersey.',
  },
};

type PageMetaOptions = {
  robots?: string;
  image?: string;
  type?: string;
};

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function normalizedCurrentPath() {
  if (window.location.pathname === '/') return '/';
  return window.location.pathname.replace(/\/$/, '');
}

function canonicalUrlForCurrentPath(pathname: string) {
  return `${SITE_URL}${pathname}`;
}

/**
 * Sets per-page title, description, canonical URL, robots, and social preview tags.
 * This is a single-page app, so each route updates the document head on mount.
 */
export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const image = options.image ?? DEFAULT_IMAGE;
  const type = options.type ?? 'website';

  useEffect(() => {
    const pathname = normalizedCurrentPath();
    const routeMeta = ROUTE_META[pathname] ?? {};
    const effectiveTitle = routeMeta.title ?? title;
    const effectiveDescription = routeMeta.description ?? description;
    const robots = options.robots ?? routeMeta.robots ?? 'index,follow';
    const fullTitle = effectiveTitle ? `${effectiveTitle} | ${BASE_TITLE}` : DEFAULT_TITLE;
    const canonicalUrl = canonicalUrlForCurrentPath(pathname);

    document.title = fullTitle;
    setCanonical(canonicalUrl);
    setMeta('meta[name="robots"]', 'name', 'robots', robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    if (effectiveDescription) {
      setMeta('meta[name="description"]', 'name', 'description', effectiveDescription);
      setMeta('meta[property="og:description"]', 'property', 'og:description', effectiveDescription);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', effectiveDescription);
    }
  }, [title, description, options.robots, image, type]);
}
