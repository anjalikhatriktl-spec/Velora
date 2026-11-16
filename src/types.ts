export type FragranceCategory = 'Floral' | 'Fresh' | 'Woody' | 'Oriental';

export type BottleVolume = '30ml' | '50ml' | '100ml';

export type PageRoute =
  | 'home'
  | 'shop'
  | 'product'
  | 'about'
  | 'blog'
  | 'contact'
  | 'checkout'
  | 'confirmation'
  | 'wishlist';

export interface VolumeOption {
  volume: BottleVolume;
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: FragranceCategory;
  concentration: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  inCollectionCarousel: boolean;
  tag?: string;
  image: string;
  gallery: string[];
  volumes: VolumeOption[];
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: string;
  sillage: string;
  origin: string;
}

export interface IngredientCard {
  id: string;
  name: string;
  botanicalName: string;
  origin: string;
  category: FragranceCategory;
  description: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: FragranceCategory;
  caption: string;
  image: string;
  aspect: 'tall' | 'wide' | 'square';
  productId: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  rating: number;
  quote: string;
  fragrance: string;
  initials: string;
  avatarImage: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  content: string[];
  image: string;
}

export interface CartItem {
  productId: string;
  volume: BottleVolume;
  quantity: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes?: string;
}

export type CodPaymentOption =
  | 'Cash on Delivery (Cash)'
  | 'Cash on Delivery (UPI on Arrival)';

export interface OrderRecord {
  supabaseOrderId?: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerDetails;
  items: {
    productId: string;
    name: string;
    volume: BottleVolume;
    quantity: number;
    unitPrice: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: CodPaymentOption;
  estimatedDelivery: string;
}
