import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function TermsOfUse() {
  usePageMeta(
    'Terms of Use',
    'Website terms, service disclosures, and legal notices for Iris & J Holdings.'
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Terms of Use</p>
            <h1>Website terms and important service disclosures.</h1>
            <p>
              These terms explain how this website may be used and how real estate, mobile notary,
              and vacation rental services are presented through Iris &amp; J Holdings.
            </p>
          </div>
          <div className="page-hero-visual" aria-label="Terms of use visual placeholder" />
        </section>

        <section className="page-content legal-copy">
          <article>
            <h2>Effective date</h2>
            <p>Effective Date: June 18, 2026.</p>
          </article>
          <article>
            <h2>Acceptance and website use</h2>
            <p>
              By using this website or submitting a request, you agree to these Terms of Use. If you do not
              agree, please do not use this website. The website is provided for general informational use,
              service inquiries, appointment requests, and vacation rental booking or interest requests.
            </p>
          </article>
          <article>
            <h2>Who operates this website</h2>
            <p>
              This website is operated for Iris &amp; J Holdings. Real estate services are provided by Daiana
              Castro, REALTOR®, Licensed NJ Real Estate Salesperson, through All Star Real Estate Agency, a
              licensed New Jersey real estate brokerage. Iris &amp; J Holdings is not a licensed real estate
              brokerage.
            </p>
          </article>
          <article>
            <h2>No client relationship through the website</h2>
            <p>
              Viewing this website, submitting a form, requesting information, or scheduling a conversation does
              not create a real estate agency relationship, brokerage agreement, attorney-client relationship,
              fiduciary relationship, or notary-client relationship. Real estate representation begins only when
              confirmed through the required written brokerage agreement with the licensed brokerage.
            </p>
          </article>
          <article>
            <h2>Real estate information</h2>
            <p>
              Website content about buying, selling, market activity, property values, resources, neighborhoods,
              or available services is general information only. Property availability, pricing, taxes, fees,
              school, zoning, association, condition, financing, and other details may change and should be
              independently verified before making a decision.
            </p>
          </article>
          <article>
            <h2>Home value reviews</h2>
            <p>
              Home value reviews are informal estimates based on available market information and information
              you choose to provide. They are not appraisals, broker price opinions for lending purposes,
              guarantees of sale price, or legal, tax, financial, or appraisal advice. Visitors should consult
              the appropriate licensed professional for those services.
            </p>
          </article>
          <article>
            <h2>Fair housing and equal opportunity</h2>
            <p>
              Real estate services are offered without unlawful discrimination and in accordance with applicable
              fair housing laws. This website may not be used to request or encourage housing preferences,
              limitations, steering, or discrimination based on race, color, religion, sex, disability or
              handicap, familial status, national origin, or any other protected category under applicable law.
            </p>
          </article>
          <article>
            <h2>Mobile notary services</h2>
            <p>
              Mobile notary services are provided independently through Iris &amp; J Holdings and are not real
              estate brokerage services. A notary public verifies identity, witnesses signatures, and performs
              authorized notarial acts; a notary does not provide legal advice, prepare legal documents, or
              explain the legal effect of a document. Every signer must be present, willing to sign, aware of
              what is being signed, and able to provide valid, unexpired government-issued photo identification.
              Travel, booking, and notary fees are confirmed before the appointment. A notarial act may be
              declined if legal or identification requirements cannot be satisfied.
            </p>
          </article>
          <article>
            <h2>Vacation rentals</h2>
            <p>
              Orlando vacation rental accommodations are offered independently through Iris &amp; J Holdings and
              are not provided through All Star Real Estate Agency. Vacation rental accommodations do not
              constitute real estate brokerage services. Availability, rates, fees, amenities, photos, house
              rules, check-in details, cancellation terms, and refund terms may change until confirmed. A stay
              is not confirmed until payment is completed and a booking confirmation is issued.
            </p>
          </article>
          <article>
            <h2>Payments and third-party checkout</h2>
            <p>
              When online checkout is available, payment is processed through a third-party payment provider
              such as Stripe. By using checkout, you may also be subject to that provider&apos;s terms and privacy
              practices. Iris &amp; J Holdings is not responsible for interruptions, errors, or policies of third-party
              payment, hosting, email, calendar, availability, or form-delivery providers.
            </p>
          </article>
          <article>
            <h2>Submitted requests and communications</h2>
            <p>
              You agree to submit accurate information and not use the website to send spam, unlawful content,
              abusive messages, or false requests. By submitting contact information, you authorize Iris &amp; J
              Holdings and/or Daiana Castro to contact you about the request you submitted. The Privacy Policy
              explains how submitted information is handled.
            </p>
          </article>
          <article>
            <h2>Website content</h2>
            <p>
              The text, layout, branding, graphics, and other website content are provided for Iris &amp; J Holdings
              unless otherwise stated. You may view and share website links for personal, non-commercial use, but
              you may not copy, reuse, scrape, sell, or misrepresent website content without permission.
            </p>
          </article>
          <article>
            <h2>No guarantees</h2>
            <p>
              The website is provided as available. Iris &amp; J Holdings tries to keep information clear and current,
              but does not guarantee that website content, availability calendars, pricing, service descriptions,
              or third-party links will always be complete, current, secure, uninterrupted, or error-free.
            </p>
          </article>
          <article>
            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent allowed by law, Iris &amp; J Holdings is not liable for indirect, incidental,
              consequential, special, or punitive damages arising from use of this website, reliance on website
              content, third-party service interruptions, or inability to access the website. Nothing in these
              terms limits rights or responsibilities that cannot legally be limited.
            </p>
          </article>
          <article>
            <h2>Updates to these terms</h2>
            <p>
              These terms may be updated from time to time. The effective date above will be revised when the
              terms are materially updated. Continued use of the website after an update means you accept the
              updated terms.
            </p>
          </article>
          <article>
            <h2>Contact</h2>
            <p>
              Questions about these terms can be sent to <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a>{' '}
              or by calling <a href="tel:19084996320">(908) 499-6320</a>. Brokerage office: All Star Real Estate
              Agency, 1416B Morris Ave, Union, NJ 07083, <a href="tel:19089645005">(908) 964-5005</a>.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default TermsOfUse;
