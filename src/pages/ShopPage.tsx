import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { formatINR } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { FragranceCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { FadeUp } from '../components/MotionPrimitives';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    publicSettings,
    shopCategoryFilter,
    setShopCategoryFilter,
    shopSearchQuery,
    setShopSearchQuery,
  } = useStore();

  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(5000);

  const categoryTabs = useMemo(() => {
    const activeCats = categories
      .filter((c) => c.active)
      .map((c) => c.name as FragranceCategory);
    const fallback: FragranceCategory[] = ['Floral', 'Fresh', 'Woody', 'Oriental'];
    const list = activeCats.length > 0 ? activeCats : fallback;
    return ['All', ...list] as (FragranceCategory | 'All')[];
  }, [categories]);

  const publishedProducts = useMemo(
    () => products.filter((p) => p.published !== false),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = shopSearchQuery.trim().toLowerCase();

    const list = publishedProducts.filter((p) => {
      if (shopCategoryFilter !== 'All' && p.category !== shopCategoryFilter) return false;
      if (p.price > maxPrice) return false;
      if (q) {
        const text = [
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
        if (!text.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [publishedProducts, shopCategoryFilter, shopSearchQuery, maxPrice, sortBy]);

  const resetFilters = () => {
    setShopCategoryFilter('All');
    setShopSearchQuery('');
    setMaxPrice(5000);
    setSortBy('featured');
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Page Header */}
        <FadeUp className="max-w-2xl space-y-3 mb-8 sm:mb-10 lg:mb-12">
          <p className="text-xs tracking-[0.24em] uppercase text-[#9A7742] font-medium">
            VELORA Luxury Boutique · Discover Your Signature Scent
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#181614]">
            The VELORA Collection
          </h1>
          <p className="text-sm sm:text-base text-[#6E655E] leading-relaxed">
            Explore small-batch Eau de Parfum and Extrait de Parfum flacons priced from ₹999
            (30ml) to ₹4,999 (100ml). Complimentary shipping on orders above{' '}
            {formatINR(publicSettings.freeShippingThreshold)}.
          </p>
        </FadeUp>

        {/* Filter & Sort Toolbar */}
        <div className="bg-white border border-[#E6DDD1] p-4 sm:p-6 mb-8 sm:mb-10 space-y-4 sm:space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryTabs.map((cat) => {
                const active = shopCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setShopCategoryFilter(cat)}
                    className={`px-3.5 sm:px-4 min-h-[40px] text-xs tracking-[0.14em] uppercase border transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                        : 'bg-[#FAF8F4] text-[#6E655E] border-[#E6DDD1] hover:text-[#181614] hover:border-[#B8935A]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex items-center border border-[#E6DDD1] bg-[#FAF8F4] px-3 min-h-[44px] w-full sm:min-w-[220px]">
                <Search className="w-4 h-4 text-[#6E655E] mr-2 shrink-0" />
                <input
                  type="text"
                  value={shopSearchQuery}
                  onChange={(e) => setShopSearchQuery(e.target.value)}
                  placeholder="Search notes or name..."
                  aria-label="Search fragrances"
                  className="bg-transparent text-base sm:text-sm text-[#181614] placeholder-[#8A8076] focus:outline-none w-full min-w-0"
                />
                {shopSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setShopSearchQuery('')}
                    aria-label="Clear search"
                    className="text-[#6E655E] hover:text-[#181614] ml-1 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 border border-[#E6DDD1] bg-[#FAF8F4] px-3 min-h-[44px]">
                <SlidersHorizontal className="w-4 h-4 text-[#6E655E] shrink-0" />
                <label htmlFor="shop-sort" className="sr-only">
                  Sort fragrances
                </label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-base sm:text-xs tracking-wider uppercase text-[#181614] focus:outline-none pr-2 w-full sm:w-auto"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price Ceiling Slider */}
          <div className="pt-4 border-t border-[#E6DDD1]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#6E655E]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <label htmlFor="price-range" className="whitespace-nowrap">
                Max 50ml Price:{' '}
                <strong className="text-[#181614] tabular-nums">{formatINR(maxPrice)}</strong>
              </label>
              <input
                id="price-range"
                type="range"
                min={1500}
                max={5000}
                step={250}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-[#181614] w-full sm:w-52 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              <span className="tabular-nums">
                Showing {filteredProducts.length} of {publishedProducts.length} fragrances
              </span>
              {(shopCategoryFilter !== 'All' ||
                shopSearchQuery ||
                maxPrice < 5000 ||
                sortBy !== 'featured') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#9A7742] hover:text-[#181614] underline underline-offset-4 py-1"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E6DDD1] py-16 px-6 text-center space-y-4">
            <h2 className="font-serif text-3xl text-[#181614]">No matching fragrances found</h2>
            <p className="text-sm text-[#6E655E] max-w-md mx-auto">
              Adjust your category filter, search terms, or price ceiling to explore our full
              artisanal collection.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-6 min-h-[46px] bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs tracking-[0.16em] uppercase"
            >
              Show All Fragrances
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
