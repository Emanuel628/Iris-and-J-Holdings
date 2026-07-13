import { useEffect } from 'react';

const BASE_TITLE = 'Iris & J Holdings';
const DEFAULT_TITLE = 'Iris & J Holdings | NJ Real Estate, Mobile Notary & Orlando Rentals';
const SITE_URL = 'https://www.irisjholdings.com';
const DEFAULT_IMAGE = `${SITE_URL}/images/site/contact-hero.jpg`;

const ROUTE_META: Record<string, { title?: string; description?: string; robots?: string; image?: string }> = {
  '/': {
    description:
      'NJ REALTOR® Daiana Castro helps New Jersey buyers and sellers, offers mobile notary appointments in Union, Middlesex & Essex Counties, and provides Orlando vacation rental booking. Call (908) 499-6320.',
    image: `${SITE_URL}/images/site/contact-hero.jpg`,
  },
  '/admin': {
    title: 'Control Center',
    description: 'Admin control center for Iris & J Holdings.',
    robots: 'noindex,nofollow',
  },
  '/admin/confirm-email-change': {
    title: 'Confirm Email Change',
    description: 'Confirm the admin email change for Iris & J Holdings.',
    robots: 'noindex,nofollow',
  },
  '/admin/login': {
    title: 'Admin Login',
    description: 'Secure admin login for Iris & J Holdings.',
    robots: 'noindex,nofollow',
  },
  '/admin/media': {
    title: 'Admin Media Library',
    description: 'Manage site and rental media routes for Iris & J Holdings.',
    robots: 'noindex,nofollow',
  },
  '/admin/notary-requests': {
    title: 'Notary Queue',
    description: 'Review paid notary booking requests.',
    robots: 'noindex,nofollow',
  },
  '/admin/realtor-tools': {
    title: 'Admin Realtor Tools',
    description: 'Manage buyer and seller intake records.',
    robots: 'noindex,nofollow',
  },
  '/admin/forgot-password': {
    title: 'Forgot Password',
    description: 'Reset the Iris & J Holdings admin password.',
    robots: 'noindex,nofollow',
  },
  '/admin/invoices': {
    title: 'Admin Invoices',
    description: 'Create and manage invoices for vacation rentals and notary appointments.',
    robots: 'noindex,nofollow',
  },
  '/admin/register': {
    title: 'Admin Register',
    description: 'Create the first admin user for Iris & J Holdings.',
    robots: 'noindex,nofollow',
  },
  '/admin/rentals': {
    title: 'Admin Rentals',
    description: 'Manage rental listings and availability controls.',
    robots: 'noindex,nofollow',
  },
  '/admin/reset-password': {
    title: 'Reset Password',
    description: 'Set a new Iris & J Holdings admin password.',
    robots: 'noindex,nofollow',
  },
  '/admin/settings': {
    title: 'Admin Settings',
    description: 'Manage admin and site settings routes.',
    robots: 'noindex,nofollow',
  },
  '/admin/site-content': {
    title: 'Admin Site Content',
    description: 'Edit public site copy and image references.',
    robots: 'noindex,nofollow',
  },
  '/admin/vacation-bookings': {
    title: 'Vacation Queue',
    description: 'Review vacation rental bookings and guest details.',
    robots: 'noindex,nofollow',
  },
  '/admin/home-value-lab': {
    title: 'Admin Home Value Lab',
    description: 'Plan the data-backed home value estimator workflow.',
    robots: 'noindex,nofollow',
  },
  '/buy': {
    title: 'Buy a Home in New Jersey',
    description:
      'Looking to buy a home in NJ? REALTOR® Daiana Castro guides buyers through budget review, pre-approval, home search, offers, inspections, and closing. Book a free consultation.',
    image: `${SITE_URL}/images/site/buy-hero.jpg`,
  },
  '/sell': {
    title: 'Sell Your Home in New Jersey',
    description:
      'Ready to sell your NJ home? Get pricing strategy, preparation guidance, and representation through All Star Real Estate Agency. Schedule your free seller strategy call today.',
    image: `${SITE_URL}/images/site/contact-hero.jpg`,
  },
  '/home-value': {
    title: 'Free NJ Home Value Review',
    description:
      'Request a free New Jersey home value review from REALTOR® Daiana Castro. Based on comparable sales, local market data, and your home\'s condition. No commitment required.',
  },
  '/mobile-notary': {
    title: 'Mobile Notary | Union, Middlesex & Essex County NJ',
    description:
      'Need a mobile notary in NJ? Daiana Castro serves Union, Middlesex & Essex Counties for general notarizations, real estate documents, affidavits, and consent forms. Book online.',
    image: `${SITE_URL}/images/site/notary-hero.jpg`,
  },
  '/resources': {
    title: 'Free Real Estate Resources for NJ Buyers & Sellers',
    description:
      'Free NJ real estate guides for buyers and sellers. Plain-language market updates, buying and selling step-by-step guides, and home value insights from REALTOR® Daiana Castro.',
  },
  '/about': {
    title: 'About Daiana Castro, REALTOR®',
    description:
      'Daiana Castro is a licensed NJ REALTOR® with All Star Real Estate Agency and mobile notary serving Union, Middlesex & Essex Counties. Learn how she works with clients.',
    image: `${SITE_URL}/images/site/daiana-portrait.jpg`,
  },
  '/book': {
    title: 'Book a Consultation or Notary Appointment',
    description:
      'Book a NJ buyer consultation, seller strategy call, free home value review, or mobile notary appointment with Daiana Castro. Contact by phone, text, or online form.',
  },
  '/contact': {
    title: 'Book a Consultation or Notary Appointment',
    description:
      'Book a NJ buyer consultation, seller strategy call, free home value review, or mobile notary appointment with Daiana Castro. Contact by phone, text, or online form.',
  },
  '/invoice-success': {
    title: 'Invoice Payment Received',
    description: 'Your Iris & J Holdings invoice payment status.',
    robots: 'noindex,nofollow',
  },
  '/vacation-rentals': {
    title: 'Orlando Vacation Rental Near Disney & Universal',
    description:
      'Book a family-friendly Orlando vacation rental in Central Florida near Disney, Universal, and major theme parks. Fully equipped home with amenities, easy online booking.',
    image: `${SITE_URL}/images/site/vacation-hero.jpg`,
  },
  '/booking-success': {
    title: 'Booking Confirmed',
    description: 'Your Orlando vacation rental booking status.',
    robots: 'noindex,nofollow',
  },
  '/notary-success': {
    title: 'Notary Booking Fee Received',
    description: 'Your mobile notary booking fee was received.',
    robots: 'noindex,nofollow',
  },
  '/manage-booking': {
    title: 'Manage Booking',
    description: 'Request a cancellation or scheduling change for an Iris & J Holdings booking.',
    robots: 'noindex,nofollow',
  },
  '/house-rules': {
    title: 'Orlando Vacation Rental House Rules',
    description:
      'House rules for Orlando vacation rental bookings through Iris & J Holdings, including occupancy limits, parking, quiet hours, and pet policy.',
  },
  '/vacation-rental-intake': {
    title: 'Vacation Rental Intake',
    description: 'Complete primary booker details and review house rules before Orlando vacation rental checkout.',
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
      'Privacy Policy for Iris & J Holdings covering website forms, contact requests, mobile notary appointments, home value requests, and vacation rental inquiries.',
  },
  '/terms': {
    title: 'Terms of Use',
    description:
      'Terms of Use for Iris & J Holdings, including real estate service disclosures, mobile notary notices, vacation rental booking terms, and website use rules.',
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
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
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

function setPageJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const existing = document.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"][data-page-schema]');
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-page-schema', '1');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function removePageJsonLd() {
  document.head.querySelector('script[type="application/ld+json"][data-page-schema]')?.remove();
}

function normalizedCurrentPath() {
  if (window.location.pathname === '/') return '/';
  return window.location.pathname.replace(/\/$/, '');
}

function canonicalUrlForCurrentPath(pathname: string) {
  if (pathname === '/contact') {
    return `${SITE_URL}/book`;
  }
  return `${SITE_URL}${pathname}`;
}

/**
 * Sets per-page title, description, canonical URL, robots, social preview tags,
 * and optional page-level JSON-LD structured data.
 */
export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const image = options.image ?? DEFAULT_IMAGE;
  const type = options.type ?? 'website';

  useEffect(() => {
    const pathname = normalizedCurrentPath();
    const routeMeta = ROUTE_META[pathname] ?? {};
    const effectiveTitle = routeMeta.title ?? title;
    const effectiveDescription = routeMeta.description ?? description;
    const effectiveImage = routeMeta.image ?? image;
    const robots = options.robots ?? routeMeta.robots ?? 'index,follow';
    const fullTitle = effectiveTitle ? `${effectiveTitle} | ${BASE_TITLE}` : DEFAULT_TITLE;
    const canonicalUrl = canonicalUrlForCurrentPath(pathname);

    document.title = fullTitle;
    setCanonical(canonicalUrl);
    setMeta('meta[name="robots"]', 'name', 'robots', robots);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:image"]', 'property', 'og:image', effectiveImage);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', effectiveImage);

    if (effectiveDescription) {
      setMeta('meta[name="description"]', 'name', 'description', effectiveDescription);
      setMeta('meta[property="og:description"]', 'property', 'og:description', effectiveDescription);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', effectiveDescription);
    }

    if (options.jsonLd) {
      setPageJsonLd(options.jsonLd);
    } else {
      removePageJsonLd();
    }
  }, [title, description, options.robots, image, type, options.jsonLd]);
}
