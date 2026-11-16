import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FragranceCategory } from '../types';
import { VeloraLogo } from './VeloraLogo';

export const Footer: React.FC = () => {
  const { navigate, notify } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubscribed(true);
    setEmail('');
    notify('Welcome to the world of VELORA.');
  };

  const categories: FragranceCategory[] = ['Floral', 'Fresh', 'Woody', 'Oriental'];

  return (
    <footer className="bg-[#141210] text-[#E6DDD1] border-t border-[#2B2623]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <button
              type="button"
              onClick={() => navigate('home')}
              aria-label="VELORA Home"
              className="text-left focus-visible:outline-2 focus-visible:outline-[#B8935A]"
            >
              <VeloraLogo tone="light" size="md" />
            </button>
            <p className="text-sm text-[#B7AEA4] leading-relaxed max-w-sm">
              VELORA brings you an exclusive fragrance experience crafted for those who appreciate
              elegance, luxury and individuality.
            </p>
            <p className="text-xs tracking-[0.2em] uppercase text-[#B8935A]">
              Discover Your Signature Scent.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="#instagram"
                onClick={(e) => {
                  e.preventDefault();
                  notify('Follow @velorafragrances on Instagram for atelier dispatches.');
                }}
                aria-label="VELORA on Instagram"
                className="w-10 h-10 flex items-center justify-center border border-[#2B2623] text-[#E6DDD1] hover:border-[#B8935A] hover:text-[#B8935A] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="#facebook"
                onClick={(e) => {
                  e.preventDefault();
                  notify('Connect with VELORA Parfums on Facebook.');
                }}
                aria-label="VELORA on Facebook"
                className="w-10 h-10 flex items-center justify-center border border-[#2B2623] text-[#E6DDD1] hover:border-[#B8935A] hover:text-[#B8935A] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#pinterest"
                onClick={(e) => {
                  e.preventDefault();
                  notify('Explore VELORA olfactory moodboards on Pinterest.');
                }}
                aria-label="VELORA on Pinterest"
                className="w-10 h-10 flex items-center justify-center border border-[#2B2623] text-[#E6DDD1] hover:border-[#B8935A] hover:text-[#B8935A] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 19l1.8-6.5M12 14.5c1.8 0 3.2-1.4 3.2-3.4 0-2-1.5-3.4-3.5-3.4-2.2 0-3.7 1.5-3.7 3.5 0 .8.3 1.4.8 1.8" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-lg tracking-wide text-[#FAF8F4]">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-[#B7AEA4]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('home')}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('about')}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  About VELORA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('shop', { category: 'All', search: '' })}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  All Fragrances
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('blog')}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  Fragrance Journal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('contact')}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  Boutique Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Shop Categories */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-lg tracking-wide text-[#FAF8F4]">Olfactory Families</h3>
            <ul className="space-y-2.5 text-sm text-[#B7AEA4]">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => navigate('shop', { category: cat })}
                    className="hover:text-[#B8935A] transition-colors"
                  >
                    {cat} Fragrances
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => navigate('wishlist')}
                  className="hover:text-[#B8935A] transition-colors"
                >
                  Saved Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-4 space-y-5">
            <h3 className="font-serif text-lg tracking-wide text-[#FAF8F4]">
              Stay in the World of VELORA
            </h3>
            <p className="text-sm text-[#B7AEA4] leading-relaxed">
              Receive private invitations to limited harvest releases, scent stories, and bespoke
              VELORA consultations.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2.5 py-3 px-4 border border-[#B8935A]/50 bg-[#1F1C19] text-sm text-[#FAF8F4]">
                <CheckCircle2 className="w-4 h-4 text-[#B8935A] shrink-0" />
                <span>You are subscribed to VELORA private dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="space-y-2">
                <div className="flex border border-[#2B2623] focus-within:border-[#B8935A] transition-colors bg-[#1A1715]">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email address"
                    aria-label="Newsletter email address"
                    className="flex-1 min-w-0 bg-transparent px-4 py-3 text-base sm:text-sm text-[#FAF8F4] placeholder-[#8A8076] focus:outline-none min-h-[44px]"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="px-4 min-w-[48px] min-h-[44px] bg-[#B8935A] text-[#141210] hover:bg-[#C9A66E] transition-colors flex items-center justify-center shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {error && <p className="text-xs text-[#E28A7A]">{error}</p>}
              </form>
            )}

            <div className="pt-2 space-y-2 text-xs text-[#B7AEA4]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#B8935A] mt-0.5 shrink-0" />
                <span>14 Kala Ghoda Precinct, Fort, Mumbai 400001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#B8935A] shrink-0" />
                <span className="tabular-nums">+91 22 4890 3172</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#B8935A] shrink-0" />
                <span className="break-all">concierge@velorafragrances.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-[#2B2623] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A8076]">
          <p>© {new Date().getFullYear()} VELORA Parfums. All rights reserved.</p>
          <p>Every Scent Tells a Story · Cash on Delivery Available Across India</p>
        </div>
      </div>
    </footer>
  );
};
