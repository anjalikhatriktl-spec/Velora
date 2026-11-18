import {
  ActivityLog,
  AttendanceRecord,
  CategoryRecord,
  CustomerRecord,
  EmployeeRecord,
  InventoryMovement,
  LeaveRequestRecord,
  NewsletterSubscriber,
  NotificationRecord,
  OrderRecord,
  Product,
  StoreSettings,
  SupportEnquiry,
  TaskRecord,
  WebsiteContent,
} from '../../types';

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalEmployees: number;
}

export interface AdminOverviewData {
  stats: AdminDashboardStats;
  orders: OrderRecord[];
  products: Product[];
  categories: CategoryRecord[];
  inventoryMovements: InventoryMovement[];
  customers: CustomerRecord[];
  employees: EmployeeRecord[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequestRecord[];
  tasks: TaskRecord[];
  enquiries: SupportEnquiry[];
  notifications: NotificationRecord[];
  websiteContent: WebsiteContent | null;
  newsletterSubscribers: NewsletterSubscriber[];
  activityLogs: ActivityLog[];
  settings: StoreSettings | null;
}
