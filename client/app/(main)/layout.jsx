import Navbar from '../../src/components/Navbar';
import Footer from '../../src/components/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
