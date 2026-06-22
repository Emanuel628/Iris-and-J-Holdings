import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import VacationBookingCalendar from '../../components/booking/VacationBookingCalendar';
import Faq from '../../components/sections/Faq';
import FormStatus from '../../components/ui/FormStatus';
import { vacationHouseRules } from '../../content/vacationHouseRules';
import { useContactForm } from '../../lib/useContactForm';
import { getSiteContentTemplate, usePublicSiteContent } from '../../lib/siteContent';
import { usePageMeta } from '../../lib/usePageMeta';

type PublicRental = {
  id: number;
  slug: string;
  title: string;
  location_label: string;
  description: string;
  nightly_rate_cents: number;
  cleaning_fee_cents: number;
  max_guests: number;
  hero_image_url: string;
  hero_image_captions: string[];
  gallery_image_urls: string[];
  gallery_image_captions: string[];
  gallery_image_groups: string[];
  amenities: string[];
};

const fallbackPhotoSlots = [
  'Exterior photo',
  'Living room photo',
  'Kitchen photo',
  'Bedroom photo',
];

const fallbackAmenities = [
  'Fully equipped kitchen',
  'Fast Wi-Fi',
  'Free parking',
  'Washer & dryer',
  'Smart TV / streaming',
  'Self check-in',
  'Close to Orlando theme parks',
  'Linens & towels provided',
];

const orlandoFaqs = [
  {
    question: 'Where is the rental located?',
    answer:
      'In the Orlando / Central Florida area, close to the major theme parks. The exact address is shared after booking.',
  },
  {
    question: 'How do I book?',
    answer:
      'Pick your dates on the availability calendar above, continue to the guest intake page, review the house rules, and check out securely. A stay is confirmed after payment is completed and a booking confirmation is issued by email.',
  },
  {
    question: 'What’s included in the price?',
    answer:
      'The nightly rate plus a one-time cleaning fee is shown on the calendar before checkout. Any additional property-specific terms, fees, or house rules are confirmed before booking.',
  },
  {
    question: 'Have a question before booking?',
    answer:
      'Use the question form on this page and Daiana will get back to you by email about dates, the property, or anything else.',
  },
];

