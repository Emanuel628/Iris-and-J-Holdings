/** Small opt-in checkbox: when checked, the form submission also subscribes the
 *  visitor to the newsletter (handled server-side in /api/contact). */
function NewsletterOptIn() {
  return (
    <label className="newsletter-optin">
      <input type="checkbox" name="newsletterOptIn" value="yes" />
      <span>Subscribe to Daiana’s newsletter for new listings and updates.</span>
    </label>
  );
}

export default NewsletterOptIn;
