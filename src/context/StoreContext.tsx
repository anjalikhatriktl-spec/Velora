import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import { saveOrderToSupabase } from '../services/orderService';
import {
  BlogArticle,
  BottleVolume,
  CartItem,
  CodPaymentOption,
  CustomerDetails,
  FragranceCategory,
  OrderRecord,
  PageRoute,
  Product,
} from '../types';

interface ToastMessage {
  id: number;
  message: string;
}

interface StoreContextValue {
  route: PageRoute;
  selectedProductSlug: string;
  shopCategoryFilter: FragranceCategory | 'All';
  shopSearchQuery: string;
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isFilmOpen: boolean;
  quickViewProduct: Product | null;
  activeArticle: BlogArticle | null;
  lastOrder: OrderRecord | null;
  toasts: ToastMessage[];
  cartCount: number;
  cartSubtotal: number;
  navigate: (
    to: PageRoute,
    options?: {
      productSlug?: string;
      category?: FragranceCategory | 'All';
      search?: string;
      scrollToSection?: string;
    }
  ) => void;
  setShopCategoryFilter: (cat: FragranceCategory | 'All') => void;
  setShopSearchQuery: (q: string) => void;
  addToCart: (productId: string, volume?: BottleVolume, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, volume: BottleVolume) => void;
  updateCartQuantity: (productId: string, volume: BottleVolume, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setFilmOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setActiveArticle: (article: BlogArticle | null) => void;
  placeOrder: (customer: CustomerDetails, paymentMethod?: CodPaymentOption) => Promise<OrderRecord>;
  notify: (message: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'velora_cart_v1';
const WISHLIST_STORAGE_KEY = 'velora_wishlist_v1';
const ORDER_STORAGE_KEY = 'velora_last_order_v1';

export function getVolumePrice(product: Product, volume: BottleVolume): number {
  const found = product.volumes.find((v) => v.volume === volume);
  return found ? found.price : product.price;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<PageRoute>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(PRODUCTS[0].slug);
  const [shopCategoryFilter, setShopCategoryFilter] = useState<FragranceCategory | 'All'>('All');
  const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
  const [isCartOpen, setCartOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isFilmOpen, setFilmOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pendingSectionRef = useRef<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return ['velora-enchanted-mirage', 'velora-midnight-whispers'];
  });

  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(() => {
    try {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  useEffect(() => {
    if (lastOrder) {
      try {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(lastOrder));
      } catch {
        // ignore
      }
    }
  }, [lastOrder]);

  // Execute pending section scroll reliably after AnimatePresence route transition finishes
  useEffect(() => {
    if (route !== 'home' || !pendingSectionRef.current) return;
    const sectionId = pendingSectionRef.current;
    let attempts = 0;
    const maxAttempts = 20;

    const tryScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        pendingSectionRef.current = null;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < maxAttempts) {
        window.setTimeout(tryScroll, 50);
      } else {
        pendingSectionRef.current = null;
      }
    };

    const timer = window.setTimeout(tryScroll, 60);
    return () => window.clearTimeout(timer);
  }, [route]);

  const notify = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const navigate: StoreContextValue['navigate'] = (to, options) => {
    if (options?.productSlug) {
      setSelectedProductSlug(options.productSlug);
    }
    if (options?.category !== undefined) {
      setShopCategoryFilter(options.category);
    }
    if (options?.search !== undefined) {
      setShopSearchQuery(options.search);
    }

    setCartOpen(false);
    setSearchOpen(false);
    setQuickViewProduct(null);
    setActiveArticle(null);
    setFilmOpen(false);

    if (options?.scrollToSection && to === 'home') {
      if (route === 'home') {
        window.setTimeout(() => {
          const el = document.getElementById(options.scrollToSection!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 40);
      } else {
        pendingSectionRef.current = options.scrollToSection;
        setRoute('home');
      }
    } else {
      pendingSectionRef.current = null;
      setRoute(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addToCart = (
    productId: string,
    volume: BottleVolume = '50ml',
    quantity = 1,
    openDrawer = true
  ) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    let hitLimit = false;
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === productId && item.volume === volume
      );
      if (existingIdx > -1) {
        const nextQty = prev[existingIdx].quantity + quantity;
        if (nextQty > 10) hitLimit = true;
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(10, nextQty),
        };
        return updated;
      }
      return [...prev, { productId, volume, quantity: Math.min(10, Math.max(1, quantity)) }];
    });

    if (hitLimit) {
      notify(`Maximum 10 bottles per ${product.name} (${volume}) selection`);
    } else {
      notify(`${product.name} (${volume}) added to your bag`);
    }
    if (openDrawer) {
      setCartOpen(true);
    }
  };

  const removeFromCart = (productId: string, volume: BottleVolume) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.volume === volume))
    );
    if (product) {
      notify(`${product.name} (${volume}) removed from bag`);
    }
  };

  const updateCartQuantity = (productId: string, volume: BottleVolume, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, volume);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.volume === volume
          ? { ...item, quantity: Math.min(10, quantity) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        if (product) notify(`${product.name} removed from wishlist`);
        return prev.filter((id) => id !== productId);
      }
      if (product) notify(`${product.name} saved to wishlist`);
      return [...prev, productId];
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((acc, item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return acc;
        return acc + getVolumePrice(product, item.volume) * item.quantity;
      }, 0),
    [cart]
  );

  const placeOrder = async (
    customer: CustomerDetails,
    paymentMethod: CodPaymentOption = 'Cash on Delivery (Cash)'
  ): Promise<OrderRecord> => {
    const items = cart
      .map((item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          volume: item.volume,
          quantity: item.quantity,
          unitPrice: getVolumePrice(product, item.volume),
          image: product.image,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const shippingFee = subtotal >= 2500 || subtotal === 0 ? 0 : 149;
    const orderNumber = `VL-${Math.floor(100000 + Math.random() * 900000)}`;
    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const record: OrderRecord = {
      orderNumber,
      createdAt: new Date().toISOString(),
      customer,
      items,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      paymentMethod,
      estimatedDelivery,
    };

    await saveOrderToSupabase(record);

    setLastOrder(record);
    setCart([]);
    setRoute('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return record;
  };

  return (
    <StoreContext.Provider
      value={{
        route,
        selectedProductSlug,
        shopCategoryFilter,
        shopSearchQuery,
        cart,
        wishlist,
        isCartOpen,
        isSearchOpen,
        isFilmOpen,
        quickViewProduct,
        activeArticle,
        lastOrder,
        toasts,
        cartCount,
        cartSubtotal,
        navigate,
        setShopCategoryFilter,
        setShopSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        setCartOpen,
        setSearchOpen,
        setFilmOpen,
        setQuickViewProduct,
        setActiveArticle,
        placeOrder,
        notify,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
