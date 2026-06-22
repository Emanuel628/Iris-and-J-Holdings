import { Facebook, Instagram, Linkedin } from 'lucide-react';

// TODO: replace these with Daiana's real profile URLs.
const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/', Icon: Facebook },
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: Instagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', Icon: Linkedin },
];

function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`social-links ${className}`.trim()} aria-label="Social media">
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon size={18} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default SocialLinks;
