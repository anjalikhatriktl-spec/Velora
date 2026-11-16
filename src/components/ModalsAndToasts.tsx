import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { BRAND_MEDIA } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';
import { LUXURY_EASE } from './MotionPrimitives';

export const ModalsAndToasts: React.FC = () => {
  const { isFilmOpen, setFilmOpen, activeArticle, setActiveArticle, toasts, navigate } = useStore();

  useEffect(() => {
    if (!isFilmOpen && !activeArticle) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeArticle) setActiveArticle(null);
        else if (isFilmOpen) setFilmOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFilmOpen, activeArticle, setFilmOpen, setActiveArticle]);

  return (
    <>
      {/* Atelier Film / Craft Story Modal */}
      <AnimatePresence>
        {isFilmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFilmOpen(false)}
            className="fixed inset-0 z-50 bg-[#141210]/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: LUXURY_EASE }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="VELORA Atelier Film"
              className="relative w-full max-w-3xl bg-[#181614] text-[#FAF8F4] border border-[#2B2623] overflow-hidden shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setFilmOpen(false)}
                aria-label="Close atelier story"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-11 h-11 flex items-center justify-center bg-[#141210]/85 text-[#FAF8F4] hover:text-[#B8935A]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative min-h-[380px] sm:min-h-0 sm:aspect-video overflow-hidden flex flex-col justify-end">
                <SafeImage
                  src={BRAND_MEDIA.campaign}
                  alt="VELORA Atelier Film Still"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/65 to-[#141210]/15" />
                <div className="relative z-10 flex flex-col justify-end p-5 pt-16 sm:p-8">
                  <p className="text-[11px] sm:text-xs tracking-[0.22em] uppercase text-[#B8935A] mb-2">
                    VELORA Film · 03:40
                  </p>
                  <h3 className="font-serif text-2xl sm:text-4xl font-normal text-[#FAF8F4] leading-tight">
                    From Dawn Harvest to Crystal Flacon
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#E6DDD1] max-w-xl leading-relaxed">
                    Every VELORA composition begins with raw floral absolutes macerated for ninety
                    days, preserving delicate volatile aromatics without synthetic accelerants.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFilmOpen(false);
                        navigate('about');
                      }}
                      className="min-h-[44px] px-5 py-2.5 bg-[#B8935A] text-[#141210] text-xs font-medium tracking-[0.16em] uppercase hover:bg-[#C9A66E] transition-colors"
                    >
                      Explore Our Craft
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilmOpen(false);
                        navigate('shop');
                      }}
                      className="min-h-[44px] px-5 py-2.5 border border-[#E6DDD1]/40 text-[#FAF8F4] text-xs font-medium tracking-[0.16em] uppercase hover:border-[#B8935A] transition-colors"
                    >
                      Shop Signatures
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog Article Reader Modal */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveArticle(null)}
            className="fixed inset-0 z-50 bg-[#141210]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          >
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: LUXURY_EASE }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={activeArticle.title}
              className="relative w-full max-w-2xl bg-[#FAF8F4] text-[#181614] border border-[#E6DDD1] shadow-2xl max-h-[88vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
                className="sticky top-3 float-right mr-3 mt-3 z-10 w-11 h-11 flex items-center justify-center bg-white/95 border border-[#E6DDD1] text-[#181614] hover:text-[#9A7742] shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/9] bg-[#F2ECE4] overflow-hidden">
                <SafeImage
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 sm:p-10 space-y-4 sm:space-y-5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E655E]">
                  <span>{activeArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeArticle.readTime}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[#181614] leading-tight">
                  {activeArticle.title}
                </h2>
                <p className="text-xs tracking-wider uppercase text-[#9A7742]">
                  By {activeArticle.author}
                </p>

                <div className="pt-3 border-t border-[#E6DDD1] space-y-4 text-sm sm:text-base text-[#2B2623] leading-relaxed">
                  {activeArticle.content.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveArticle(null);
                      navigate('shop');
                    }}
                    className="w-full sm:w-auto min-h-[46px] px-6 py-3 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.16em] uppercase"
                  >
                    Discover the Collection
                  </button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 pointer-events-none sm:max-w-sm"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: LUXURY_EASE }}
              className="pointer-events-auto flex items-center gap-2.5 bg-[#181614] text-[#FAF8F4] border border-[#B8935A]/50 px-4 py-3 text-xs tracking-wide shadow-xl"
            >
              <Check className="w-4 h-4 text-[#B8935A] shrink-0" />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
