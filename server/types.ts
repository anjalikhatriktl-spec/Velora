export type UserRole = 'SUPER_ADMIN' | 'ADMIN_MANAGER' | 'EMPLOYEE';

export type BottleVolume = '30ml' | '50ml' | '100ml';

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

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: UserRole;
  employeeId: string | null;
  permissions: AdminModulePermission[];
  active: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  resetTokenHash: string | null;
  resetTokenExpiresAt: string | null;
}

export interface DbEmployee {
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
  bio: string;
  address: string;
  inviteCode: string | null;
  hasAccount: boolean;
  createdAt: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  active: boolean;
}

export interface DbProductVolume {
  volume: BottleVolume;
  price: number;
  originalPrice?: number;
}

export interface DbProduct {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  concentration: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  inCollectionCarousel: boolean;
  published: boolean;
  tag?: string;
  image: string;
  gallery: string[];
  volumes: DbProductVolume[];
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: string;
  sillage: string;
  origin: string;
  stock: Record<BottleVolume, number>;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface DbInventoryMovement {
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

export interface DbCustomer {
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

export interface DbOrderItem {
  productId: string;
  name: string;
  volume: BottleVolume;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface DbOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    notes?: string;
  };
  items: DbOrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'Cash on Delivery (Cash)' | 'Cash on Delivery (UPI on Arrival)';
  status: OrderStatus;
  assignedEmployeeId: string | null;
  assignedEmployeeName: string | null;
  internalNotes: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
    actor: string;
  }[];
  estimatedDelivery: string;
}

export interface DbAttendance {
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

export interface DbLeaveRequest {
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
  reviewedBy: string | null;
  reviewedAt: string | null;
  adminComment: string | null;
  createdAt: string;
}

export interface DbComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface DbTask {
  id: string;
  title: string;
  description: string;
  assignedToEmployeeId: string;
  assignedToName: string;
  assignedBy: string;
  relatedOrderNumber: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed';
  deadline: string;
  comments: DbComment[];
  createdAt: string;
  updatedAt: string;
}

export interface DbEnquiry {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  assignedTo: string | null;
  notes: DbComment[];
  createdAt: string;
}

export interface DbNotification {
  id: string;
  audience: 'admin' | 'employee';
  targetEmployeeId: string | null;
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
  linkRoute?: string;
  createdAt: string;
}

export interface DbWebsiteContent {
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
  testimonials: {
    id: string;
    name: string;
    role: string;
    city: string;
    rating: number;
    quote: string;
    fragrance: string;
    initials: string;
    avatarImage: string;
  }[];
  blogArticles: {
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
  }[];
}

export interface DbNewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface DbActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
  createdAt: string;
}

export interface DbSettings {
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

export interface VeloraDatabase {
  sessionSecret: string;
  users: DbUser[];
  employees: DbEmployee[];
  categories: DbCategory[];
  products: DbProduct[];
  inventoryMovements: DbInventoryMovement[];
  customers: DbCustomer[];
  orders: DbOrder[];
  attendance: DbAttendance[];
  leaveRequests: DbLeaveRequest[];
  tasks: DbTask[];
  enquiries: DbEnquiry[];
  notifications: DbNotification[];
  websiteContent: DbWebsiteContent;
  newsletterSubscribers: DbNewsletterSubscriber[];
  activityLogs: DbActivityLog[];
  settings: DbSettings;
}
