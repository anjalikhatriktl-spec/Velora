import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BLOG_ARTICLES, PRODUCTS as DEFAULT_PRODUCTS, TESTIMONIALS } from '../data/catalog';
import { resolveMediaUrl } from '../lib/mediaAssets';
import { saveOrderToSupabase } from '../services/orderService';
import {
  BlogArticle,
  BottleVolume,
  CartItem,
  CategoryRecord,
  CodPaymentOption,
  CustomerDetails,
  FragranceCategory,
  OrderRecord,
  PageRoute,
  Product,
  WebsiteContent,
} from '../types';

interface ToastMessage {
  id: number;
  message: string;
}

interface PublicStoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  currency: 'INR';
  codEnabled: boolean;
  codFee: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
}

interface StoreContextValue {
  route: PageRoute;
  selectedProductSlug: string;
  shopCategoryFilter: FragranceCategory | 'All';
  shopSearchQuery: string;
  products: Product[];
  categories: CategoryRecord[];
  websiteContent: WebsiteContent;
  publicSettings: PublicStoreSettings;
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
  refreshStorefront: () => Promise<void>;
  notify: (message: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'velora_cart_v1';
const WISHLIST_STORAGE_KEY = 'velora_wishlist_v1';
const ORDER_STORAGE_KEY = 'velora_last_order_v1';

const ROUTE_TO_PATH: Record<PageRoute, string> = {
  home: '/',
  shop: '/shop',
  product: '/product',
  about: '/about',
  blog: '/blog',
  contact: '/contact',
  checkout: '/checkout',
  confirmation: '/confirmation',
  wishlist: '/wishlist',
  'admin-login': '/admin/login',
  'admin-dashboard': '/admin/dashboard',
  'admin-analytics': '/admin/analytics',
  'admin-orders': '/admin/orders',
  'admin-products': '/admin/products',
  'admin-categories': '/admin/categories',
  'admin-inventory': '/admin/inventory',
  'admin-customers': '/admin/customers',
  'admin-employees': '/admin/employees',
  'admin-attendance': '/admin/attendance',
  'admin-tasks': '/admin/tasks',
  'admin-website': '/admin/website',
  'admin-reports': '/admin/reports',
  'admin-notifications': '/admin/notifications',
  'admin-settings': '/admin/settings',
  'employee-login': '/employee/login',
  'employee-dashboard': '/employee/dashboard',
  'employee-profile': '/employee/profile',
  'employee-attendance': '/employee/attendance',
  'employee-tasks': '/employee/tasks',
  'employee-orders': '/employee/orders',
  'employee-support': '/employee/support',
  'employee-inventory': '/employee/inventory',
  'employee-leave': '/employee/leave',
  'employee-notifications': '/employee/notifications',
};

export function parseLocationToRoute(pathname: string): {
  route: PageRoute;
  productSlug?: string;
} {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean.startsWith('/product/')) {
    return { route: 'product', productSlug: clean.slice('/product/'.length) };
  }
  const entries = Object.entries(ROUTE_TO_PATH) as [PageRoute, string][];
  for (const [r, p] of entries) {
    if (p === clean) return { route: r };
  }
  if (clean === '/admin') return { route: 'admin-dashboard' };
  if (clean === '/employee') return { route: 'employee-dashboard' };
  return { route: 'home' };
}

const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  announcementBar: 'Complimentary Shipping Above ₹2,500',
  heroEyebrow: 'DISCOVER YOUR SIGNATURE SCENT',
  heroHeading: 'Discover the World of VELORA',
  heroSubtitle:
    "Luxury is not just what you wear. It's the fragrance you leave behind. Every numbered VELORA flacon holds a timeless olfactory signature designed to linger gracefully from morning light until midnight.",
  heroImage: 'asset:hero',
  brandStoryEyebrow: 'Every Scent Tells a Story',
  brandStoryHeading: 'Welcome to VELORA – Where Every Fragrance Becomes a Memory.',
  brandStoryBody:
    "At VELORA, we believe fragrance is more than a scent. It is an expression of personality, elegance and individuality. Born between classic European flower houses and India's richest botanical estates, we distill without haste until every accord achieves effortless harmony.",
  promoBannerEyebrow: 'Limited Seasonal Reserve',
  promoBannerHeading: 'Sweet Aromas of Elegance',
  promoBannerText:
    'Discover golden saffron, sun-drenched marigold, and aged Madagascar vanilla distilled for evening rituals. Enjoy complimentary artisan gift wrapping on all 50ml and 100ml flacons.',
  promoBannerImage: 'asset:campaign',
  newsletterHeading: 'Stay in the World of VELORA',
  footerDescription:
    'VELORA brings you an exclusive fragrance experience crafted for those who appreciate elegance, luxury and individuality.',
  contactEmail: 'concierge@velorafragrances.in',
  contactPhone: '+91 22 4890 3172',
  boutiqueAddress: '14 Kala Ghoda Precinct, Fort, Mumbai 400001',
  boutiqueHours: 'Mon – Sat · 10:00 – 20:00 IST',
  testimonials: TESTIMONIALS,
  blogArticles: BLOG_ARTICLES,
};

