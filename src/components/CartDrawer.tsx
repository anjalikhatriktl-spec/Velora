import React, { useEffect } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatINR, PRODUCTS } from '../data/catalog';
import { getVolumePrice, useStore } from '../context/StoreContext';
import { SafeImage } from './SafeImage';
import { LUXURY_EASE } from './MotionPrimitives';
import { VeloraLogo } from './VeloraLogo';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    navigate,
  } = useStore();

  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, setCartOpen]);

  const freeShippingThreshold = 2500;
  const remainingForFree = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPct = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-[#141210]/55 backdrop-blur-xs"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="VELORA Shopping Bag"
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:max-w-md bg-[#FAF8F4] text-[#181614] flex flex-col shadow-2xl border-l border-[#E6DDD1]"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E6DDD1] flex items-center justify-between">
              <div>
                <VeloraLogo tone="dark" size="sm" className="mb-1" />
                <h2 className="font-serif text-xl sm:text-2xl font-medium">Your Shopping Bag</h2>
                <p className="text-xs text-[#6E655E] mt-0.5 tabular-nums">
                  {cart.reduce((s, i) => s + i.quantity, 0)} item(s) selected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close shopping bag"
                className="w-11 h-11 flex items-center justify-center text-[#181614] hover:text-[#9A7742] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complimentary Delivery Progress */}
            {cart.length > 0 && (
              <div className="px-4 sm:px-6 py-3.5 bg-[#F2ECE4] border-b border-[#E6DDD1]">
                <p className="text-xs text-[#2B2623] mb-2">
                  {remainingForFree === 0
                    ? 'You have unlocked complimentary insured VELORA delivery.'
                    : `Add ${formatINR(remainingForFree)} more for complimentary delivery.`}
                </p>
                <div className="h-1 w-full bg-[#E6DDD1] overflow-hidden">
                  <div
                    className="h-full bg-[#B8935A] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 divide-y divide-[#E6DDD1]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 flex items-center justify-center bg-[#F2ECE4] text-[#9A7742] mb-4">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#181614] mb-2">
                    Your VELORA bag is currently empty
                  </h3>
                  <p className="text-sm text-[#6E655E] max-w-xs mb-6">
                    Explore VELORA&rsquo;s luxury Eau de Parfum and Extrait collections to discover
                    your signature scent.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('shop')}
                    className="px-6 min-h-[46px] text-xs font-medium tracking-[0.16em] uppercase bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors"
                  >
                    Explore Fragrances
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const product = PRODUCTS.find((p) => p.id === item.productId);
                  if (!product) return null;
                  const unitPrice = getVolumePrice(product, item.volume);

                  return (
                    <div
                      key={`${item.productId}-${item.volume}`}
                      className="py-5 first:pt-1 flex gap-3.5 sm:gap-4"
                    >
                      <button
                        type="button"
                        onClick={() => navigate('product', { productSlug: product.slug })}
                        className="w-20 h-24 bg-[#F2ECE4] shrink-0 overflow-hidden"
                      >
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </button>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => navigate('product', { productSlug: product.slug })}
                              className="font-serif text-lg font-medium text-[#181614] hover:text-[#9A7742] text-left truncate"
                            >
                              {product.name}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId, item.volume)}
                              aria-label={`Remove ${product.name}`}
                              className="text-[#6E655E] hover:text-[#181614] p-2 -mr-2 -mt-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-[#6E655E] mt-0.5">
                            {item.volume} · {product.concentration}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-[#E6DDD1] bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.productId, item.volume, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="w-10 h-10 flex items-center justify-center text-[#181614] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.productId, item.volume, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                              className="w-10 h-10 flex items-center justify-center text-[#181614] hover:bg-[#F2ECE4] transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-semibold text-[#181614] tabular-nums">
                            {formatINR(unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-[#E6DDD1] bg-white space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between text-[#6E655E]">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-[#181614]">
                      {formatINR(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#6E655E]">
                    <span>Delivery</span>
                    <span className="tabular-nums">
                      {remainingForFree === 0 ? 'Complimentary' : formatINR(149)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('checkout')}
                  className="w-full min-h-[48px] px-6 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
