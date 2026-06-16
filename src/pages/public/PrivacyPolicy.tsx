import PublicLayout from '../../components/layout/PublicLayout';

function PrivacyPolicy() {
  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero">
          <div className="page-hero-content">
            <p className="eyebrow">Privacy Policy</p>
            <h1>How submitted information is handled.</h1>
            <p>
              This page explains the basic privacy rules for website forms, appointment requests, resource requests,
              and contact messages.
            </p>
          </div>
          <div className="page-hero-visual" aria-label="Privacy policy visual placeholder" />
        </section>

        <section className="page-content legal-copy">
          <article>
            <h2>Information collected</h2>
            <p>
              Visitors may submit details such as name, email, phone number, property information, appointment
              information, resource interests, and message details through website forms.
            </p>
          </article>
          <article>
            <h2>How information is used</h2>
            <p>
              Submitted information is used to respond to requests, provide real estate or notary-related assistance,
              schedule conversations, and send requested updates.
            </p>
          </article>
          <article>
            <h2>No selling of submitted information</h2>
            <p>
              Information submitted through this website is not sold. Visitors may be contacted by phone, text, or
              email regarding the request they submitted.
            </p>
          </article>
        </section>
      </main>
    </PublicLayout>
  );
}

export default PrivacyPolicy;