function VacationRentals() {
  usePageMeta(
    'Orlando Vacation Rental Near Theme Parks',
    'Check availability and book an Orlando vacation rental in Central Florida near major theme parks with secure checkout, amenities, FAQs, and booking questions.',
  );
  const { status, submit } = useContactForm('Orlando Vacation Rental Question');
  const template = getSiteContentTemplate('vacation-rentals');
  const { content, heroImageUrl } = usePublicSiteContent('vacation-rentals', template?.defaults || {});
  const [rentals, setRentals] = useState<PublicRental[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch('/api/public-rentals')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('failed'))))
      .then((payload: { rentals: PublicRental[] }) => {
        if (!active) return;
        setRentals(Array.isArray(payload.rentals) ? payload.rentals : []);
      })
      .catch(() => {
        if (active) setRentals([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSelectedIndex((current) => {
      if (!rentals.length) return 0;
      return Math.min(current, rentals.length - 1);
    });
  }, [rentals]);

  const selectedRental = rentals[selectedIndex] || null;
  const selectedRentalHeroImage = selectedRental?.hero_image_url || '';
  const rentalAmenities = useMemo(
    () => (selectedRental?.amenities?.length ? selectedRental.amenities : fallbackAmenities),
    [selectedRental],
  );
  const rentalPhotoGroups = useMemo(() => {
    const galleryPhotos = (selectedRental?.gallery_image_urls || [])
      .map((url, index) => ({
        url,
        caption: selectedRental?.gallery_image_captions?.[index] || '',
        group: selectedRental?.gallery_image_groups?.[index] || 'Gallery',
      }))
      .filter((entry) => entry.url);

    if (!galleryPhotos.length) return [];

    const grouped = new Map<string, { url: string; caption: string }[]>();
    galleryPhotos.forEach((photo) => {
      const key = photo.group.trim() || 'Gallery';
      const current = grouped.get(key) || [];
      current.push({ url: photo.url, caption: photo.caption });
      grouped.set(key, current);
    });
    return Array.from(grouped.entries()).map(([group, photos]) => ({ group, photos }));
  }, [selectedRental]);

  function isImageValue(value: string) {
    return value.startsWith('data:') || value.startsWith('http') || value.startsWith('/');
  }

  function cycleRental(direction: number) {
    if (rentals.length < 2) return;
    setSelectedIndex((current) => (current + direction + rentals.length) % rentals.length);
  }

  return (
    <PublicLayout>
      <main className="page-main">
        <section className="page-hero page-hero-vacation">
          <div className="page-hero-content">
            <p className="eyebrow">{content.heroEyebrow}</p>
            <h1>{selectedRental?.title || content.heroTitle}</h1>
            <p>{selectedRental?.description || content.heroDescription}</p>
            {selectedRental ? (
              <dl className="rental-hero-meta" aria-label="Selected rental summary">
                <div>
                  <dt>Location</dt>
                  <dd>{selectedRental.location_label}</dd>
                </div>
                <div>
                  <dt>Guests</dt>
                  <dd>Up to {selectedRental.max_guests}</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <div className="page-hero-visual page-hero-image-frame vacation-hero-visual" aria-label="Orlando vacation rental visual">
            <img src={selectedRentalHeroImage || heroImageUrl || '/images/site/vacation-hero.jpg'} alt="Sunlit Orlando vacation rental interior and patio" />
          </div>
        </section>

        <section className="page-content" id="availability">
          <div className="split-section vacation-booking vacation-booking-layout">
            <div className="page-intro vacation-booking-intro">
              <p className="eyebrow">{content.availabilityEyebrow}</p>
              <h2>{content.availabilityTitle}</h2>
              <p>{content.availabilityDescription}</p>
              {selectedRental ? (
                <section className="rental-selector" aria-label="Available rentals">
                  <div className="rental-selector-head">
                    <div>
                      <p className="eyebrow">Available rental</p>
                      <h3>{selectedRental.title}</h3>
                    </div>
                    {rentals.length > 1 ? (
                      <div className="rental-selector-controls">
                        <button type="button" className="rental-selector-button" onClick={() => cycleRental(-1)} aria-label="Previous rental">
                          <ChevronUp size={18} />
                        </button>
                        <span className="rental-selector-status">{selectedIndex + 1} / {rentals.length}</span>
                        <button type="button" className="rental-selector-button" onClick={() => cycleRental(1)} aria-label="Next rental">
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <p className="rental-selector-location">{selectedRental.location_label}</p>
                  <p className="rental-selector-copy">{selectedRental.description}</p>
                </section>
              ) : null}
              <div className="notice-box">
                Availability and pricing may change until payment is completed and a booking confirmation is issued.
                Vacation rental accommodations are offered independently through Iris &amp; J Holdings and are not
                real estate brokerage services.
              </div>
            </div>
            <VacationBookingCalendar key={selectedRental?.id || 'default-rental'} rentalId={selectedRental?.id} />
          </div>
        </section>

        <section className="page-content" id="house-rules-preview">
          <div className="page-intro">
            <p className="eyebrow">House Rules</p>
            <h2>Before checkout, review the stay expectations.</h2>
            <p>
              These are the core guest rules shown again in the intake form. The full house rules page and terms
              are linked before checkout and in the confirmation email.
            </p>
          </div>
          <ul className="detail-list">
            {vacationHouseRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>

        <section className="page-content" id="amenities">
          <div className="page-intro">
            <p className="eyebrow">Amenities</p>
            <h2>{selectedRental ? `${selectedRental.title} at a glance.` : 'Comfortable, practical, and close to the parks.'}</h2>
            <p>
              {selectedRental
                ? 'The amenities below come directly from the active rental record in the control center.'
                : 'This section can be updated with the property’s exact photos, amenities, house rules, and guest instructions once those details are finalized.'}
            </p>
          </div>
          <ul className="amenity-grid">
            {rentalAmenities.map((amenity) => (
              <li className="amenity-item" key={amenity}>{amenity}</li>
            ))}
          </ul>
        </section>

        <section className="page-content" id="photos">
          <div className="page-intro">
            <p className="eyebrow">Photos</p>
            <h2>{selectedRental ? `${selectedRental.title} photos.` : 'Property photos coming soon.'}</h2>
            <p>
              {selectedRental
                ? 'These images come directly from the rental record in the control center.'
                : 'Replace these placeholders with the rental’s actual photos before promoting the listing.'}
            </p>
          </div>
          {rentalPhotoGroups.length ? (
            <div className="vacation-photo-groups">
              {rentalPhotoGroups.map((group) => (
                <section className="vacation-photo-group" key={group.group}>
                  <h3>{group.group}</h3>
                  <div className="vacation-photo-grid">
                    {group.photos.map((item, index) => (
                      isImageValue(item.url) ? (
                        <figure className="vacation-photo-card has-photo" key={`${group.group}-${index}`}>
                          <img src={item.url} alt={item.caption || (selectedRental ? `${selectedRental.title} ${group.group} photo ${index + 1}` : `Vacation rental photo ${index + 1}`)} />
                          {item.caption ? <figcaption>{item.caption}</figcaption> : null}
                        </figure>
                      ) : (
                        <div className="vacation-photo-card" key={`${group.group}-${index}`}>{item.url}</div>
                      )
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="vacation-photo-grid">
              {fallbackPhotoSlots.map((item, index) => (
                <div className="vacation-photo-card" key={`placeholder-${index}`}>{item}</div>
              ))}
            </div>
          )}
        </section>

        <section className="page-content" id="questions">
          <div className="split-section vacation-question-section">
            <div className="page-intro">
              <p className="eyebrow">Questions</p>
              <h2>Ask before you book.</h2>
              <p>
                Have a question about dates, the home, the area, or the booking process? Send it here and Daiana
                will follow up by email.
              </p>
            </div>
            <form className="info-panel form-shell" onSubmit={submit}>
              <input className="hp-field" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="form-row">
                <div className="input-group"><label htmlFor="vacation-name">Name</label><input id="vacation-name" name="name" required /></div>
                <div className="input-group"><label htmlFor="vacation-email">Email</label><input id="vacation-email" name="email" type="email" required /></div>
              </div>
              <div className="input-group"><label htmlFor="vacation-question">Your Question</label><textarea id="vacation-question" name="question" required /></div>
              <button className="button button-primary" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending...' : 'Send Question'}
              </button>
              <FormStatus status={status} />
            </form>
          </div>
        </section>

        <section className="page-content">
          <Faq eyebrow="Vacation rental FAQ" heading="Before you reserve." items={orlandoFaqs} />
          <section className="vacation-legal-alert" aria-label="Vacation rental legal notice">
            Orlando vacation rental accommodations are offered independently through Iris &amp; J Holdings and are not
            provided through All Star Real Estate Agency. Vacation rental accommodations do not constitute real
            estate brokerage services. A stay is not confirmed until payment is completed and a booking confirmation
            is issued.
          </section>
        </section>
      </main>
    </PublicLayout>
  );
}

export default VacationRentals;


