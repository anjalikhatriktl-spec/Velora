import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { formatINR, PRODUCTS } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { BottleVolume } from '../types';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailsPage: React.FC = () => {
  const {
    selectedProductSlug,
    navigate,
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  const product = useMemo(
    () => PRODUCTS.find((p) => p.slug === selectedProductSlug) ?? PRODUCTS[0],
    [selectedProductSlug]
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState<BottleVolume>('50ml');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedVolume('50ml');
    setQuantity(1);
  }, [product.id]);

  const activeVolumeObj =
    product.volumes.find((v) => v.volume === selectedVolume) ??
    product.volumes[1] ??
    product.volumes[0];

  const relatedProducts = useMemo(
    () => PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3),
    [product.id]
  );

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="bg-[#FAF8F4] min-h-screen pt-8 pb-24 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('shop')}
            className="inline-flex items-center gap-2 min-h-[40px] text-xs tracking-[0.16em] uppercase text-[#6E655E] hover:text-[#181614] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Boutique
          </button>
          <span className="text-xs text-[#6E655E] hidden sm:inline">
            {product.category} / {product.name}
          </span>
        </div>

        {/* Main Split Module: Gallery Left + Contiguous Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-start">
          {/* Product Image Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-3 sm:space-y-4">
            <div className="aspect-[3/4] bg-[#F2ECE4] border border-[#E6DDD1] overflow-hidden">
              <SafeImage
                src={product.gallery[activeImageIdx] || product.image}
                alt={`${product.name} bottle detail`}
                className="w-full h-full object-cover object-center transition-all duration-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {product.gallery.map((imgSrc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`View gallery angle ${idx + 1}`}
                  className={`aspect-[4/3] overflow-hidden border transition-all ${
                    activeImageIdx === idx
                      ? 'border-[#181614] ring-1 ring-[#181614]'
                      : 'border-[#E6DDD1] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={imgSrc}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Module */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            <div className="space-y-2.5 border-b border-[#E6DDD1] pb-5 sm:pb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E655E]">
                <span className="uppercase tracking-[0.16em] text-[#9A7742]">
                  {product.category} · {product.concentration}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#181614] tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#B8935A] text-[#B8935A]" />
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#181614]">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base text-[#6E655E]">{product.subtitle}</p>

              <div className="pt-2 sm:pt-3 flex flex-wrap items-baseline gap-3 tabular-nums">
                <span className="text-2xl sm:text-3xl font-semibold text-[#181614]">
                  {formatINR(activeVolumeObj.price)}
                </span>
                {activeVolumeObj.originalPrice && (
                  <span className="text-sm sm:text-base text-[#6E655E] line-through">
                    {formatINR(activeVolumeObj.originalPrice)}
                  </span>
                )}
                <span className="text-xs text-[#6E655E]">Inclusive of all taxes</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#2B2623] leading-relaxed">
              {product.description}
            </p>

            {/* Volume Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em]">
                <span className="text-[#6E655E]">Select Bottle Volume</span>
                <span className="text-[#181614] font-medium">{selectedVolume} Flacon</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {product.volumes.map((v) => {
                  const active = v.volume === selectedVolume;
                  return (
                    <button
                      key={v.volume}
                      type="button"
                      onClick={() => setSelectedVolume(v.volume)}
                      className={`py-3 px-2 sm:px-4 min-h-[54px] border text-center transition-colors ${
                        active
                          ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                          : 'bg-white text-[#181614] border-[#E6DDD1] hover:border-[#B8935A]'
                      }`}
                    >
                      <span className="block text-sm font-medium">{v.volume}</span>
                      <span className="block text-xs opacity-85 tabular-nums mt-0.5">
                        {formatINR(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Action Buttons */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="inline-flex items-center justify-between border border-[#D8CEC0] bg-white px-2 h-12 sm:h-[52px] w-32 sm:w-36 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#181614] hover:bg-[#F2ECE4]"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#181614] hover:bg-[#F2ECE4]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(product.id, selectedVolume, quantity, true)}
                  className="flex-1 min-w-[200px] min-h-[48px] sm:h-[52px] px-5 sm:px-6 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.16em] uppercase inline-flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>Add to Bag — {formatINR(activeVolumeObj.price * quantity)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle wishlist"
                  className={`h-12 sm:h-[52px] w-12 sm:w-[52px] shrink-0 flex items-center justify-center border transition-colors ${
                    wishlisted
                      ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                      : 'bg-white text-[#181614] border-[#D8CEC0] hover:border-[#181614]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  addToCart(product.id, selectedVolume, quantity, false);
                  navigate('checkout');
                }}
                className="w-full min-h-[48px] border border-[#181614] text-[#181614] hover:bg-[#181614] hover:text-[#FAF8F4] transition-colors text-xs font-medium tracking-[0.18em] uppercase"
              >
                Buy Now with Cash on Delivery
              </button>
            </div>

            {/* Olfactory Pyramid */}
            <div className="bg-white border border-[#E6DDD1] p-5 sm:p-6 space-y-5">
              <h2 className="font-serif text-2xl text-[#181614]">Olfactory Architecture</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
                <div>
                  <span className="block text-[11px] tracking-[0.16em] uppercase text-[#9A7742] mb-1.5">
                    Top Notes
                  </span>
                  <ul className="space-y-1 text-[#2B2623]">
                    {product.notes.top.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="block text-[11px] tracking-[0.16em] uppercase text-[#9A7742] mb-1.5">
                    Heart Notes
                  </span>
                  <ul className="space-y-1 text-[#2B2623]">
                    {product.notes.heart.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="block text-[11px] tracking-[0.16em] uppercase text-[#9A7742] mb-1.5">
                    Base Notes
                  </span>
                  <ul className="space-y-1 text-[#2B2623]">
                    {product.notes.base.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DDD1] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-[#6E655E]">Longevity</span>
                  <span className="font-medium text-[#181614] mt-0.5 block">
                    {product.longevity}
                  </span>
                </div>
                <div>
                  <span className="block text-[#6E655E]">Sillage</span>
                  <span className="font-medium text-[#181614] mt-0.5 block">{product.sillage}</span>
                </div>
                <div>
                  <span className="block text-[#6E655E]">Craft</span>
                  <span className="font-medium text-[#181614] mt-0.5 block">{product.origin}</span>
                </div>
              </div>
            </div>

            {/* Trust Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-[#6E655E] pt-1">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#9A7742] shrink-0" />
                <span>Free Shipping Above ₹2,500</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#9A7742] shrink-0" />
                <span>Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9A7742] shrink-0" />
                <span>Sealed VELORA Box &amp; 2ml Vial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Fragrances */}
        <div className="mt-16 sm:mt-20 pt-12 sm:pt-14 border-t border-[#E6DDD1]">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#181614] mb-8">
            Complementary Compositions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Buy Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FAF8F4]/95 backdrop-blur-md border-t border-[#E6DDD1] px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-6px_20px_-10px_rgba(24,22,20,0.12)]">
        <div className="min-w-0">
          <p className="font-serif text-lg leading-tight text-[#181614] truncate">{product.name}</p>
          <p className="text-xs text-[#6E655E] tabular-nums">
            {selectedVolume} · <strong className="text-[#181614]">{formatINR(activeVolumeObj.price)}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product.id, selectedVolume, quantity, true)}
          className="px-5 min-h-[44px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-[11px] font-medium tracking-[0.16em] uppercase whitespace-nowrap shrink-0"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
};
