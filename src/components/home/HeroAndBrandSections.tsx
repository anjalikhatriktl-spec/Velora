import React from 'react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BRAND_MEDIA, INGREDIENTS } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../SafeImage';
import {
  EditorialImageReveal,
  FadeUp,
  LUXURY_EASE,
  ParallaxImageFrame,
  RevealSection,
  StaggerContainer,
  StaggerItem,
} from '../MotionPrimitives';

export const HeroAndBrandSections: React.FC = () => {
  const { navigate, setFilmOpen, websiteContent } = useStore();

  return (
    <>
      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FAF8F4] border-b border-[#E6DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-18 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 items-center">
            {/* Editorial Copy Left */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 lg:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: LUXURY_EASE }}
                className="flex items-center gap-3"
              >
                <span className="h-[1px] w-7 sm:w-8 bg-[#B8935A]" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.26em] sm:tracking-[0.3em] uppercase text-[#9A7742] font-medium">
                  {websiteContent.heroEyebrow}
                </p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.08, ease: LUXURY_EASE }}
                className="font-serif text-[40px] sm:text-6xl lg:text-[72px] leading-[1.04] font-normal text-[#181614] text-balance"
              >
                {websiteContent.heroHeading}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.16, ease: LUXURY_EASE }}
                className="text-sm sm:text-lg text-[#6E655E] leading-[1.7] max-w-xl"
              >
                {websiteContent.heroSubtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.24, ease: LUXURY_EASE }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2"
              >
                <button
                  type="button"
                  onClick={() => navigate('shop')}
                  className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] active:scale-[0.98] transition-all duration-300 text-xs font-medium tracking-[0.18em] uppercase whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B8935A]"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => setFilmOpen(true)}
                  className="group inline-flex items-center justify-center gap-2.5 sm:gap-3 px-5 sm:px-6 min-h-[48px] border border-[#D8CEC0] bg-white/80 text-[#181614] hover:border-[#181614] transition-all duration-300 text-xs font-medium tracking-[0.16em] uppercase whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B8935A]"
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-[#181614] text-[#FAF8F4] rounded-full transition-transform duration-300 group-hover:scale-105">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </span>
                  Atelier Film
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.34, ease: LUXURY_EASE }}
                className="pt-6 border-t border-[#E6DDD1] grid grid-cols-3 gap-3 sm:gap-6 max-w-lg"
              >
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-[#181614] tabular-nums">28%</p>
                  <p className="text-[11px] sm:text-xs text-[#6E655E] mt-1 leading-snug">
                    Extrait Concentration
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-[#181614] tabular-nums">
                    90 Days
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#6E655E] mt-1 leading-snug">
                    Slow Maceration
                  </p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-[#181614] tabular-nums">100%</p>
                  <p className="text-[11px] sm:text-xs text-[#6E655E] mt-1 leading-snug">
                    Botanical Absolutes
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Large Hero Perfume Bottle Photograph Right with Curtain Reveal */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, clipPath: 'inset(6% 0% 0% 0%)' }}
                animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                transition={{ duration: 1.05, ease: LUXURY_EASE }}
                className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden bg-[#EAE2D6] border border-[#E6DDD1] group"
              >
                <motion.div
                  initial={{ scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.25, ease: LUXURY_EASE }}
                  className="w-full h-full"
                >
                  <SafeImage
                    src={websiteContent.heroImage || BRAND_MEDIA.hero}
                    alt="VELORA crystal luxury perfume bottle and ivory packaging box on warm travertine stone"
                    className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45, ease: LUXURY_EASE }}
                  className="absolute inset-x-0 bottom-0 p-4 sm:p-7 bg-gradient-to-t from-[#141210]/80 via-[#141210]/35 to-transparent text-[#FAF8F4] flex items-end justify-between gap-4"
                >
                  <div>
                    <p className="text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#E6DDD1]">
                      Signature Flacon
                    </p>
                    <p className="font-serif text-xl sm:text-[26px] text-white">
                      VELORA Royal Essence · 50ml
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('product', { productSlug: 'velora-royal-essence' })}
                    className="text-xs tracking-[0.18em] uppercase text-[#FAF8F4] underline underline-offset-4 hover:text-[#B8935A] transition-colors whitespace-nowrap py-1"
                  >
                    Discover
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BRAND INTRODUCTION */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            {/* Editorial Atelier Image with Scroll Reveal + Parallax */}
            <div className="lg:col-span-5">
              <EditorialImageReveal className="aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[460px] border border-[#E6DDD1] bg-[#F2ECE4]">
                <ParallaxImageFrame className="w-full h-full" range={['-5%', '5%']}>
                  <SafeImage
                    src={BRAND_MEDIA.atelier}
                    alt="VELORA artisan perfumery workbench with amber essence vials and dried botanicals"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                  />
                </ParallaxImageFrame>
              </EditorialImageReveal>
            </div>

            {/* Brand Story & Two Feature Blocks */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-7 sm:space-y-8">
              <FadeUp className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                  <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                    {websiteContent.brandStoryEyebrow}
                  </p>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-[50px] font-normal text-[#181614] leading-[1.08] text-balance">
                  {websiteContent.brandStoryHeading}
                </h2>
                <p className="text-sm sm:text-base text-[#6E655E] leading-[1.7] max-w-2xl">
                  {websiteContent.brandStoryBody}
                </p>
              </FadeUp>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-4 border-t border-[#E6DDD1]">
                <FadeUp
                  delay={0.1}
                  className="group bg-white border border-[#E6DDD1] hover:border-[#B8935A]/60 transition-colors duration-300 p-6 sm:p-7 space-y-3"
                >
                  <div className="w-11 h-11 flex items-center justify-center bg-[#F2ECE4] text-[#9A7742] group-hover:bg-[#181614] group-hover:text-[#FAF8F4] transition-colors duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#181614]">Fragrance Excellence</h3>
                  <p className="text-sm text-[#6E655E] leading-relaxed">
                    Cold-pressed citrus oils, steam-distilled florals, and high-concentration
                    extraits crafted for exceptional skin longevity.
                  </p>
                </FadeUp>

                <FadeUp
                  delay={0.2}
                  className="group bg-white border border-[#E6DDD1] hover:border-[#B8935A]/60 transition-colors duration-300 p-6 sm:p-7 space-y-3"
                >
                  <div className="w-11 h-11 flex items-center justify-center bg-[#F2ECE4] text-[#9A7742] group-hover:bg-[#181614] group-hover:text-[#FAF8F4] transition-colors duration-300">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M9 3h6v4l3 4v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9l3-4V3z" />
                      <path d="M9 7h6" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-[#181614]">Memories in Every Bottle</h3>
                  <p className="text-sm text-[#6E655E] leading-relaxed">
                    Each composition captures an evocative sensory place—sun-warmed limestone
                    courtyards, rain-washed petals, and velvet dusk.
                  </p>
                </FadeUp>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate('about')}
                  className="group inline-flex items-center gap-2.5 text-xs font-medium tracking-[0.18em] uppercase text-[#181614] hover:text-[#9A7742] border-b border-[#181614] hover:border-[#9A7742] pb-1.5 transition-colors"
                >
                  Read Our Full Story
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* 4. FRAGRANCE INGREDIENTS SECTION */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#F2ECE4] border-y border-[#E6DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-14">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                  Botanical Alchemy
                </p>
              </div>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal text-[#181614] text-balance">
                Rare Essence & <em className="italic font-normal text-[#9A7742]">Raw</em> Botanicals
              </h2>
            </div>
            <p className="text-sm text-[#6E655E] max-w-md leading-[1.7]">
              Explore the four signature raw harvests that anchor our seasonal and reserve
              compositions. Select any botanical to view matching perfumes.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {INGREDIENTS.map((item) => (
              <StaggerItem key={item.id}>
                <motion.button
                  type="button"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3, ease: LUXURY_EASE }}
                  onClick={() => navigate('shop', { category: item.category })}
                  className="group w-full h-full text-left bg-white border border-[#E6DDD1] hover:border-[#B8935A]/60 overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[0_18px_36px_-16px_rgba(24,22,20,0.16)] focus-visible:outline-2 focus-visible:outline-[#B8935A]"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[#EAE2D6]">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                  </div>
                  <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.18em] uppercase text-[#9A7742]">
                        {item.origin}
                      </p>
                      <h3 className="font-serif text-[25px] leading-tight font-medium text-[#181614] mt-1 group-hover:text-[#9A7742] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs italic text-[#6E655E] mt-0.5">{item.botanicalName}</p>
                      <p className="text-sm text-[#6E655E] mt-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase text-[#181614] pt-4 border-t border-[#E6DDD1]/70 mt-4">
                      Explore {item.category} Scents
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>
    </>
  );
};
