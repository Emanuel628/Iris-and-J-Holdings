import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function Accessibility() {
  usePageMeta(
    'Accessibility & Fair Housing',
    'Iris & J Holdings is committed to accessibility and to the Fair Housing Act and Equal Opportunity in housing.',
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Accessibility &amp; Fair Housing</p>
            <h1>Open and accessible to everyone.</h1>
            <p>
              We want this site, and our services, to work for everyone. This page explains our commitment to
              accessibility and to fair housing.
            </p>
          </div>
          <div className="page-hero-visual" aria-hidden="true" />
        </section>

        <section className="page-content legal-copy" id="accessibility">
          <article>
            <h2>Accessibility statement</h2>
            <p>
              Iris &amp; J Holdings is committed to making this website usable for people of all abilities. We aim
              to follow the Web Content Accessibility Guidelines (WCAG) 2.1 AA and continue to improve over time.
            </p>
            <p>
              An accessibility tool is available on every page (the accessibility button in the corner). It lets
              you increase text size, turn on high contrast, and underline links.
            </p>
          </article>
          <article>
            <h2>Need help, or found a problem?</h2>
            <p>
              If any part of this site is difficult to use, or you need information in another format, please
              contact Daiana at <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a> or{' '}
              <a href="tel:19084996320">(908) 499-6320</a>, and we will help and work to fix it.
            </p>
          </article>
        </section>

        <section className="page-content legal-copy" id="fair-housing">
          <article>
            <h2>Fair housing statement</h2>
            <p>
              Iris &amp; J Holdings and Daiana Castro, REALTOR®, are committed to the letter and spirit of the U.S.
              policy for achieving equal housing opportunity. We support and comply with the federal Fair Housing
              Act and the New Jersey Law Against Discrimination.
            </p>
            <p>
              We do not discriminate based on race, color, religion, sex, disability, familial status, national
              origin, or any other class protected by federal, state, or local law. All real estate services are
              offered through All Star Real Estate Agency on an equal opportunity basis.
            </p>
            <p>
              <img className="eho-logo" src="/equal-housing-opportunity.svg" alt="Equal Housing Opportunity" width="200" />
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default Accessibility;