const DEFAULT_PUBLIC_SETTINGS: PublicStoreSettings = {
  storeName: 'VELORA Parfums India',
  storeEmail: 'concierge@velorafragrances.in',
  storePhone: '+91 22 4890 3172',
  currency: 'INR',
  codEnabled: true,
  codFee: 0,
  freeShippingThreshold: 2500,
  standardShippingFee: 149,
};

function hydrateProductMedia(prod: Product): Product {
  return {
    ...prod,
    image: resolveMediaUrl(prod.image),
    gallery: (prod.gallery || [prod.image]).map((img) => resolveMediaUrl(img)),
  };
}

export function getVolumePrice(product: Product, volume: BottleVolume): number {
  const found = product.volumes.find((v) => v.volume === volume);
  return found ? found.price : product.price;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialParsed = useMemo(() => parseLocationToRoute(window.location.pathname), []);
  const [route, setRoute] = useState<PageRoute>(initialParsed.route);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(
    initialParsed.productSlug || DEFAULT_PRODUCTS[0].slug
  );
  const [shopCategoryFilter, setShopCategoryFilter] = useState<FragranceCategory | 'All'>('All');
  const [shopSearchQuery, setShopSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(DEFAULT_WEBSITE_CONTENT);
  const [publicSettings, setPublicSettings] =
    useState<PublicStoreSettings>(DEFAULT_PUBLIC_SETTINGS);

  const [isCartOpen, setCartOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isFilmOpen, setFilmOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pendingSectionRef = useRef<string | null>(null);

  const refreshStorefront = useCallback(async () => {
    try {
      const res = await fetch('/api/storefront/bootstrap');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products.map(hydrateProductMedia));
      }
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
      if (data.websiteContent) {
        setWebsiteContent({
          ...DEFAULT_WEBSITE_CONTENT,
          ...data.websiteContent,
          heroImage: resolveMediaUrl(data.websiteContent.heroImage),
          promoBannerImage: resolveMediaUrl(data.websiteContent.promoBannerImage),
          testimonials: (data.websiteContent.testimonials || TESTIMONIALS).map(
            (t: WebsiteContent['testimonials'][number]) => ({
              ...t,
              avatarImage: resolveMediaUrl(t.avatarImage),
            })
          ),
          blogArticles: (data.websiteContent.blogArticles || BLOG_ARTICLES).map(
            (a: BlogArticle) => ({
              ...a,
              image: resolveMediaUrl(a.image),
            })
          ),
        });
      }
      if (data.publicSettings) {
        setPublicSettings(data.publicSettings);
      }
    } catch {
      // fallback gracefully to bundled catalog
    }
  }, []);

  useEffect(() => {
    void refreshStorefront();

    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource('/api/events');
      evtSource.addEventListener('storefront_updated', () => {
        void refreshStorefront();
      });
    } catch {
      // ignore SSE errors if unavailable
    }
    return () => {
      evtSource?.close();
    };
  }, [refreshStorefront]);

  // Browser back/forward popstate support
  useEffect(() => {
    const onPopState = () => {
      const parsed = parseLocationToRoute(window.location.pathname);
      setRoute(parsed.route);
      if (parsed.productSlug) {
        setSelectedProductSlug(parsed.productSlug);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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

    const targetPath =
      to === 'product'
        ? `/product/${options?.productSlug || selectedProductSlug}`
        : ROUTE_TO_PATH[to] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }

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
    const product = products.find((p) => p.id === productId);
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
    const product = products.find((p) => p.id === productId);
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
    const product = products.find((p) => p.id === productId);
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
        const product = products.find((p) => p.id === item.productId);
        if (!product) return acc;
        return acc + getVolumePrice(product, item.volume) * item.quantity;
      }, 0),
    [cart, products]
  );

  const placeOrder = async (
    customer: CustomerDetails,
    paymentMethod: CodPaymentOption = 'Cash on Delivery (Cash)'
  ): Promise<OrderRecord> => {
    const items = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
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
    const shippingFee =
      subtotal >= publicSettings.freeShippingThreshold || subtotal === 0
        ? 0
        : publicSettings.standardShippingFee;
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

    // Persist to VELORA full-stack backend database (creates customer, updates inventory, notifies staff)
    const apiRes = await fetch('/api/storefront/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        customer,
        items: cart,
        paymentMethod,
        estimatedDelivery,
      }),
    });
    const apiJson = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      throw new Error(apiJson.error || 'Unable to place your order right now.');
    }

    // Also mirror to Supabase when configured
    await saveOrderToSupabase(record).catch((err) => {
      console.warn('Supabase mirror skipped or failed:', err);
    });

    setLastOrder(record);
    setCart([]);
    navigate('confirmation');
    return record;
  };

  return (
    <StoreContext.Provider
      value={{
        route,
        selectedProductSlug,
        shopCategoryFilter,
        shopSearchQuery,
        products,
        categories,
        websiteContent,
        publicSettings,
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
        refreshStorefront,
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
