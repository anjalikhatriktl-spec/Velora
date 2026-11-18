import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { formatINR, GALLERY_ITEMS } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { FragranceCategory } from '../../types';
import { SafeImage } from '../SafeImage';
import { FadeUp, LUXURY_EASE, RevealSection } from '../MotionPrimitives';

const GALLERY_FILTERS: (FragranceCategory | 'All')[] = [
  'All',
  'Floral',
  'Fresh',
  'Woody',
  'Oriental',
];

const carouselVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 56 : -56,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -56 : 56,
  }),
};

export const CollectionAndGallerySections: React.FC = () => {
  const { navigate, addToCart, products, websiteContent } = useStore();
  const carouselProducts = useMemo(() => {
    const active = products.filter((p) => p.published !== false);
    const inCarousel = active.filter((p) => p.inCollectionCarousel);
    return inCarousel.length > 0 ? inCarousel : active;
  }, [products]);
  const [[slideIndex, direction], setSlideState] = useState<[number, number]>([0, 1]);
  const [galleryCategory, setGalleryCategory] = useState<FragranceCategory | 'All'>('All');

  const visibleSlides = useMemo(() => {
    const count = carouselProducts.length;
    if (count === 0) return [];
    const safeIdx = slideIndex % count;
    return [0, 1, 2].map((offset) => carouselProducts[(safeIdx + offset) % count]);
  }, [carouselProducts, slideIndex]);

  const handlePrev = () => {
    if (carouselProducts.length === 0) return;
    setSlideState(([prev]) => [(prev - 1 + carouselProducts.length) % carouselProducts.length, -1]);
  };

  const handleNext = () => {
    if (carouselProducts.length === 0) return;
    setSlideState(([prev]) => [(prev + 1) % carouselProducts.length, 1]);
  };

  const handleJump = (idx: number) => {
    setSlideState(([prev]) => [idx, idx >= prev ? 1 : -1]);
  };

  const filteredGallery = useMemo(() => {
    if (galleryCategory === 'All') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.category === galleryCategory);
  }, [galleryCategory]);

  // Parallax for Promotional Section
  const promoRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: promoRef,
    offset: ['start end', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <>
      {/* 5. FRAGRANCE COLLECTION SLIDER */}
      <RevealSection id="collection-section" className="scroll-mt-20 py-16 sm:py-24 lg:py-32 bg-[#FAF8F4] overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10 sm:mb-14">
            <FadeUp className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                  Every Scent Tells a Story
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614] text-balance">
                Explore the <em className="italic font-normal text-[#9A7742]">VELORA</em> Collection
              </h2>
            </FadeUp>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous collection fragrance"
                className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-[#D8CEC0] bg-white text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] hover:border-[#181614] active:scale-95 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next collection fragrance"
                className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-[#D8CEC0] bg-white text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] hover:border-[#181614] active:scale-95 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slideIndex}
              custom={direction}
              variants={carouselVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.48, ease: LUXURY_EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) handleNext();
                else if (info.offset.x > 50) handlePrev();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 touch-pan-y"
            >
              {visibleSlides.map((product, idx) => {
                const secondary = product.gallery[1] || product.image;
                const responsiveVisibility =
                  idx === 1 ? 'hidden sm:flex' : idx === 2 ? 'hidden lg:flex' : 'flex';

                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.28, ease: LUXURY_EASE }}
                    className={`${responsiveVisibility} group bg-white border border-[#E6DDD1] hover:border-[#B8935A]/60 flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_18px_36px_-16px_rgba(24,22,20,0.14)]`}
                  >
                    <button
                      type="button"
                      onClick={() => navigate('product', { productSlug: product.slug })}
                      className="relative aspect-[3/4] overflow-hidden bg-[#F2ECE4] text-left"
                    >
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      {secondary !== product.image && (
                        <SafeImage
                          src={secondary}
                          alt={`${product.name} secondary view`}
                          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        />
                      )}
                    </button>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-[11px] tracking-[0.12em] uppercase text-[#6E655E]">
                          <span>{product.category}</span>
                          <span className="inline-flex items-center gap-1 text-[#181614] tabular-nums font-medium">
                            <Star className="w-3.5 h-3.5 fill-[#B8935A] text-[#B8935A]" />
                            {product.rating.toFixed(1)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate('product', { productSlug: product.slug })}
                          className="mt-1.5 text-left block"
                        >
                          <h3 className="font-serif text-2xl sm:text-[26px] leading-tight font-medium text-[#181614] group-hover:text-[#9A7742] transition-colors">
                            {product.name}
                          </h3>
                        </button>
                        <p className="text-xs text-[#6E655E] mt-1">{product.subtitle}</p>
                      </div>

                      <div className="pt-4 border-t border-[#E6DDD1] flex flex-wrap items-center justify-between gap-3">
                        <span className="text-base font-semibold text-[#181614] tabular-nums">
                          {formatINR(product.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(product.id, '50ml', 1, true)}
                          className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] active:scale-[0.98] transition-all text-[11px] font-medium tracking-[0.14em] uppercase whitespace-nowrap shrink-0"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Dots */}
          <div className="mt-8 sm:mt-9 flex items-center justify-center gap-2">
            {carouselProducts.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleJump(idx)}
                aria-label={`Show slide starting with ${p.name}`}
                className={`h-2 transition-all duration-300 ${
                  idx === slideIndex ? 'w-9 bg-[#181614]' : 'w-2.5 bg-[#D8CEC0] hover:bg-[#9A7742]'
                }`}
              />
            ))}
          </div>
        </div>
      </RevealSection>

      {/* 6. GALLERY SHOWCASE: MEMORIES IN EVERY BOTTLE */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-white border-y border-[#E6DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
            <FadeUp className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                  Visual Archive
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614] text-balance">
                Memories in <em className="italic font-normal text-[#9A7742]">Every</em> Bottle
              </h2>
            </FadeUp>

            {/* Category Filter Buttons with animated layoutId indicator */}
            <div
              role="tablist"
              aria-label="Filter fragrance gallery by category"
              className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF8F4] border border-[#E6DDD1] max-w-full"
            >
              {GALLERY_FILTERS.map((cat) => {
                const active = galleryCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setGalleryCategory(cat)}
                    className={`relative px-3.5 sm:px-4 min-h-[40px] text-[11px] tracking-[0.14em] sm:tracking-[0.18em] uppercase transition-colors whitespace-nowrap shrink-0 ${
                      active ? 'text-[#FAF8F4]' : 'text-[#6E655E] hover:text-[#181614]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="gallery-filter-pill"
                        transition={{ duration: 0.35, ease: LUXURY_EASE }}
                        className="absolute inset-0 bg-[#181614]"
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            layout
            className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item) => {
                const linkedProduct = products.find((p) => p.id === item.productId);
                return (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.42, ease: LUXURY_EASE }}
                    className="group relative overflow-hidden bg-[#F2ECE4] border border-[#E6DDD1]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate('product', {
                          productSlug: linkedProduct?.slug || products[0]?.slug || '',
                        })
                      }
                      className="relative block w-full aspect-[3/4] overflow-hidden text-left"
                    >
                      <SafeImage
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/85 via-[#141210]/25 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-3 sm:p-5 text-[#FAF8F4]">
                        <div className="transform translate-y-0 sm:translate-y-3 sm:group-hover:translate-y-0 transition-transform duration-400 ease-out">
                          <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-[#B8935A]">
                            {item.category}
                          </span>
                          <h3 className="font-serif text-base sm:text-2xl leading-tight text-white mt-0.5 sm:mt-1">
                            {item.title}
                          </h3>
                          <div className="hidden sm:block w-8 h-[1px] bg-[#B8935A] my-2" />
                          <p className="hidden sm:block text-xs text-[#E6DDD1] leading-relaxed">
                            {item.caption}
                          </p>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </RevealSection>

      {/* 7. LUXURY PROMOTIONAL PARALLAX SECTION */}
      <section
        ref={promoRef}
        className="relative overflow-hidden bg-[#141210] text-[#FAF8F4] py-20 sm:py-28 lg:py-44"
      >
        <motion.div
          style={{ y: parallaxY, scale: parallaxScale }}
          className="absolute inset-0 -top-14 -bottom-14 pointer-events-none will-change-transform"
        >
          <SafeImage
            src={websiteContent.promoBannerImage}
            alt="VELORA luxury glass perfume bottles under stone arches at sunset"
            className="w-full h-full object-cover object-center opacity-55"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/90 via-[#141210]/68 to-[#141210]/45 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-xl space-y-5 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: LUXURY_EASE }}
              className="flex items-center gap-3"
            >
              <span className="h-[1px] w-7 sm:w-8 bg-[#B8935A]" aria-hidden="true" />
              <p className="text-[11px] tracking-[0.26em] uppercase text-[#B8935A]">
                {websiteContent.promoBannerEyebrow}
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.08, ease: LUXURY_EASE }}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.08] text-balance"
            >
              {websiteContent.promoBannerHeading}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.16, ease: LUXURY_EASE }}
              className="text-sm sm:text-base text-[#E6DDD1] leading-[1.7]"
            >
              {websiteContent.promoBannerText}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.24, ease: LUXURY_EASE }}
              className="pt-2"
            >
              <button
                type="button"
                onClick={() => navigate('shop')}
                className="group inline-flex items-center justify-center gap-3 px-7 sm:px-8 min-h-[48px] bg-[#B8935A] text-[#141210] hover:bg-[#FAF8F4] active:scale-[0.98] transition-all duration-300 text-xs font-semibold tracking-[0.2em] uppercase"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};
