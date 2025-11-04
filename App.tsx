import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import Cart from './components/Cart';
import CartButton from './components/CartButton';
import AdminRoutes from './pages/admin/AdminRoutes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <SyncProvider>
            <HashRouter>
              <div className="min-h-screen bg-gray-900 text-white font-sans">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/store/:companySlug" element={<StorePage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />

                  {/* Admin Routes */}
                  <Route path="/admin/*" element={<AdminRoutes />} />
                </Routes>
                {/* Show cart button only on non-admin routes */}
                {!window.location.hash.startsWith('#/admin') && (
                  <>
                    <CartButton />
                    <Cart />
                  </>
                )}
              </div>
            </HashRouter>
          </SyncProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;