import { useEffect } from 'react';

const BASE_TITLE = 'Iris & J Holdings';
const DEFAULT_TITLE = 'Iris & J Holdings | New Jersey Real Estate, Mobile Notary & Orlando Rentals';
const SITE_URL = 'https://www.irisjholdings.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;

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

function canonicalUrlForCurrentPath() {
  const pathname = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '');
  return `${SITE_URL}${pathname}`;
}

/**
 * Sets per-page title, description, canonical URL, robots, and social preview tags.
 * This is a single-page app, so each route updates the document head on mount.
 */
export function usePageMeta(title: string, description?: string, options: PageMetaOptions = {}) {
  const robots = options.robots ?? 'index,follow';
  const image = options.image ?? DEFAULT_IMAGE;
  const type = options.type ?? 'website';

  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : DEFAULT_TITLE;
    const canonicalUrl = canonicalUrlForCurrentPath();

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

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }
  }, [title, description, robots, image, type]);
}
