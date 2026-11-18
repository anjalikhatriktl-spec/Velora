import React, { useMemo } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { BRAND_MEDIA, INGREDIENTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';
import { TestimonialsContactBlogSections } from '../components/home/TestimonialsContactBlogSections';
import { FadeUp } from '../components/MotionPrimitives';

export const AboutPage: React.FC = () => {
  const { navigate, websiteContent } = useStore();
  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-12 sm:space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <FadeUp className="lg:col-span-6 space-y-5 sm:space-y-6">
            <p className="text-xs tracking-[0.24em] uppercase text-[#9A7742] font-medium">
              {websiteContent.brandStoryEyebrow}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#181614] leading-[1.08]">
              {websiteContent.brandStoryHeading}
            </h1>
            <p className="text-sm sm:text-base text-[#2B2623] leading-relaxed">
              {websiteContent.brandStoryBody}
            </p>
            <p className="text-sm text-[#6E655E] leading-relaxed">
              Each batch rests ninety days in cool limestone cellars, letting Calabrian citrus,
              high-altitude lavender, Deccan marigold, and aged Mysore sandalwood weave into a
              seamless signature.
            </p>
            <button
              type="button"
              onClick={() => navigate('shop')}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
            >
              Explore Our Fragrances
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeUp>

          <div className="lg:col-span-6 aspect-[4/3] overflow-hidden bg-[#F2ECE4] border border-[#E6DDD1]">
            <SafeImage
              src={BRAND_MEDIA.atelier}
              alt="VELORA Perfumery Atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {INGREDIENTS.map((ing) => (
            <div key={ing.id} className="bg-white border border-[#E6DDD1] p-5 sm:p-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[#9A7742]">{ing.origin}</p>
              <h2 className="font-serif text-2xl text-[#181614]">{ing.name}</h2>
              <p className="text-xs italic text-[#6E655E]">{ing.botanicalName}</p>
              <p className="text-sm text-[#6E655E] pt-2 leading-relaxed">{ing.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BlogPage: React.FC = () => {
  const { setActiveArticle, websiteContent } = useStore();
  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <FadeUp className="max-w-2xl space-y-3 mb-9 sm:mb-12">
          <p className="text-xs tracking-[0.24em] uppercase text-[#9A7742] font-medium">
            The Olfactory Journal
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#181614]">
            Stories & Fragrance Insights
          </h1>
          <p className="text-sm sm:text-base text-[#6E655E] leading-relaxed">
            Essays from our perfumers on raw harvest seasonality, slow maceration, and scent
            layering rituals.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {websiteContent.blogArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-white border border-[#E6DDD1] flex flex-col overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActiveArticle(article)}
                className="aspect-[4/3] w-full overflow-hidden bg-[#F2ECE4]"
              >
                <SafeImage
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </button>
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E655E]">
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="font-serif text-2xl text-[#181614] leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[#6E655E] leading-relaxed">{article.excerpt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveArticle(article)}
                  className="min-h-[44px] inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase text-[#181614] hover:text-[#9A7742]"
                >
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className="bg-[#FAF8F4] min-h-screen">
      <TestimonialsContactBlogSections />
    </div>
  );
};

export const WishlistPage: React.FC = () => {
  const { products, wishlist, navigate } = useStore();
  const savedProducts = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [products, wishlist]
  );

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <FadeUp className="space-y-3 mb-9 sm:mb-12">
          <p className="text-xs tracking-[0.24em] uppercase text-[#9A7742] font-medium">
            Curated Selection
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#181614]">
            Your Saved Wishlist
          </h1>
          <p className="text-sm text-[#6E655E]">
            Fragrances you have bookmarked for future rituals and gifting.
          </p>
        </FadeUp>

        {savedProducts.length === 0 ? (
          <div className="bg-white border border-[#E6DDD1] py-14 sm:py-16 px-5 sm:px-6 text-center space-y-4">
            <Heart className="w-10 h-10 text-[#9A7742] mx-auto" />
            <h2 className="font-serif text-3xl text-[#181614]">Your wishlist is empty</h2>
            <p className="text-sm text-[#6E655E] max-w-md mx-auto">
              Tap the heart icon on any fragrance card to save it here for quick access.
            </p>
            <button
              type="button"
              onClick={() => navigate('shop')}
              className="min-h-[48px] px-7 py-3.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
            >
              Explore Boutique
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
