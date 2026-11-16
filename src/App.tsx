import React from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { LUXURY_EASE, PagePreloader } from './components/MotionPrimitives';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { QuickViewModal } from './components/QuickViewModal';
import { ModalsAndToasts } from './components/ModalsAndToasts';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import {
  CheckoutPage,
  OrderConfirmationPage,
} from './pages/CheckoutAndConfirmationPages';
import {
  AboutPage,
  BlogPage,
  ContactPage,
  WishlistPage,
} from './pages/SecondaryPages';

const AppRouter: React.FC = () => {
  const { route } = useStore();

  const renderPage = () => {
    switch (route) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product':
        return <ProductDetailsPage />;
      case 'about':
        return <AboutPage />;
      case 'blog':
        return <BlogPage />;
      case 'contact':
        return <ContactPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'confirmation':
        return <OrderConfirmationPage />;
      case 'wishlist':
        return <WishlistPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#181614] overflow-x-clip">
      <PagePreloader />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: LUXURY_EASE }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <QuickViewModal />
      <ModalsAndToasts />
    </div>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </MotionConfig>
  );
}
