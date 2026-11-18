import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Boxes,
  CalendarCheck2,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
  FolderTree,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { AdminModulePermission, PageRoute } from '../../types';
import { VeloraLogo } from '../../components/VeloraLogo';
import { AdminOverviewData } from './AdminTypes';
import { AdminAnalyticsView, AdminOverviewView } from './AdminOverviewAndAnalytics';
import { AdminOrdersPage } from './AdminOrdersPage';
import {
  AdminCategoriesView,
  AdminInventoryView,
  AdminProductsView,
} from './AdminCatalogPages';
import {
  AdminAttendanceView,
  AdminCustomersView,
  AdminEmployeesView,
  AdminTasksView,
} from './AdminPeoplePages';
import {
  AdminNotificationsView,
  AdminReportsView,
  AdminSettingsView,
  AdminWebsiteView,
} from './AdminSystemPages';

interface AdminNavItem {
  route: PageRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
  permission?: AdminModulePermission;
}

const ADMIN_NAV: AdminNavItem[] = [
  { route: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'admin-analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics' },
  { route: 'admin-orders', label: 'Orders', icon: ShoppingBag, permission: 'orders' },
  { route: 'admin-products', label: 'Products', icon: Package, permission: 'products' },
  { route: 'admin-categories', label: 'Categories', icon: FolderTree, permission: 'categories' },
  { route: 'admin-inventory', label: 'Inventory', icon: Boxes, permission: 'inventory' },
  { route: 'admin-customers', label: 'Customers', icon: Users, permission: 'customers' },
  { route: 'admin-employees', label: 'Employees', icon: UserCog, permission: 'employees' },
  { route: 'admin-attendance', label: 'Attendance & Leave', icon: CalendarCheck2, permission: 'attendance' },
  { route: 'admin-tasks', label: 'Tasks', icon: ClipboardList, permission: 'tasks' },
  { route: 'admin-website', label: 'Website Management', icon: Globe, permission: 'website' },
  { route: 'admin-reports', label: 'Reports', icon: FileSpreadsheet, permission: 'reports' },
  { route: 'admin-notifications', label: 'Notifications', icon: Bell },
  { route: 'admin-settings', label: 'Settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const { loading, user, logout, refreshAuth } = useAuth();
  const { route, navigate, refreshStorefront, notify } = useStore();
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) {
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('admin-login');
      return;
    }
    if (user.role === 'EMPLOYEE') {
      return;
    }
    void loadOverview();
  }, [loading, user, navigate, loadOverview]);

  useEffect(() => {
    if (!user || user.role === 'EMPLOYEE') return;
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events');
      es.addEventListener('dashboard_updated', () => {
        void loadOverview();
      });
    } catch {
      // ignore SSE errors
    }
    return () => es?.close();
  }, [user, loadOverview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center text-sm text-[#6E655E]">
        Verifying VELORA executive session...
      </div>
    );
  }

  if (!user) return null;

  if (user.role === 'EMPLOYEE') {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <VeloraLogo tone="dark" size="md" />
        <h1 className="font-serif text-3xl text-[#181614]">Restricted Executive Area</h1>
        <p className="text-sm text-[#6E655E] max-w-md">
          Your account role ({user.role}) does not have Admin Dashboard privileges.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('employee-dashboard')}
            className="px-6 py-3 bg-[#181614] text-[#FAF8F4] text-xs uppercase tracking-wider"
          >
            Open Employee Workspace
          </button>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="px-6 py-3 border border-[#E6DDD1] text-xs uppercase tracking-wider"
          >
            Return Storefront
          </button>
        </div>
      </div>
    );
  }

  const visibleNav = ADMIN_NAV.filter((item) => {
    if (!item.permission || user.role === 'SUPER_ADMIN') return true;
    return user.permissions.includes(item.permission);
  });

  const unreadCount = data?.notifications.filter((n) => !n.read).length ?? 0;
  const activeNav = ADMIN_NAV.find((n) => n.route === route) || ADMIN_NAV[0];

  const handleLogout = async () => {
    await logout();
    navigate('admin-login');
  };

  const renderSection = () => {
    if (fetching || !data) {
      return (
        <div className="bg-white border border-[#E6DDD1] p-12 text-center text-sm text-[#6E655E]">
          Loading VELORA real-time operational data...
        </div>
      );
    }

    switch (route) {
      case 'admin-dashboard':
        return <AdminOverviewView data={data} onNavigate={(r) => navigate(r)} />;
      case 'admin-analytics':
        return <AdminAnalyticsView data={data} />;
      case 'admin-orders':
        return <AdminOrdersPage data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-products':
        return <AdminProductsView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-categories':
        return <AdminCategoriesView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-inventory':
        return <AdminInventoryView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-customers':
        return <AdminCustomersView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-employees':
        return <AdminEmployeesView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-attendance':
        return <AdminAttendanceView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-tasks':
        return <AdminTasksView data={data} onRefresh={loadOverview} onNotify={notify} />;
      case 'admin-website':
        return (
          <AdminWebsiteView
            data={data}
            currentUser={user}
            onRefresh={loadOverview}
            onRefreshStorefront={refreshStorefront}
            onRefreshAuth={refreshAuth}
            onNotify={notify}
          />
        );
      case 'admin-reports':
        return <AdminReportsView data={data} onNotify={notify} />;
      case 'admin-notifications':
        return <AdminNotificationsView data={data} onRefresh={loadOverview} />;
      case 'admin-settings':
        return (
          <AdminSettingsView
            data={data}
            currentUser={user}
            onRefresh={loadOverview}
            onRefreshStorefront={refreshStorefront}
            onRefreshAuth={refreshAuth}
            onNotify={notify}
          />
        );
      default:
        return <AdminOverviewView data={data} onNavigate={(r) => navigate(r)} />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#141210] text-[#E6DDD1]">
      <div className="px-5 py-5 border-b border-[#2D2824] flex items-center justify-between">
        <div>
          <VeloraLogo tone="light" size="sm" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#B8935A] mt-1">
            Executive Console
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(false)}
          className="lg:hidden text-[#E6DDD1] p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = route === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                navigate(item.route);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs tracking-[0.06em] transition-colors ${
                active
                  ? 'bg-[#B8935A] text-[#141210] font-semibold'
                  : 'text-[#C8BEB2] hover:bg-[#1F1B18] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </span>
              {item.route === 'admin-notifications' && unreadCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] tabular-nums ${
                    active ? 'bg-[#141210] text-[#FAF8F4]' : 'bg-[#B8935A] text-[#141210]'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2D2824] space-y-2 text-xs">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="w-full flex items-center justify-center gap-2 py-2 border border-[#2D2824] text-[#E6DDD1] hover:border-[#B8935A] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Storefront
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#1F1B18] text-[#E6DDD1] hover:text-[#B8935A] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#181614] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-50 bg-[#141210]/60 lg:hidden flex"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-72 h-full">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-[#E6DDD1] px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 border border-[#E6DDD1]"
              aria-label="Open admin sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#181614] leading-none">
                {activeNav.label}
              </h1>
              <p className="text-[11px] text-[#6E655E] mt-0.5 hidden sm:block">
                VELORA Luxury Perfumes · India Operations (INR ₹ · COD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('admin-notifications')}
              aria-label="Admin Notifications"
              className="relative w-10 h-10 flex items-center justify-center border border-[#E6DDD1] bg-[#FAF8F4] hover:border-[#B8935A]"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#B8935A] text-[#141210] text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-[#181614]">{user.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#9A7742]">
                {user.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{renderSection()}</main>
      </div>
    </div>
  );
};
