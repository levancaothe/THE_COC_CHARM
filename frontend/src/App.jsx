import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import CharmListPage from './pages/CharmListPage';
import DesignerPage from './pages/DesignerPage';
import MyDesignsPage from './pages/MyDesignsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/charms" element={<CharmListPage />} />
              <Route path="/designer" element={<DesignerPage />} />
              <Route path="/my-designs" element={<MyDesignsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Về chúng tôi (Đang cập nhật)</div>} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
