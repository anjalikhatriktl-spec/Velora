import React, { useEffect, useState } from 'react';
import { ArrowRight, Heart, ShoppingBag, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatINR } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { BottleVolume } from '../types';
import { SafeImage } from './SafeImage';
import { LUXURY_EASE } from './MotionPrimitives';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    navigate,
  } = useStore();

  const [selectedVolume, setSelectedVolume] = useState<BottleVolume>('50ml');

  useEffect(() => {
    setSelectedVolume('50ml');
  }, [quickViewProduct?.id]);

  useEffect(() => {
    if (!quickViewProduct) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewProduct(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quickViewProduct, setQuickViewProduct]);

  const activeVolumeObj = quickViewProduct
    ? quickViewProduct.volumes.find((v) => v.volume === selectedVolume) ??
      quickViewProduct.volumes[1] ??
      quickViewProduct.volumes[0]
    : null;

  const wishlisted = quickViewProduct ? isWishlisted(quickViewProduct.id) : false;

  return (
    <AnimatePresence>
      {quickViewProduct && activeVolumeObj && (
        <motion.div
          key="quick-view-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setQuickViewProduct(null)}
          className="fixed inset-0 z-50 bg-[#141210]/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.3, ease: LUXURY_EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view ${quickViewProduct.name}`}
            className="relative w-full max-w-4xl bg-[#FAF8F4] border border-[#E6DDD1] shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close quick view"
              className="absolute top-3 right-3 z-10 w-11 h-11 flex items-center justify-center bg-white/95 border border-[#E6DDD1] text-[#181614] hover:text-[#9A7742]"
            >
              <X className="w-5 h-5" />
            </button>

          <div className="aspect-[4/3] md:aspect-auto bg-[#F2ECE4]">
            <SafeImage
              src={quickViewProduct.image}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5 sm:space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E655E] mb-2">
                <span>
                  {quickViewProduct.category} · {quickViewProduct.concentration}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#181614] tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#B8935A] text-[#B8935A]" />
                  {quickViewProduct.rating} ({quickViewProduct.reviewCount})
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#181614]">
                {quickViewProduct.name}
              </h2>
              <p className="text-sm text-[#9A7742] mt-1">{quickViewProduct.subtitle}</p>

              <div className="mt-4 flex items-baseline gap-3 tabular-nums">
                <span className="text-2xl font-semibold text-[#181614]">
                  {formatINR(activeVolumeObj.price)}
                </span>
                {activeVolumeObj.originalPrice && (
                  <span className="text-sm text-[#6E655E] line-through">
                    {formatINR(activeVolumeObj.originalPrice)}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm text-[#2B2623] leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Volume Selector */}
              <div className="mt-5 sm:mt-6">
                <span className="block text-xs uppercase tracking-[0.15em] text-[#6E655E] mb-2.5">
                  Select Volume
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {quickViewProduct.volumes.map((v) => {
                    const active = v.volume === selectedVolume;
                    return (
                      <button
                        key={v.volume}
                        type="button"
                        onClick={() => setSelectedVolume(v.volume)}
                        className={`py-2.5 px-3 min-h-[48px] border text-center transition-colors ${
                          active
                            ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                            : 'bg-white text-[#181614] border-[#E6DDD1] hover:border-[#B8935A]'
                        }`}
                      >
                        <span className="block text-xs font-medium">{v.volume}</span>
                        <span className="block text-[11px] opacity-80 tabular-nums mt-0.5">
                          {formatINR(v.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Olfactory Notes */}
              <div className="mt-5 sm:mt-6 pt-5 border-t border-[#E6DDD1] grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="block uppercase tracking-wider text-[#6E655E] mb-1">Top</span>
                  <p className="text-[#181614]">{quickViewProduct.notes.top[0]}</p>
                </div>
                <div>
                  <span className="block uppercase tracking-wider text-[#6E655E] mb-1">Heart</span>
                  <p className="text-[#181614]">{quickViewProduct.notes.heart[0]}</p>
                </div>
                <div>
                  <span className="block uppercase tracking-wider text-[#6E655E] mb-1">Base</span>
                  <p className="text-[#181614]">{quickViewProduct.notes.base[0]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(quickViewProduct.id, selectedVolume, 1, true);
                    setQuickViewProduct(null);
                  }}
                  className="flex-1 min-h-[48px] px-5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Bag
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  aria-label="Toggle wishlist"
                  className={`w-12 min-h-[48px] flex items-center justify-center border transition-colors ${
                    wishlisted
                      ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                      : 'bg-white text-[#181614] border-[#E6DDD1] hover:border-[#181614]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('product', { productSlug: quickViewProduct.slug })}
                className="w-full min-h-[44px] text-xs tracking-[0.14em] uppercase text-[#6E655E] hover:text-[#181614] inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                View Full Fragrance Dossier
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
