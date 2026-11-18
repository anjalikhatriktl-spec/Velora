import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatINR } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';
import { LUXURY_EASE } from './MotionPrimitives';

export const SearchOverlay: React.FC = () => {
  const { products, isSearchOpen, setSearchOpen, navigate } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isSearchOpen) return;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isSearchOpen, setSearchOpen]);

  const results = useMemo(() => {
    const active = products.filter((p) => p.published !== false);
    const q = query.trim().toLowerCase();
    if (!q) return active.slice(0, 4);
    return active.filter((p) => {
      const haystack = [
        p.name,
        p.subtitle,
        p.category,
        p.shortDescription,
        ...p.notes.top,
        ...p.notes.heart,
        ...p.notes.base,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('shop', { category: 'All', search: query.trim() });
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: LUXURY_EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Search fragrances"
            className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F4] border-b border-[#E6DDD1] shadow-2xl max-h-[88vh] overflow-y-auto"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="text-xs tracking-[0.2em] uppercase text-[#6E655E]">
                  Search the VELORA Archive
                </span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="w-11 h-11 flex items-center justify-center text-[#181614] hover:text-[#9A7742]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative flex items-center border-b-2 border-[#181614] pb-2.5 gap-2">
                <Search className="w-5 h-5 text-[#6E655E] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search perfume, floral note, oud..."
                  className="w-full min-w-0 bg-transparent font-serif text-xl sm:text-3xl text-[#181614] placeholder-[#8A8076] focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search text"
                    className="w-9 h-9 flex items-center justify-center text-[#6E655E] hover:text-[#181614] shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-3.5 sm:px-4 min-h-[40px] text-xs font-medium tracking-[0.14em] uppercase bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors whitespace-nowrap shrink-0"
                >
                  View All
                </button>
              </form>

              <div className="mt-6">
                <p className="text-xs tracking-[0.14em] uppercase text-[#6E655E] mb-4">
                  {query.trim()
                    ? `${results.length} matching fragrance(s)`
                    : 'Curated Recommendations'}
                </p>

                {results.length === 0 ? (
                  <p className="py-6 text-sm text-[#6E655E]">
                    No fragrances matched &ldquo;{query}&rdquo;. Try searching for Rose, Oud,
                    Lavender, Marigold, or Citrus.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {results.slice(0, 4).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => navigate('product', { productSlug: product.slug })}
                        className="group flex items-center gap-3.5 p-2.5 bg-white border border-[#E6DDD1] hover:border-[#B8935A] text-left transition-colors"
                      >
                        <div className="w-14 h-16 bg-[#F2ECE4] shrink-0 overflow-hidden">
                          <SafeImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-lg text-[#181614] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#6E655E] truncate">{product.category}</p>
                          <p className="text-xs font-semibold text-[#181614] mt-1 tabular-nums">
                            {formatINR(product.price)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#B8935A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
