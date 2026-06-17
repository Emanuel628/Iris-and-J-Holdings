import PublicLayout from '../../components/layout/PublicLayout';
import { usePageMeta } from '../../lib/usePageMeta';

function PrivacyPolicy() {
  usePageMeta('Privacy Policy', 'How Iris & J Holdings collects, uses, and protects information submitted through the website.');
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Privacy Policy</p>
            <h1>How submitted information is handled.</h1>
            <p>
              This page explains how information from contact forms, appointment requests, resource requests,
              home value requests, and vacation rental interest requests may be used.
            </p>
          </div>
          <div className="page-hero-visual" aria-label="Privacy policy visual placeholder" />
        </section>

        <section className="page-content legal-copy">
          <article>
            <h2>Information collected</h2>
            <p>
              Visitors may submit details such as name, email, phone number, property information,
              appointment information, resource interests, travel interests, and message details through website forms.
            </p>
          </article>
          <article>
            <h2>How information is used</h2>
            <p>
              Submitted information is used to respond to requests, schedule conversations, provide requested
              real estate or notary-related assistance, and send requested updates.
            </p>
          </article>
          <article>
            <h2>No selling of submitted information</h2>
            <p>
              Information submitted through this website is not sold. Visitors may be contacted by phone, text, or
              email regarding the request they submitted.
            </p>
          </article>
          <article>
            <h2>How information is shared</h2>
            <p>
              Form submissions are delivered to Daiana by email, so trusted email and hosting providers process
              your message to deliver it. These providers may have their own privacy terms, and information is
              shared only to operate the site and respond to your request.
            </p>
          </article>
          <article>
            <h2>Your choices</h2>
            <p>
              You can ask what information is on file, correct it, or have it deleted at any time. Email{' '}
              <a href="mailto:listingsbyd@gmail.com">listingsbyd@gmail.com</a> or call{' '}
              <a href="tel:19084996320">(908) 499-6320</a>. To stop receiving messages, just reply and say so.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default PrivacyPolicy;
