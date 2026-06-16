import type { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

type PublicLayoutProps = {
  children: ReactNode;
};

function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <div id="main">{children}</div>
      <Footer />
    </div>
  );
}

export default PublicLayout;
