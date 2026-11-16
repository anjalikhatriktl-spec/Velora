import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { formatINR } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { SafeImage } from './SafeImage';
import { LUXURY_EASE } from './MotionPrimitives';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, toggleWishlist, isWishlisted, setQuickViewProduct } = useStore();
  const wishlisted = isWishlisted(product.id);
  const secondaryImage = product.gallery[1] || product.image;

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: LUXURY_EASE }}
      className="group flex flex-col bg-white border border-[#E6DDD1]/90 hover:border-[#B8935A]/60 transition-all duration-300 hover:shadow-[0_18px_40px_-14px_rgba(24,22,20,0.14)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2ECE4]">
        <button
          type="button"
          onClick={() => navigate('product', { productSlug: product.slug })}
          className="relative block w-full h-full text-left focus-visible:outline-2 focus-visible:outline-[#B8935A]"
          aria-label={`View details for ${product.name}`}
        >
          <SafeImage
            src={product.image}
            alt={`${product.name} luxury perfume bottle`}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {secondaryImage !== product.image && (
            <SafeImage
              src={secondaryImage}
              alt={`${product.name} atelier styling`}
              fallbackTitle={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out scale-105 group-hover:scale-100"
            />
          )}
        </button>

        {product.tag && (
          <span className="pointer-events-none absolute top-3.5 left-3.5 text-[10px] tracking-[0.18em] uppercase text-[#181614] bg-[#FAF8F4]/92 backdrop-blur-xs px-3 py-1.5 border border-[#E6DDD1]/80">
            {product.tag}
          </span>
        )}

        <div className="absolute top-3.5 right-3.5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Save ${product.name} to wishlist`
            }
            className={`w-11 h-11 flex items-center justify-center border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#B8935A] ${
              wishlisted
                ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                : 'bg-[#FAF8F4]/92 text-[#181614] border-[#E6DDD1] hover:bg-[#181614] hover:text-[#FAF8F4] hover:border-[#181614]'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setQuickViewProduct(product)}
            aria-label={`Quick view ${product.name}`}
            className="w-11 h-11 flex items-center justify-center bg-[#FAF8F4]/92 text-[#181614] border border-[#E6DDD1] hover:bg-[#181614] hover:text-[#FAF8F4] hover:border-[#181614] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#B8935A] lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle Quick-Add Bar on Desktop Hover */}
        <div className="pointer-events-none hidden lg:flex items-center justify-between absolute inset-x-0 bottom-0 px-4 py-2.5 bg-gradient-to-t from-[#141210]/70 to-transparent text-[#FAF8F4] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="text-[11px] tracking-[0.16em] uppercase">{product.longevity}</span>
          <span className="text-[11px] tracking-[0.16em] uppercase text-[#E6DDD1]">
            Explore Notes →
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 text-[11px] tracking-[0.08em] uppercase text-[#6E655E] mb-2">
          <span className="truncate">
            {product.category} · {product.concentration}
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums text-[#181614] font-medium shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#B8935A] text-[#B8935A]" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('product', { productSlug: product.slug })}
          className="text-left focus-visible:outline-2 focus-visible:outline-[#B8935A]"
        >
          <h3 className="font-serif text-2xl sm:text-[26px] leading-tight font-medium text-[#181614] group-hover:text-[#9A7742] transition-colors duration-200">
            {product.name}
          </h3>
        </button>

        <p className="mt-2 text-sm text-[#6E655E] leading-relaxed line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        <div className="mt-5 pt-4 border-t border-[#E6DDD1]/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-[17px] font-semibold text-[#181614]">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#6E655E] line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => addToCart(product.id, '50ml', 1, true)}
            className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] text-[11px] font-medium tracking-[0.14em] uppercase bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] active:scale-[0.98] transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B8935A]"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </motion.article>
  );
};
