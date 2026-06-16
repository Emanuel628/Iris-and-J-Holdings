import type { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

type PublicLayoutProps = {
  children: ReactNode;
};

function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="site-shell">
      <Header />
      {children}
      <Footer />
    </div>
  );
}

export default PublicLayout;
