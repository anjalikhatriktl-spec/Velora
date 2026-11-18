import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  Boxes,
  CalendarCheck2,
  CalendarOff,
  ClipboardList,
  ExternalLink,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { PageRoute } from '../../types';
import { VeloraLogo } from '../../components/VeloraLogo';
import {
  EmployeeAttendanceView,
  EmployeeHomeView,
  EmployeeInventoryView,
  EmployeeLeaveView,
  EmployeeNotificationsView,
  EmployeeOrdersView,
  EmployeeProfileView,
  EmployeeSupportView,
  EmployeeTasksView,
  EmployeeWorkspaceData,
} from './EmployeePages';

export const EmployeeLayout: React.FC = () => {
  const { loading, user, logout, refreshAuth } = useAuth();
  const { route, navigate, notify } = useStore();
  const [data, setData] = useState<EmployeeWorkspaceData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loadWorkspace = useCallback(async () => {
    try {
      const res = await fetch('/api/employee/workspace', { credentials: 'include' });
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('employee-login');
      return;
    }
    void loadWorkspace();
  }, [loading, user, navigate, loadWorkspace]);

  useEffect(() => {
    if (!user) return;
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events');
      es.addEventListener('dashboard_updated', () => {
        void loadWorkspace();
      });
    } catch {
      // ignore
    }
    return () => es?.close();
  }, [user, loadWorkspace]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center text-sm text-[#6E655E]">
        Loading VELORA Employee Workspace...
      </div>
    );
  }
  if (!user) return null;

  const navItems: {
    route: PageRoute;
    label: string;
    icon: React.FC<{ className?: string }>;
    visible?: boolean;
  }[] = [
    { route: 'employee-dashboard', label: 'My Dashboard', icon: LayoutDashboard, visible: true },
    { route: 'employee-profile', label: 'My Profile', icon: User, visible: true },
    { route: 'employee-attendance', label: 'My Attendance', icon: CalendarCheck2, visible: true },
    { route: 'employee-tasks', label: 'My Tasks', icon: ClipboardList, visible: true },
    { route: 'employee-orders', label: 'Assigned Orders', icon: ShoppingBag, visible: true },
    {
      route: 'employee-support',
      label: 'Customer Support',
      icon: Headphones,
      visible: data?.permissions.support ?? false,
    },
    {
      route: 'employee-inventory',
      label: 'Inventory Access',
      icon: Boxes,
      visible: data?.permissions.inventory ?? false,
    },
    { route: 'employee-leave', label: 'Leave Requests', icon: CalendarOff, visible: true },
    { route: 'employee-notifications', label: 'Notifications', icon: Bell, visible: true },
  ];

  const visibleNav = navItems.filter((i) => i.visible !== false);
  const unreadCount = data?.notifications.filter((n) => !n.read).length ?? 0;
  const activeNav = navItems.find((n) => n.route === route) || navItems[0];

  const handleLogout = async () => {
    await logout();
    navigate('employee-login');
  };

  const renderSection = () => {
    if (fetching || !data) {
      return (
        <div className="bg-white border border-[#E6DDD1] p-12 text-center text-sm text-[#6E655E]">
          Loading your shift and task workspace...
        </div>
      );
    }

    switch (route) {
      case 'employee-dashboard':
        return (
          <EmployeeHomeView
            data={data}
            onRefresh={loadWorkspace}
            onNavigate={(r) => navigate(r)}
            onNotify={notify}
          />
        );
      case 'employee-profile':
        return (
          <EmployeeProfileView
            data={data}
            onRefresh={loadWorkspace}
            onRefreshAuth={refreshAuth}
            onNotify={notify}
          />
        );
      case 'employee-attendance':
        return (
          <EmployeeAttendanceView data={data} onRefresh={loadWorkspace} onNotify={notify} />
        );
      case 'employee-tasks':
        return <EmployeeTasksView data={data} onRefresh={loadWorkspace} onNotify={notify} />;
      case 'employee-orders':
        return <EmployeeOrdersView data={data} onRefresh={loadWorkspace} onNotify={notify} />;
      case 'employee-support':
        return <EmployeeSupportView data={data} onRefresh={loadWorkspace} onNotify={notify} />;
      case 'employee-inventory':
        return <EmployeeInventoryView data={data} onRefresh={loadWorkspace} onNotify={notify} />;
      case 'employee-leave':
        return <EmployeeLeaveView data={data} onRefresh={loadWorkspace} onNotify={notify} />;
      case 'employee-notifications':
        return <EmployeeNotificationsView data={data} onRefresh={loadWorkspace} />;
      default:
        return (
          <EmployeeHomeView
            data={data}
            onRefresh={loadWorkspace}
            onNavigate={(r) => navigate(r)}
            onNotify={notify}
          />
        );
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#141210] text-[#E6DDD1]">
      <div className="px-5 py-5 border-b border-[#2D2824] flex items-center justify-between">
        <div>
          <VeloraLogo tone="light" size="sm" />
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#B8935A] mt-1">
            Staff Portal
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
              {item.route === 'employee-notifications' && unreadCount > 0 && (
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
          className="w-full flex items-center justify-center gap-2 py-2 border border-[#2D2824] text-[#E6DDD1] hover:border-[#B8935A]"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Storefront
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 bg-[#1F1B18] text-[#E6DDD1] hover:text-[#B8935A]"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#181614] flex">
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

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

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-[#E6DDD1] px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 border border-[#E6DDD1]"
              aria-label="Open staff sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#181614] leading-none">
                {activeNav.label}
              </h1>
              <p className="text-[11px] text-[#6E655E] mt-0.5 hidden sm:block">
                {data?.profile
                  ? `${data.profile.employeeCode} · ${data.profile.department}`
                  : 'VELORA Staff Portal'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('employee-notifications')}
              aria-label="Employee Notifications"
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
                {data?.profile?.designation || user.role}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{renderSection()}</main>
      </div>
    </div>
  );
};
