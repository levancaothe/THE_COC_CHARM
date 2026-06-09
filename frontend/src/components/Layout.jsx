import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  return (
    <div className="layout">
      {!isAdminRoute && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
