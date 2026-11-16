import React, { useEffect, useState } from 'react';
import {
  Clock,
  Heart,
  Mail,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { PageRoute } from '../types';
import { LUXURY_EASE, ScrollProgressBar } from './MotionPrimitives';
import { VeloraLogo } from './VeloraLogo';

interface NavItem {
  label: string;
  route: PageRoute;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', route: 'home' },
  { label: 'About', route: 'about' },
  { label: 'Collection', route: 'home', section: 'collection-section' },
  { label: 'Shop', route: 'shop' },
  { label: 'Blog', route: 'blog' },
  { label: 'Contact', route: 'contact' },
];

export const Navbar: React.FC = () => {
  const {
    route,
    navigate,
    cartCount,
    wishlist,
    setCartOpen,
    setSearchOpen,
  } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNavLabel, setActiveNavLabel] = useState<string>('Home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (route === 'home') setActiveNavLabel('Home');
    else if (route === 'about') setActiveNavLabel('About');
    else if (route === 'shop' || route === 'product') setActiveNavLabel('Shop');
    else if (route === 'blog') setActiveNavLabel('Blog');
    else if (route === 'contact') setActiveNavLabel('Contact');
  }, [route]);

  const handleNavClick = (item: NavItem) => {
    setActiveNavLabel(item.label);
    setMobileOpen(false);
    if (item.section) {
      navigate('home', { scrollToSection: item.section });
    } else if (item.route === 'shop') {
      navigate('shop', { category: 'All', search: '' });
    } else {
      navigate(item.route);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Slim Top Information Bar */}
      <div
        className={`bg-[#141210] text-[#E6DDD1] transition-all duration-300 overflow-hidden ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
        } hidden md:block`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-9 flex items-center justify-between text-[11px] tracking-wider">
          <div className="flex items-center gap-6">
            <a
              href="mailto:concierge@velorafragrances.in"
              className="inline-flex items-center gap-1.5 hover:text-[#B8935A] transition-colors whitespace-nowrap"
            >
              <Mail className="w-3 h-3 text-[#B8935A]" />
              concierge@velorafragrances.in
            </a>
            <a
              href="tel:+912248903172"
              className="inline-flex items-center gap-1.5 hover:text-[#B8935A] transition-colors whitespace-nowrap tabular-nums"
            >
              <Phone className="w-3 h-3 text-[#B8935A]" />
              +91 22 4890 3172
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3 h-3 text-[#B8935A]" />
              Mon – Sat · 10:00 – 20:00 IST
            </span>
            <span className="text-[#B8935A] whitespace-nowrap">
              Complimentary Shipping Above ₹2,500
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <div
        className={`relative w-full border-b transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF8F4]/95 backdrop-blur-md border-[#E6DDD1] shadow-[0_8px_28px_-14px_rgba(24,22,20,0.12)]'
            : 'bg-[#FAF8F4] border-[#E6DDD1]/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 lg:h-[76px] flex items-center justify-between gap-2 sm:gap-6 lg:gap-8">
          {/* Mobile Menu Trigger + VELORA Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center text-[#181614] hover:text-[#9A7742] transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              aria-label="VELORA Home"
              className="whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B8935A]"
            >
              <VeloraLogo tone="dark" size="md" />
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-8 text-[11px] font-medium tracking-[0.2em] uppercase text-[#2B2623]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeNavLabel === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`relative py-2 transition-colors whitespace-nowrap shrink-0 hover:text-[#9A7742] focus-visible:outline-2 focus-visible:outline-[#B8935A] ${
                    isActive ? 'text-[#181614]' : 'text-[#6E655E]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={{ duration: 0.35, ease: LUXURY_EASE }}
                      className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#B8935A]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search VELORA fragrances"
              className="w-11 h-11 flex items-center justify-center text-[#181614] hover:text-[#9A7742] transition-colors focus-visible:outline-2 focus-visible:outline-[#B8935A]"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => navigate('wishlist')}
              aria-label={`Saved fragrances (${wishlist.length})`}
              className="relative w-11 h-11 flex items-center justify-center text-[#181614] hover:text-[#9A7742] transition-colors focus-visible:outline-2 focus-visible:outline-[#B8935A]"
            >
              <User className="w-[18px] h-[18px] sm:hidden" />
              <Heart className="w-[18px] h-[18px] hidden sm:block" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#B8935A] text-white text-[10px] font-medium tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open shopping bag (${cartCount} items)`}
              className="relative w-11 h-11 flex items-center justify-center text-[#181614] hover:text-[#9A7742] transition-colors focus-visible:outline-2 focus-visible:outline-[#B8935A]"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-[#181614] text-[#FAF8F4] text-[10px] font-medium tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <ScrollProgressBar />
        </div>
      </div>

      {/* Animated Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-[#141210]/55 backdrop-blur-xs lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: LUXURY_EASE }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed top-0 left-0 bottom-0 z-50 w-[86vw] max-w-sm bg-[#FAF8F4] text-[#181614] flex flex-col justify-between p-6 shadow-2xl overflow-y-auto lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-[#E6DDD1]">
                  <VeloraLogo tone="dark" size="sm" />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-11 h-11 flex items-center justify-center text-[#181614]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-4 flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className="w-full text-left py-3.5 px-2 font-serif text-2xl text-[#181614] hover:text-[#9A7742] border-b border-[#E6DDD1]/50 transition-colors min-h-[48px]"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate('wishlist');
                    }}
                    className="w-full text-left py-3.5 px-2 font-serif text-2xl text-[#181614] hover:text-[#9A7742] border-b border-[#E6DDD1]/50 transition-colors min-h-[48px]"
                  >
                    Saved Wishlist ({wishlist.length})
                  </button>
                </nav>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E6DDD1] space-y-2 text-xs text-[#6E655E]">
                <p className="text-[#181614] font-medium">VELORA Concierge</p>
                <p>concierge@velorafragrances.in</p>
                <p>+91 22 4890 3172</p>
                <p>Mon – Sat · 10:00 – 20:00 IST</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
