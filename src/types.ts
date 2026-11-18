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
  | 'wishlist'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-analytics'
  | 'admin-orders'
  | 'admin-products'
  | 'admin-categories'
  | 'admin-inventory'
  | 'admin-customers'
  | 'admin-employees'
  | 'admin-attendance'
  | 'admin-tasks'
  | 'admin-website'
  | 'admin-reports'
  | 'admin-notifications'
  | 'admin-settings'
  | 'employee-login'
  | 'employee-dashboard'
  | 'employee-profile'
  | 'employee-attendance'
  | 'employee-tasks'
  | 'employee-orders'
  | 'employee-support'
  | 'employee-inventory'
  | 'employee-leave'
  | 'employee-notifications';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'EMPLOYEE';

export type AdminModulePermission =
  | 'analytics'
  | 'orders'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'customers'
  | 'employees'
  | 'attendance'
  | 'tasks'
  | 'website'
  | 'reports'
  | 'settings'
  | 'support';

export type EmployeeDepartment =
  | 'Order Management'
  | 'Customer Support'
  | 'Inventory Management'
  | 'Sales & Marketing'
  | 'Packing & Dispatch';

export type OrderStatus =
  | 'New Order'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface VolumeOption {
  volume: BottleVolume;
  price: number;
  originalPrice?: number;
  stock?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: FragranceCategory | string;
  concentration: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  inCollectionCarousel: boolean;
  published?: boolean;
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
  stock?: Record<BottleVolume, number>;
  lowStockThreshold?: number;
  updatedAt?: string;
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

export interface OrderItemLine {
  productId: string;
  name: string;
  volume: BottleVolume;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface OrderRecord {
  id?: string;
  orderNumber: string;
  createdAt: string;
  customerId?: string;
  customer: CustomerDetails;
  items: OrderItemLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: CodPaymentOption;
  status?: OrderStatus;
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  internalNotes?: string;
  statusHistory?: OrderStatusHistoryEntry[];
  estimatedDelivery: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  active: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  volume: BottleVolume;
  type: 'stock_in' | 'stock_out' | 'adjustment';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actorName: string;
  actorRole: string;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  registeredAt: string;
  lastOrderAt: string;
}

export interface EmployeeRecord {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: EmployeeDepartment;
  salary: number;
  role: 'ADMIN_MANAGER' | 'EMPLOYEE';
  permissions: AdminModulePermission[];
  status: 'Active' | 'Inactive';
  joiningDate: string;
  avatarUrl: string;
  bio?: string;
  address?: string;
  inviteCode?: string | null;
  hasAccount: boolean;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: EmployeeDepartment;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
  notes?: string;
}

export interface LeaveRequestRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: EmployeeDepartment;
  startDate: string;
  endDate: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Emergency';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  adminComment?: string | null;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  assignedToEmployeeId: string;
  assignedToName: string;
  assignedBy: string;
  relatedOrderNumber?: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportEnquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  assignedTo?: string | null;
  notes: TaskComment[];
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  audience: 'admin' | 'employee';
  targetEmployeeId?: string | null;
  type:
    | 'new_order'
    | 'low_stock'
    | 'cancelled_order'
    | 'new_customer'
    | 'leave_request'
    | 'leave_update'
    | 'employee_activity'
    | 'task_assigned'
    | 'order_assigned'
    | 'announcement';
  title: string;
  message: string;
  read: boolean;
  linkRoute?: PageRoute;
  createdAt: string;
}

export interface WebsiteContent {
  announcementBar: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubtitle: string;
  heroImage: string;
  brandStoryEyebrow: string;
  brandStoryHeading: string;
  brandStoryBody: string;
  promoBannerEyebrow: string;
  promoBannerHeading: string;
  promoBannerText: string;
  promoBannerImage: string;
  newsletterHeading: string;
  footerDescription: string;
  contactEmail: string;
  contactPhone: string;
  boutiqueAddress: string;
  boutiqueHours: string;
  testimonials: Testimonial[];
  blogArticles: BlogArticle[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  gstNumber: string;
  currency: 'INR';
  codEnabled: boolean;
  codFee: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRatePercent: number;
  autoDeductStockOnOrder: boolean;
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  defaultEmployeePermissions: AdminModulePermission[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string | null;
  permissions: AdminModulePermission[];
  active: boolean;
  lastLoginAt?: string | null;
}
