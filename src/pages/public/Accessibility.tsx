import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function Accessibility() {
  usePageMeta(
    'Accessibility & Fair Housing',
    'Website accessibility statement and fair housing commitment for Iris & J Holdings and real estate services through All Star Real Estate Agency.',
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Accessibility &amp; Fair Housing</p>
            <h1>Open, accessible, and equal opportunity.</h1>
            <p>
              We want this website and the services presented here to be clear, usable, and available on an
              equal opportunity basis. This page explains our accessibility efforts and fair housing commitment.
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
            <p>Effective Date: June 18, 2026.</p>
            <p>
              Iris &amp; J Holdings and Daiana Castro, REALTOR®, support equal housing opportunity. Real estate
              services are provided by Daiana Castro, Licensed NJ Real Estate Salesperson, through All Star Real
              Estate Agency, a licensed New Jersey real estate brokerage. Iris &amp; J Holdings is not a licensed real
              estate brokerage.
            </p>
          </article>
          <article>
            <h2>Equal opportunity commitment</h2>
            <p>
              Real estate services are offered without unlawful discrimination and in accordance with the federal
              Fair Housing Act, the New Jersey Law Against Discrimination, and applicable local fair housing laws.
              We do not discriminate based on race, creed, color, religion, national origin, ancestry, sex, gender
              identity or expression, affectional or sexual orientation, marital status, civil union status,
              domestic partnership status, familial status, disability, source of lawful income used for rental or
              mortgage payments, liability for service in the Armed Forces, nationality, pregnancy or breastfeeding,
              or any other category protected by applicable law.
            </p>
          </article>
          <article>
            <h2>What fair housing means here</h2>
            <p>
              We do not deny, limit, discourage, misrepresent availability, change terms, steer, advertise, make
              discriminatory inquiries, blockbust, or provide different service based on a protected category. We
              also do not honor requests to include, exclude, prefer, or avoid people, neighborhoods, schools,
              buildings, or communities based on a protected category.
            </p>
          </article>
          <article>
            <h2>Property search and neighborhood information</h2>
            <p>
              Clients may ask for objective housing criteria such as price range, property type, location,
              commute, size, features, taxes, fees, and school district boundaries. We will not use protected-class
              demographics or assumptions about who lives in an area to guide, limit, or influence housing choices.
              Buyers and renters should independently review public information that matters to their decision.
            </p>
          </article>
          <article>
            <h2>Disability-related requests</h2>
            <p>
              Individuals with disabilities may request reasonable accommodations or accessibility-related help in
              connection with housing services or website use. We will respond to those requests in a respectful,
              good-faith manner and direct the request to the appropriate property owner, housing provider,
              brokerage, or other responsible party when needed.
            </p>
          </article>
          <article>
            <h2>Questions or concerns</h2>
            <p>
              If you have a fair housing question or believe something on this website should be corrected, please
              contact Daiana at <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a> or{' '}
              <a href="tel:19084996320">(908) 499-6320</a>. You may also contact All Star Real Estate Agency,
              1416B Morris Ave, Union, NJ 07083, at <a href="tel:19089645005">(908) 964-5005</a>.
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
