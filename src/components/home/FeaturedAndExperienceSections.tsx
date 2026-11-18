import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { BRAND_MEDIA } from '../../data/catalog';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../ProductCard';
import { SafeImage } from '../SafeImage';
import {
  EditorialImageReveal,
  FadeUp,
  ParallaxImageFrame,
  RevealSection,
  StaggerContainer,
  StaggerItem,
} from '../MotionPrimitives';

export const FeaturedAndExperienceSections: React.FC = () => {
  const { navigate, products } = useStore();
  const featuredProducts = useMemo(() => {
    const active = products.filter((p) => p.published !== false);
    const featured = active.filter((p) => p.featured);
    return featured.length > 0 ? featured : active.slice(0, 3);
  }, [products]);

  return (
    <>
      {/* 8. FEATURED PRODUCTS */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 mb-10 sm:mb-14">
            <FadeUp className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                  Curated VELORA Signatures
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614] text-balance">
                Find Your <em className="italic font-normal text-[#9A7742]">Signature</em> Scent
              </h2>
            </FadeUp>

            <button
              type="button"
              onClick={() => navigate('shop')}
              className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-[#181614] hover:text-[#9A7742] border-b border-[#181614] hover:border-[#9A7742] pb-1.5 transition-colors self-start md:self-auto whitespace-nowrap"
            >
              View Entire Boutique
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </RevealSection>

      {/* 9. BRAND EXPERIENCE SECTION: A SYMPHONY OF SCENTS */}
      <RevealSection className="py-16 sm:py-24 lg:py-32 bg-[#F2ECE4] border-y border-[#E6DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-7 order-2 lg:order-1">
              <FadeUp className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <span className="h-[1px] w-7 bg-[#B8935A]" aria-hidden="true" />
                  <p className="text-[11px] tracking-[0.26em] uppercase text-[#9A7742] font-medium">
                    The Sensory Journey
                  </p>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl lg:text-[54px] font-normal text-[#181614] leading-[1.08] text-balance">
                  A Symphony <em className="italic font-normal text-[#9A7742]">of</em> Scents
                </h2>
                <p className="text-sm sm:text-base text-[#2B2623] leading-[1.7]">
                  Just as a chamber piece balances quiet strings with resonant brass, every VELORA
                  extrait is structured across three measured movements. Sparkling bergamot and
                  spiced plum greet the first breath, yielding to hand-picked floral absolutes and
                  settling into creamy Mysore sandalwood, labdanum, and cashmere musk.
                </p>
                <p className="text-sm text-[#6E655E] leading-[1.7]">
                  Our crystal flacons are poured in numbered small lots, dressed in ivory and
                  champagne-gold VELORA packaging designed to shield delicate botanicals from light.
                </p>
              </FadeUp>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => navigate('shop')}
                  className="group inline-flex items-center justify-center gap-3 px-7 sm:px-8 min-h-[48px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] active:scale-[0.98] transition-all duration-300 text-xs font-medium tracking-[0.2em] uppercase"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <EditorialImageReveal className="aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px] bg-[#EAE2D6] border border-[#E6DDD1]">
                <ParallaxImageFrame className="w-full h-full" range={['-5%', '5%']}>
                  <SafeImage
                    src={BRAND_MEDIA.experience}
                    alt="VELORA Royal Essence crystal perfume bottle and ivory-gold presentation box"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                  />
                </ParallaxImageFrame>
              </EditorialImageReveal>
            </div>
          </div>
        </div>
      </RevealSection>
    </>
  );
};
