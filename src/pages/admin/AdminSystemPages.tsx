import React, { useMemo, useState } from 'react';
import {
  Bell,
  Check,
  Download,
  FileText,
  Globe,
  Lock,
  Printer,
  Save,
  Settings,
  X,
} from 'lucide-react';
import { formatINR } from '../../data/catalog';
import { exportToCsv, formatDateIN, formatDateTimeIN } from '../../lib/dashboardUtils';
import { AuthUser, StoreSettings, WebsiteContent } from '../../types';
import { ImageUploaderField } from '../../components/ImageUploaderField';
import { VeloraLogo } from '../../components/VeloraLogo';
import { AdminOverviewData } from './AdminTypes';

interface SystemProps {
  data: AdminOverviewData;
  currentUser: AuthUser | null;
  onRefresh: () => Promise<void>;
  onRefreshStorefront: () => Promise<void>;
  onRefreshAuth: () => Promise<void>;
  onNotify: (msg: string) => void;
}

// ── 1. WEBSITE MANAGEMENT CMS ──────────────────────────────────────────────────
export const AdminWebsiteView: React.FC<SystemProps> = ({
  data,
  onRefresh,
  onRefreshStorefront,
  onNotify,
}) => {
  const [content, setContent] = useState<WebsiteContent | null>(
    data.websiteContent ? JSON.parse(JSON.stringify(data.websiteContent)) : null
  );
  const [saving, setSaving] = useState(false);

  if (!content) {
    return (
      <div className="bg-white border border-[#E6DDD1] p-8 text-center text-sm text-[#6E655E]">
        Website CMS content is restricted or unavailable for your role.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/website', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error('Failed to save website updates.');
      await Promise.all([onRefresh(), onRefreshStorefront()]);
      onNotify('Live storefront content updated successfully.');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to save website changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white border border-[#E6DDD1] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-[#9A7742]" />
          <div>
            <h2 className="font-serif text-2xl text-[#181614]">Live Storefront Content CMS</h2>
            <p className="text-xs text-[#6E655E]">
              Edits sync immediately to the customer-facing VELORA boutique.
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-[0.16em]"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Storefront Changes'}
        </button>
      </div>

      {/* Hero & Announcement */}
      <div className="bg-white border border-[#E6DDD1] p-6 space-y-4">
        <h3 className="font-serif text-xl text-[#181614] border-b border-[#E6DDD1] pb-2">
          Hero Banner &amp; Announcement Bar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              Top Announcement Bar
            </label>
            <input
              type="text"
              value={content.announcementBar}
              onChange={(e) => setContent({ ...content, announcementBar: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Hero Eyebrow</label>
            <input
              type="text"
              value={content.heroEyebrow}
              onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Hero Heading</label>
            <input
              type="text"
              value={content.heroHeading}
              onChange={(e) => setContent({ ...content, heroHeading: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Hero Subtitle</label>
            <textarea
              rows={2}
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
            />
          </div>
        </div>
        <ImageUploaderField
          label="Hero Campaign Photograph"
          value={content.heroImage}
          onChange={(url) => setContent({ ...content, heroImage: url })}
        />
      </div>

      {/* Brand Story & Promo Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E6DDD1] p-6 space-y-4">
          <h3 className="font-serif text-xl text-[#181614] border-b border-[#E6DDD1] pb-2">
            Brand Story Section
          </h3>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Eyebrow</label>
            <input
              type="text"
              value={content.brandStoryEyebrow}
              onChange={(e) => setContent({ ...content, brandStoryEyebrow: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Heading</label>
            <input
              type="text"
              value={content.brandStoryHeading}
              onChange={(e) => setContent({ ...content, brandStoryHeading: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Story Copy</label>
            <textarea
              rows={4}
              value={content.brandStoryBody}
              onChange={(e) => setContent({ ...content, brandStoryBody: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
            />
          </div>
        </div>

        <div className="bg-white border border-[#E6DDD1] p-6 space-y-4">
          <h3 className="font-serif text-xl text-[#181614] border-b border-[#E6DDD1] pb-2">
            Promotional Parallax Banner
          </h3>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Eyebrow</label>
            <input
              type="text"
              value={content.promoBannerEyebrow}
              onChange={(e) => setContent({ ...content, promoBannerEyebrow: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Heading</label>
            <input
              type="text"
              value={content.promoBannerHeading}
              onChange={(e) => setContent({ ...content, promoBannerHeading: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Banner Copy</label>
            <textarea
              rows={2}
              value={content.promoBannerText}
              onChange={(e) => setContent({ ...content, promoBannerText: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
            />
          </div>
          <ImageUploaderField
            label="Promo Backdrop Image"
            value={content.promoBannerImage}
            onChange={(url) => setContent({ ...content, promoBannerImage: url })}
            compact
          />
        </div>
      </div>

      {/* Contact, Footer & Newsletter */}
      <div className="bg-white border border-[#E6DDD1] p-6 space-y-4">
        <h3 className="font-serif text-xl text-[#181614] border-b border-[#E6DDD1] pb-2">
          Boutique Contact, Footer &amp; Journal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Contact Email</label>
            <input
              type="email"
              value={content.contactEmail}
              onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Contact Phone</label>
            <input
              type="text"
              value={content.contactPhone}
              onChange={(e) => setContent({ ...content, contactPhone: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Boutique Hours</label>
            <input
              type="text"
              value={content.boutiqueHours}
              onChange={(e) => setContent({ ...content, boutiqueHours: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              Boutique Address
            </label>
            <input
              type="text"
              value={content.boutiqueAddress}
              onChange={(e) => setContent({ ...content, boutiqueAddress: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              Newsletter Heading
            </label>
            <input
              type="text"
              value={content.newsletterHeading}
              onChange={(e) => setContent({ ...content, newsletterHeading: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              Footer Brand Description
            </label>
            <input
              type="text"
              value={content.footerDescription}
              onChange={(e) => setContent({ ...content, footerDescription: e.target.value })}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Newsletter Subscribers */}
      <div className="bg-white border border-[#E6DDD1] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-[#181614]">
            Newsletter Subscribers ({data.newsletterSubscribers.length})
          </h3>
          <button
            type="button"
            onClick={() =>
              exportToCsv(
                'velora-newsletter-subscribers.csv',
                ['Email', 'Subscribed At'],
                data.newsletterSubscribers.map((s) => [s.email, s.subscribedAt])
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E6DDD1] text-xs uppercase"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.newsletterSubscribers.map((s) => (
            <span
              key={s.id}
              className="px-3 py-1.5 bg-[#FAF8F4] border border-[#E6DDD1] text-xs text-[#2B2623]"
            >
              {s.email}
            </span>
          ))}
        </div>
      </div>
    </form>
  );
};

// ── 2. REPORTS & EXPORTS ───────────────────────────────────────────────────────
interface ReportPreview {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export const AdminReportsView: React.FC<{ data: AdminOverviewData; onNotify: (msg: string) => void }> = ({
  data,
  onNotify,
}) => {
  const { orders, products, customers, employees, attendance, tasks } = data;
  const [previewReport, setPreviewReport] = useState<ReportPreview | null>(null);

  const reportBuilders = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const monthPrefix = todayStr.slice(0, 7);
    const yearPrefix = todayStr.slice(0, 4);

    const buildSalesRows = (list: typeof orders) =>
      list.map((o) => [
        o.orderNumber,
        formatDateIN(o.createdAt),
        o.customer.fullName,
        o.customer.city,
        o.paymentMethod,
        o.status || 'New Order',
        o.total,
      ]);

    const salesHeaders = ['Order ID', 'Date', 'Customer', 'City', 'Payment', 'Status', 'Total (INR)'];

    const productPerfRows = products.map((p) => {
      let units = 0;
      let rev = 0;
      orders
        .filter((o) => o.status !== 'Cancelled' && o.status !== 'Returned')
        .forEach((o) =>
          o.items.forEach((i) => {
            if (i.productId === p.id) {
              units += i.quantity;
              rev += i.unitPrice * i.quantity;
            }
          })
        );
      return [p.name, p.category, p.concentration, p.price, units, rev];
    });

    const empPerfRows = employees.map((e) => {
      const att = attendance.filter((a) => a.employeeId === e.id);
      const present = att.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const doneTasks = tasks.filter(
        (t) => t.assignedToEmployeeId === e.id && t.status === 'Completed'
      ).length;
      const assignedOrd = orders.filter((o) => o.assignedEmployeeId === e.id).length;
      return [
        e.employeeCode,
        e.name,
        e.department,
        e.designation,
        `${present}/${att.length || 0}`,
        doneTasks,
        assignedOrd,
      ];
    });

    return [
      {
        id: 'daily-sales',
        title: 'Daily Sales Report',
        desc: 'Orders placed today with COD payment mode & value.',
        headers: salesHeaders,
        rows: buildSalesRows(orders.filter((o) => o.createdAt.startsWith(todayStr))),
      },
      {
        id: 'monthly-sales',
        title: 'Monthly Sales Report',
        desc: 'All revenue and COD orders for the current calendar month.',
        headers: salesHeaders,
        rows: buildSalesRows(orders.filter((o) => o.createdAt.startsWith(monthPrefix))),
      },
      {
        id: 'yearly-sales',
        title: 'Yearly Sales Report',
        desc: 'Annualized order and revenue ledger across India.',
        headers: salesHeaders,
        rows: buildSalesRows(orders.filter((o) => o.createdAt.startsWith(yearPrefix))),
      },
      {
        id: 'order-report',
        title: 'Complete Order Report',
        desc: 'Full order registry including status and assigned staff.',
        headers: [
          'Order ID',
          'Date',
          'Customer',
          'Phone',
          'City',
          'Items',
          'Total (INR)',
          'Status',
          'Assigned To',
        ],
        rows: orders.map((o) => [
          o.orderNumber,
          formatDateIN(o.createdAt),
          o.customer.fullName,
          o.customer.phone,
          o.customer.city,
          o.items.map((i) => `${i.name} ${i.volume}×${i.quantity}`).join(' | '),
          o.total,
          o.status || 'New Order',
          o.assignedEmployeeName || 'Unassigned',
        ]),
      },
      {
        id: 'product-perf',
        title: 'Product Performance Report',
        desc: 'Fragrance unit velocity and gross revenue rankings.',
        headers: ['Fragrance', 'Category', 'Concentration', '50ml Price', 'Units Sold', 'Revenue (INR)'],
        rows: productPerfRows,
      },
      {
        id: 'inventory',
        title: 'Inventory Stock Valuation Report',
        desc: 'Current bottle inventory counts for 30ml, 50ml, and 100ml SKUs.',
        headers: ['Fragrance', '30ml', '50ml', '100ml', 'Total Bottles', 'Low Threshold'],
        rows: products.map((p) => {
          const s30 = p.stock?.['30ml'] ?? 0;
          const s50 = p.stock?.['50ml'] ?? 0;
          const s100 = p.stock?.['100ml'] ?? 0;
          return [p.name, s30, s50, s100, s30 + s50 + s100, p.lowStockThreshold ?? 10];
        }),
      },
      {
        id: 'emp-attendance',
        title: 'Employee Attendance Report',
        desc: 'Check-in, check-out, working hours, and shift status.',
        headers: ['Date', 'Code', 'Employee', 'Department', 'In', 'Out', 'Hours', 'Status'],
        rows: attendance.map((a) => [
          a.date,
          a.employeeCode,
          a.employeeName,
          a.department,
          a.checkInTime || '—',
          a.checkOutTime || '—',
          a.workingHours,
          a.status,
        ]),
      },
      {
        id: 'emp-perf',
        title: 'Employee Performance Report',
        desc: 'Completed tasks, assigned orders, and attendance rate.',
        headers: [
          'Code',
          'Name',
          'Department',
          'Designation',
          'Present Days',
          'Tasks Completed',
          'Orders Handled',
        ],
        rows: empPerfRows,
      },
      {
        id: 'customer-report',
        title: 'Customer Directory Report',
        desc: 'India buyers with total orders, lifetime spend, and status.',
        headers: ['Name', 'Email', 'Phone', 'City', 'State', 'Orders', 'Total Spend (INR)', 'Status'],
        rows: customers.map((c) => [
          c.name,
          c.email,
          c.phone,
          c.city,
          c.state,
          c.totalOrders,
          c.totalSpent,
          c.status,
        ]),
      },
    ];
  }, [orders, products, customers, employees, attendance, tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reportBuilders.map((rep) => (
          <div key={rep.id} className="bg-white border border-[#E6DDD1] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-[#9A7742]" />
                <span className="text-[11px] uppercase tracking-wider text-[#6E655E] tabular-nums">
                  {rep.rows.length} rows
                </span>
              </div>
              <h3 className="font-serif text-2xl text-[#181614]">{rep.title}</h3>
              <p className="text-xs text-[#6E655E] leading-relaxed">{rep.desc}</p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#E6DDD1]">
              <button
                type="button"
                onClick={() => {
                  exportToCsv(`${rep.id}.csv`, rep.headers, rep.rows);
                  onNotify(`${rep.title} exported as CSV.`);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-[11px] uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  setPreviewReport({
                    title: rep.title,
                    headers: rep.headers,
                    rows: rep.rows,
                  })
                }
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 border border-[#E6DDD1] hover:border-[#181614] text-[11px] uppercase tracking-wider"
              >
                <Printer className="w-3.5 h-3.5" /> Print / PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Report Modal */}
      {previewReport && (
        <div
          onClick={() => setPreviewReport(null)}
          className="fixed inset-0 z-50 bg-[#141210]/70 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="velora-printable w-full max-w-4xl bg-white border border-[#E6DDD1] p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#E6DDD1] pb-4">
              <div>
                <VeloraLogo tone="dark" size="sm" className="mb-1" />
                <h2 className="font-serif text-2xl text-[#181614]">{previewReport.title}</h2>
                <p className="text-xs text-[#6E655E]">
                  Generated {new Date().toLocaleString('en-IN')} · Currency: INR (₹)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="no-print w-9 h-9 flex items-center justify-center border border-[#E6DDD1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F4] border-y border-[#E6DDD1] uppercase text-[#6E655E]">
                    {previewReport.headers.map((h) => (
                      <th key={h} className="py-2.5 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DDD1]">
                  {previewReport.rows.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3 tabular-nums">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {previewReport.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={previewReport.headers.length}
                        className="py-6 text-center text-[#6E655E]"
                      >
                        No data rows for this reporting period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="no-print flex justify-end gap-3 pt-3 border-t border-[#E6DDD1]">
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 border border-[#E6DDD1] text-xs uppercase"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 3. NOTIFICATIONS CENTER ────────────────────────────────────────────────────
export const AdminNotificationsView: React.FC<{
  data: AdminOverviewData;
  onRefresh: () => Promise<void>;
}> = ({ data, onRefresh }) => {
  const { notifications } = data;
  const markRead = async (id?: string) => {
    await fetch('/api/admin/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(id ? { id } : {}),
    });
    await onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E6DDD1] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#9A7742]" />
          <h2 className="font-serif text-xl text-[#181614]">
            Notification Center ({notifications.filter((n) => !n.read).length} unread)
          </h2>
        </div>
        <button
          type="button"
          onClick={() => markRead()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#181614] text-[#FAF8F4] text-xs uppercase tracking-wider"
        >
          <Check className="w-3.5 h-3.5" /> Mark All Read
        </button>
      </div>

      <div className="bg-white border border-[#E6DDD1] divide-y divide-[#E6DDD1]">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 flex items-start justify-between gap-4 ${
              !n.read ? 'bg-[#FAF8F4]' : 'bg-white'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                {!n.read && <span className="w-2 h-2 bg-[#B8935A] inline-block" />}
                <p className="font-medium text-sm text-[#181614]">{n.title}</p>
              </div>
              <p className="text-xs text-[#6E655E] mt-1">{n.message}</p>
              <p className="text-[11px] text-[#8A8076] mt-1 tabular-nums">
                {formatDateTimeIN(n.createdAt)}
              </p>
            </div>
            {!n.read && (
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className="px-3 py-1.5 border border-[#E6DDD1] text-[11px] uppercase tracking-wider shrink-0"
              >
                Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 4. ADMIN SETTINGS & PROFILE ────────────────────────────────────────────────
export const AdminSettingsView: React.FC<SystemProps> = ({
  data,
  currentUser,
  onRefresh,
  onRefreshStorefront,
  onRefreshAuth,
  onNotify,
}) => {
  const [settings, setSettings] = useState<StoreSettings | null>(
    data.settings ? JSON.parse(JSON.stringify(data.settings)) : null
  );
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      await Promise.all([onRefresh(), onRefreshStorefront()]);
      onNotify('Storefront & operations settings updated.');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: profileName }),
    });
    if (res.ok) {
      await onRefreshAuth();
      onNotify('Admin profile name updated.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      onNotify(json.error || 'Unable to change password.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    onNotify('Password updated securely.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleProfileSave} className="bg-white border border-[#E6DDD1] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6DDD1] pb-2">
            <Settings className="w-4 h-4 text-[#9A7742]" />
            <h3 className="font-serif text-xl text-[#181614]">Administrator Profile</h3>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Display Name</label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Email &amp; Role</label>
            <input
              type="text"
              disabled
              value={`${currentUser?.email || ''} (${currentUser?.role || ''})`}
              className="w-full px-3 py-2 bg-[#F2ECE4] border border-[#E6DDD1] text-sm text-[#6E655E]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
          >
            Update Profile
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="bg-white border border-[#E6DDD1] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E6DDD1] pb-2">
            <Lock className="w-4 h-4 text-[#9A7742]" />
            <h3 className="font-serif text-xl text-[#181614]">Change Security Password</h3>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              New Password (min 8 chars)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
          >
            Change Password
          </button>
        </form>
      </div>

      {settings && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-[#E6DDD1] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6DDD1] pb-3">
            <h3 className="font-serif text-2xl text-[#181614]">
              Store Operations, Shipping, COD &amp; Tax Settings
            </h3>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
            >
              Save Store Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">GSTIN</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
                GST Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxRatePercent}
                onChange={(e) =>
                  setSettings({ ...settings, taxRatePercent: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
                Free Shipping Threshold ({formatINR(settings.freeShippingThreshold)})
              </label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={(e) =>
                  setSettings({ ...settings, standardShippingFee: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">COD Fee (₹)</label>
              <input
                type="number"
                value={settings.codFee}
                onChange={(e) => setSettings({ ...settings, codFee: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="accent-[#181614] w-4 h-4"
              />
              <span>Enable Cash on Delivery (COD)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoDeductStockOnOrder}
                onChange={(e) =>
                  setSettings({ ...settings, autoDeductStockOnOrder: e.target.checked })
                }
                className="accent-[#181614] w-4 h-4"
              />
              <span>Auto-Deduct Stock on New Order</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) => setSettings({ ...settings, lowStockAlerts: e.target.checked })}
                className="accent-[#181614] w-4 h-4"
              />
              <span>Enable Low Stock Alerts</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="accent-[#181614] w-4 h-4"
              />
              <span>Email Notifications</span>
            </label>
          </div>
        </form>
      )}
    </div>
  );
};
