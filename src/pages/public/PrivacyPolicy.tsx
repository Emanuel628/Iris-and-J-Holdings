import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function PrivacyPolicy() {
  usePageMeta(
    'Privacy Policy',
    'Privacy Policy for Iris & J Holdings, including website forms, contact requests, mobile notary appointment requests, home value requests, and vacation rental inquiries.'
  );
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Privacy Policy</p>
            <h1>How submitted information is handled.</h1>
            <p>
              This page explains how information you choose to submit through contact forms, appointment
              requests, resource requests, home value requests, and vacation rental interest requests is
              delivered and used. This website does not store form submissions in a website database.
            </p>
          </div>
          <div className="page-hero-visual" aria-label="Privacy policy visual placeholder" />
        </section>

        <section className="page-content legal-copy">
          <article>
            <h2>Effective date</h2>
            <p>Effective Date: June 18, 2026.</p>
          </article>
          <article>
            <h2>Information you submit</h2>
            <p>
              You may choose to submit details such as your name, email address, phone number, property
              information, appointment information, resource interests, travel interests, and message details
              through website forms.
            </p>
          </article>
          <article>
            <h2>No website database storage</h2>
            <p>
              This website does not create user accounts and does not store form submissions in a website
              database. When you submit a form, the information is delivered to Iris &amp; J Holdings by email
              or through the website&apos;s message delivery system so we can respond to your request.
            </p>
          </article>
          <article>
            <h2>How submitted information is used</h2>
            <p>
              Submitted information is used only to respond to your request, schedule conversations or
              appointments, provide requested real estate, notary, vacation rental, or property-related
              assistance, and maintain ordinary communication about the request you submitted.
            </p>
          </article>
          <article>
            <h2>How submitted information is delivered</h2>
            <p>
              Form submissions may be processed by trusted website hosting, email, or form-delivery providers
              only so the message can be delivered to us. Those providers may process limited technical
              information as part of operating the website and delivering messages.
            </p>
          </article>
          <article>
            <h2>No selling of submitted information</h2>
            <p>
              Information submitted through this website is not sold. Submitted phone numbers, email addresses,
              and messages are not shared with third parties for their own marketing.
            </p>
          </article>
          <article>
            <h2>Calls, texts, and emails</h2>
            <p>
              By submitting contact information, you agree that Iris &amp; J Holdings and/or Daiana Castro may
              contact you by phone, text, or email regarding the request you submitted. Message and data rates
              may apply. You can ask us to stop contacting you at any time, and you can stop text messages by
              replying STOP.
            </p>
          </article>
          <article>
            <h2>Website operation and technical logs</h2>
            <p>
              The website host or related technical providers may create ordinary server logs or security logs,
              such as IP address, browser, device, pages visited, and time of visit, to operate, secure, and
              troubleshoot the website.
            </p>
          </article>
          <article>
            <h2>Your choices</h2>
            <p>
              You may contact us to ask questions about submitted information or request that we stop contacting
              you about a submitted request. Contact Daiana at{' '}
              <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a>.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default PrivacyPolicy;
