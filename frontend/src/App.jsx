import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import CharmListPage from "./pages/CharmListPage";
import DesignerPage from "./pages/DesignerPage";
import MyDesignsPage from "./pages/MyDesignsPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import AdminDashboard from "./pages/AdminDashboard";
import GuidePage from "./pages/GuidePage";
import AboutUsPage from "./pages/AboutUsPage";
import { CartProvider } from "./context/CartContext";
import CollectionsPage from "./pages/CollectionsPage";

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
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/policy" element={<GuidePage />} />
              <Route path="/about" element={<GuidePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
