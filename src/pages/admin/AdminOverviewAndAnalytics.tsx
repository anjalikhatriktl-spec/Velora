import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Clock,
  Package,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../../data/catalog';
import { formatDateIN, formatDateTimeIN, getStatusTone } from '../../lib/dashboardUtils';
import { resolveMediaUrl } from '../../lib/mediaAssets';
import { PageRoute } from '../../types';
import { AdminOverviewData } from './AdminTypes';

interface OverviewProps {
  data: AdminOverviewData;
  onNavigate: (route: PageRoute) => void;
}

export const AdminOverviewView: React.FC<OverviewProps> = ({ data, onNavigate }) => {
  const { stats, orders, products, attendance, activityLogs } = data;

  const lowStockItems = useMemo(() => {
    const alerts: { productName: string; volume: string; qty: number; threshold: number }[] = [];
    for (const p of products) {
      const thresh = p.lowStockThreshold ?? 10;
      const stock = p.stock || { '30ml': 0, '50ml': 0, '100ml': 0 };
      (['30ml', '50ml', '100ml'] as const).forEach((vol) => {
        if ((stock[vol] ?? 0) <= thresh) {
          alerts.push({ productName: p.name, volume: vol, qty: stock[vol] ?? 0, threshold: thresh });
        }
      });
    }
    return alerts.slice(0, 6);
  }, [products]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = useMemo(
    () => attendance.filter((a) => a.date === todayStr),
    [attendance, todayStr]
  );

  const kpis = [
    {
      label: 'Total Revenue',
      value: formatINR(stats.totalRevenue),
      sub: 'Active & Delivered COD Orders',
      icon: Banknote,
      target: 'admin-analytics' as PageRoute,
    },
    {
      label: 'Total Orders',
      value: String(stats.totalOrders),
      sub: 'All recorded customer orders',
      icon: ShoppingBag,
      target: 'admin-orders' as PageRoute,
    },
    {
      label: 'Total Products',
      value: String(stats.totalProducts),
      sub: 'Active catalog compositions',
      icon: Package,
      target: 'admin-products' as PageRoute,
    },
    {
      label: 'Total Customers',
      value: String(stats.totalCustomers),
      sub: 'Registered India buyers',
      icon: Users,
      target: 'admin-customers' as PageRoute,
    },
    {
      label: 'Pending Orders',
      value: String(stats.pendingOrders),
      sub: 'Awaiting dispatch or delivery',
      icon: Clock,
      target: 'admin-orders' as PageRoute,
    },
    {
      label: 'Delivered Orders',
      value: String(stats.deliveredOrders),
      sub: 'Completed COD fulfillments',
      icon: CheckCircle2,
      target: 'admin-orders' as PageRoute,
    },
    {
      label: 'Cancelled / Returned',
      value: String(stats.cancelledOrders),
      sub: 'Closed or restored stock',
      icon: XCircle,
      target: 'admin-orders' as PageRoute,
    },
    {
      label: 'Active Employees',
      value: String(stats.totalEmployees),
      sub: 'Across 5 VELORA departments',
      icon: UserCheck,
      target: 'admin-employees' as PageRoute,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 8 Real-Time Business Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => onNavigate(kpi.target)}
              className="group text-left bg-white border border-[#E6DDD1] hover:border-[#B8935A] p-5 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-[#6E655E] font-medium">
                  {kpi.label}
                </span>
                <span className="w-8 h-8 flex items-center justify-center bg-[#FAF8F4] border border-[#E6DDD1] text-[#9A7742] group-hover:bg-[#181614] group-hover:text-[#FAF8F4] transition-colors">
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="font-serif text-3xl text-[#181614] tabular-nums font-medium">
                  {kpi.value}
                </p>
                <p className="text-xs text-[#6E655E] mt-1 flex items-center justify-between">
                  <span>{kpi.sub}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9A7742] opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Middle Grid: Recent Orders & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-8 bg-white border border-[#E6DDD1]">
          <div className="px-5 py-4 border-b border-[#E6DDD1] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#181614]">Recent Orders</h2>
              <p className="text-xs text-[#6E655E]">Latest COD purchases and fulfillment status</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin-orders')}
              className="text-xs uppercase tracking-[0.15em] text-[#9A7742] hover:text-[#181614] font-medium"
            >
              Manage All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDD1]">
                {orders.slice(0, 6).map((ord) => (
                  <tr key={ord.orderNumber} className="hover:bg-[#FAF8F4]/70">
                    <td className="py-3 px-4 font-medium text-[#181614] tabular-nums whitespace-nowrap">
                      {ord.orderNumber}
                      <span className="block text-[11px] font-normal text-[#6E655E]">
                        {formatDateIN(ord.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#181614] block">
                        {ord.customer.fullName}
                      </span>
                      <span className="text-xs text-[#6E655E]">
                        {ord.customer.city}, {ord.customer.state}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#2B2623]">
                      {ord.items.map((i) => `${i.name} (${i.volume}×${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-semibold tabular-nums whitespace-nowrap">
                      {formatINR(ord.total)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] border ${getStatusTone(
                          ord.status || 'New Order'
                        )}`}
                      >
                        {ord.status || 'New Order'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#6E655E] whitespace-nowrap">
                      {ord.assignedEmployeeName || 'Unassigned'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#6E655E]">
                      No orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock & Attendance Snapshot */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-[#E6DDD1]">
            <div className="px-5 py-4 border-b border-[#E6DDD1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B8935A]" />
                <h2 className="font-serif text-xl text-[#181614]">Low Stock Alerts</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-inventory')}
                className="text-[11px] uppercase tracking-[0.14em] text-[#9A7742] hover:text-[#181614]"
              >
                Restock →
              </button>
            </div>
            <div className="p-4 space-y-2.5">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-[#6E655E] py-3 text-center">
                  All bottle volumes are comfortably stocked above threshold.
                </p>
              ) : (
                lowStockItems.map((item, idx) => (
                  <div
                    key={`${item.productName}-${item.volume}-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
                  >
                    <div>
                      <p className="font-medium text-[#181614]">{item.productName}</p>
                      <p className="text-[#6E655E]">Bottle Volume: {item.volume}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 border tabular-nums font-medium ${
                        item.qty === 0
                          ? 'bg-[#FDF1F0] text-[#9E352B] border-[#ECC8C4]'
                          : 'bg-[#FAF3E6] text-[#8A5D19] border-[#E6D1AD]'
                      }`}
                    >
                      {item.qty} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E6DDD1]">
            <div className="px-5 py-4 border-b border-[#E6DDD1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#9A7742]" />
                <h2 className="font-serif text-xl text-[#181614]">Today&rsquo;s Staff Shifts</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('admin-attendance')}
                className="text-[11px] uppercase tracking-[0.14em] text-[#9A7742] hover:text-[#181614]"
              >
                Attendance →
              </button>
            </div>
            <div className="p-4 space-y-2.5">
              {todayAttendance.length === 0 ? (
                <p className="text-xs text-[#6E655E] py-3 text-center">
                  No staff check-ins logged yet for today.
                </p>
              ) : (
                todayAttendance.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between text-xs py-2 border-b border-[#E6DDD1] last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[#181614]">{att.employeeName}</p>
                      <p className="text-[#6E655E]">
                        {att.department} · In {att.checkInTime || '—'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 border ${getStatusTone(att.status)}`}>
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Ledger */}
      <div className="bg-white border border-[#E6DDD1]">
        <div className="px-5 py-4 border-b border-[#E6DDD1]">
          <h2 className="font-serif text-xl text-[#181614]">Audit &amp; Operational Trail</h2>
        </div>
        <div className="divide-y divide-[#E6DDD1]">
          {activityLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-medium text-[#181614]">{log.actorName}</span>{' '}
                <span className="text-[#9A7742] uppercase tracking-wider mx-1">
                  [{log.action}]
                </span>
                <span className="text-[#2B2623]">{log.target} — {log.details}</span>
              </div>
              <span className="text-[#6E655E] tabular-nums shrink-0">
                {formatDateTimeIN(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Sales Analytics View ───────────────────────────────────────────────────────
type DateRangeFilter = 'today' | '7d' | '30d' | 'year' | 'all';

export const AdminAnalyticsView: React.FC<{ data: AdminOverviewData }> = ({ data }) => {
  const { orders, products } = data;
  const [range, setRange] = useState<DateRangeFilter>('all');

  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return orders.filter((ord) => {
      const ts = new Date(ord.createdAt).getTime();
      if (range === 'today') return ts >= startOfToday.getTime();
      if (range === '7d') return ts >= now - 7 * 86400000;
      if (range === '30d') return ts >= now - 30 * 86400000;
      if (range === 'year') return new Date(ord.createdAt).getFullYear() === new Date().getFullYear();
      return true;
    });
  }, [orders, range]);

  const metrics = useMemo(() => {
    const active = filteredOrders.filter(
      (o) => o.status !== 'Cancelled' && o.status !== 'Returned'
    );
    const totalRevenue = active.reduce((sum, o) => sum + o.total, 0);
    const cashOrders = active.filter((o) => o.paymentMethod === 'Cash on Delivery (Cash)');
    const upiOrders = active.filter((o) => o.paymentMethod === 'Cash on Delivery (UPI on Arrival)');
    const deliveredRevenue = active
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.total, 0);
    const aov = active.length > 0 ? Math.round(totalRevenue / active.length) : 0;

    // Daily / Period buckets (last 7 days or grouped by date)
    const dailyMap = new Map<string, { label: string; revenue: number; orders: number }>();
    for (const o of active) {
      const d = o.createdAt.slice(0, 10);
      const label = new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
      const curr = dailyMap.get(d) || { label, revenue: 0, orders: 0 };
      curr.revenue += o.total;
      curr.orders += 1;
      dailyMap.set(d, curr);
    }
    const trend = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);

    // Best-selling perfumes
    const prodStats = new Map<
      string,
      { productId: string; name: string; image: string; units: number; revenue: number }
    >();
    for (const o of active) {
      for (const item of o.items) {
        const prev = prodStats.get(item.productId) || {
          productId: item.productId,
          name: item.name,
          image: item.image,
          units: 0,
          revenue: 0,
        };
        prev.units += item.quantity;
        prev.revenue += item.unitPrice * item.quantity;
        prodStats.set(item.productId, prev);
      }
    }
    const bestSellers = Array.from(prodStats.values()).sort((a, b) => b.revenue - a.revenue);

    // Category revenue breakdown
    const catMap = new Map<string, number>();
    for (const bs of bestSellers) {
      const prod = products.find((p) => p.id === bs.productId);
      const cat = prod?.category || 'Signature';
      catMap.set(cat, (catMap.get(cat) || 0) + bs.revenue);
    }
    const categoryBreakdown = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      totalRevenue,
      activeCount: active.length,
      deliveredRevenue,
      aov,
      cashCount: cashOrders.length,
      cashRevenue: cashOrders.reduce((s, o) => s + o.total, 0),
      upiCount: upiOrders.length,
      upiRevenue: upiOrders.reduce((s, o) => s + o.total, 0),
      trend,
      bestSellers,
      categoryBreakdown,
    };
  }, [filteredOrders, products]);

  // Quick period comparison (Today / 7d / 30d / Year)
  const periodComparisons = useMemo(() => {
    const now = Date.now();
    const valid = orders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Returned');
    const sumSince = (ms: number) =>
      valid.filter((o) => new Date(o.createdAt).getTime() >= ms).reduce((s, o) => s + o.total, 0);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return [
      { label: 'Daily Sales (Today)', value: sumSince(startOfToday.getTime()) },
      { label: 'Weekly Sales (7D)', value: sumSince(now - 7 * 86400000) },
      { label: 'Monthly Sales (30D)', value: sumSince(now - 30 * 86400000) },
      { label: 'Yearly Sales (365D)', value: sumSince(now - 365 * 86400000) },
    ];
  }, [orders]);

  const maxTrendRev = Math.max(1, ...metrics.trend.map((t) => t.revenue));

  return (
    <div className="space-y-6">
      {/* Range Filters */}
      <div className="bg-white border border-[#E6DDD1] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#9A7742]" />
          <span className="font-serif text-xl text-[#181614]">Sales &amp; Revenue Intelligence</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['today', 'Daily'],
              ['7d', 'Weekly'],
              ['30d', 'Monthly'],
              ['year', 'Yearly'],
              ['all', 'All Time'],
            ] as [DateRangeFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.14em] border transition-colors ${
                range === key
                  ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                  : 'bg-[#FAF8F4] text-[#6E655E] border-[#E6DDD1] hover:border-[#B8935A]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periodComparisons.map((p) => (
          <div key={p.label} className="bg-white border border-[#E6DDD1] p-5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#6E655E]">{p.label}</p>
            <p className="font-serif text-3xl text-[#181614] tabular-nums mt-2">
              {formatINR(p.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Filtered Metrics & COD Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-[#E6DDD1] p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DDD1] pb-4">
            <div>
              <h3 className="font-serif text-2xl text-[#181614]">Revenue &amp; Order Trend</h3>
              <p className="text-xs text-[#6E655E]">
                {metrics.activeCount} active orders · Avg Order Value{' '}
                <strong className="text-[#181614] tabular-nums">{formatINR(metrics.aov)}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#6E655E] block">
                Selected Period Revenue
              </span>
              <span className="font-serif text-2xl text-[#181614] tabular-nums">
                {formatINR(metrics.totalRevenue)}
              </span>
            </div>
          </div>

          {metrics.trend.length === 0 ? (
            <div className="py-14 text-center text-sm text-[#6E655E]">
              No active orders within the selected date window.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 flex items-end gap-3 pt-4 pb-2 border-b border-[#E6DDD1]">
                {metrics.trend.map((pt) => {
                  const pct = Math.max(8, Math.round((pt.revenue / maxTrendRev) * 100));
                  return (
                    <div
                      key={pt.label}
                      className="flex-1 min-w-[36px] h-full flex flex-col justify-end items-center group"
                    >
                      <span className="text-[10px] text-[#6E655E] tabular-nums mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatINR(pt.revenue)}
                      </span>
                      <div
                        className="w-full max-w-[44px] bg-[#181614] group-hover:bg-[#B8935A] transition-colors relative"
                        style={{ height: `${pct}%` }}
                        title={`${pt.label}: ${formatINR(pt.revenue)} (${pt.orders} orders)`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6E655E] tabular-nums">
                {metrics.trend.map((pt) => (
                  <div key={pt.label} className="flex-1 text-center truncate">
                    <span className="block text-[#181614] font-medium">{pt.label}</span>
                    <span>{pt.orders} ord</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COD Method & Category Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E6DDD1] p-5 space-y-4">
            <h3 className="font-serif text-xl text-[#181614]">COD Payment Breakdown</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F4] border border-[#E6DDD1] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-[#9A7742]" />
                  <div>
                    <p className="font-medium text-[#181614]">COD (Cash at Doorstep)</p>
                    <p className="text-[#6E655E]">{metrics.cashCount} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-[#181614] tabular-nums">
                  {formatINR(metrics.cashRevenue)}
                </span>
              </div>

              <div className="p-3 bg-[#FAF8F4] border border-[#E6DDD1] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#9A7742]" />
                  <div>
                    <p className="font-medium text-[#181614]">COD (UPI on Arrival)</p>
                    <p className="text-[#6E655E]">{metrics.upiCount} orders</p>
                  </div>
                </div>
                <span className="font-semibold text-[#181614] tabular-nums">
                  {formatINR(metrics.upiRevenue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E6DDD1] p-5 space-y-4">
            <h3 className="font-serif text-xl text-[#181614]">Category Performance</h3>
            <div className="space-y-3">
              {metrics.categoryBreakdown.map(([cat, rev]) => {
                const share =
                  metrics.totalRevenue > 0 ? Math.round((rev / metrics.totalRevenue) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-[#181614]">{cat}</span>
                      <span className="tabular-nums text-[#6E655E]">
                        {formatINR(rev)} ({share}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F2ECE4] overflow-hidden">
                      <div className="h-full bg-[#B8935A]" style={{ width: `${share}%` }} />
                    </div>
                  </div>
                );
              })}
              {metrics.categoryBreakdown.length === 0 && (
                <p className="text-xs text-[#6E655E]">No category sales in this period.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Best-Selling Perfumes Table */}
      <div className="bg-white border border-[#E6DDD1]">
        <div className="px-5 py-4 border-b border-[#E6DDD1]">
          <h3 className="font-serif text-2xl text-[#181614]">Best-Selling VELORA Perfumes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Fragrance</th>
                <th className="py-3 px-4">Bottles Sold</th>
                <th className="py-3 px-4">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDD1]">
              {metrics.bestSellers.map((item, idx) => (
                <tr key={item.productId}>
                  <td className="py-3 px-4 font-serif text-lg text-[#9A7742] tabular-nums">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveMediaUrl(item.image)}
                        alt={item.name}
                        className="w-10 h-12 object-cover bg-[#F2ECE4] border border-[#E6DDD1]"
                      />
                      <span className="font-medium text-[#181614]">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 tabular-nums">{item.units} bottles</td>
                  <td className="py-3 px-4 font-semibold tabular-nums">{formatINR(item.revenue)}</td>
                </tr>
              ))}
              {metrics.bestSellers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[#6E655E]">
                    No fragrance sales data for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
