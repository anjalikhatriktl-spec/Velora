import React, { useMemo, useState } from 'react';
import {
  Check,
  Download,
  Eye,
  Printer,
  Search,
  X,
} from 'lucide-react';
import { formatINR } from '../../data/catalog';
import {
  exportToCsv,
  formatDateTimeIN,
  getStatusTone,
  ORDER_STATUS_LIST,
} from '../../lib/dashboardUtils';
import { resolveMediaUrl } from '../../lib/mediaAssets';
import { OrderRecord, OrderStatus } from '../../types';
import { VeloraLogo } from '../../components/VeloraLogo';
import { AdminOverviewData } from './AdminTypes';

interface OrdersProps {
  data: AdminOverviewData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export const AdminOrdersPage: React.FC<OrdersProps> = ({ data, onRefresh, onNotify }) => {
  const { orders, employees, settings } = data;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderRecord | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable detail fields when inspecting an order
  const [editStatus, setEditStatus] = useState<OrderStatus>('New Order');
  const [editEmployeeId, setEditEmployeeId] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [editState, setEditState] = useState<string>('');
  const [editPin, setEditPin] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');

  const openInspector = (ord: OrderRecord) => {
    setSelectedOrder(ord);
    setEditStatus(ord.status || 'New Order');
    setEditEmployeeId(ord.assignedEmployeeId || '');
    setEditNotes(ord.internalNotes || '');
    setEditPhone(ord.customer.phone);
    setEditAddress(ord.customer.address);
    setEditCity(ord.customer.city);
    setEditState(ord.customer.state);
    setEditPin(ord.customer.postalCode);
    setStatusNote('');
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && (o.status || 'New Order') !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        o.orderNumber,
        o.customer.fullName,
        o.customer.phone,
        o.customer.email,
        o.customer.city,
        o.assignedEmployeeName || '',
        ...o.items.map((i) => i.name),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, search, statusFilter]);

  const patchOrder = async (
    orderId: string,
    payload: Record<string, unknown>,
    successMsg: string
  ) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to update order.');
      await onRefresh();
      if (selectedOrder && selectedOrder.id === orderId && json.order) {
        setSelectedOrder(json.order);
      }
      onNotify(successMsg);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to update order.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder?.id) return;
    await patchOrder(
      selectedOrder.id,
      {
        status: editStatus,
        statusNote: statusNote || `Updated to ${editStatus}`,
        assignedEmployeeId: editEmployeeId || null,
        internalNotes: editNotes,
        customer: {
          ...selectedOrder.customer,
          phone: editPhone,
          address: editAddress,
          city: editCity,
          state: editState,
          postalCode: editPin,
        },
      },
      `Order ${selectedOrder.orderNumber} saved.`
    );
    setSelectedOrder(null);
  };

  const handleExportCsv = () => {
    exportToCsv(
      `velora-orders-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Order ID',
        'Date',
        'Customer Name',
        'Phone',
        'Email',
        'City',
        'State',
        'Items',
        'Total INR',
        'Payment Method',
        'Status',
        'Assigned Employee',
      ],
      filteredOrders.map((o) => [
        o.orderNumber,
        o.createdAt,
        o.customer.fullName,
        o.customer.phone,
        o.customer.email,
        o.customer.city,
        o.customer.state,
        o.items.map((i) => `${i.name} (${i.volume} x${i.quantity})`).join(' | '),
        o.total,
        o.paymentMethod,
        o.status || 'New Order',
        o.assignedEmployeeName || 'Unassigned',
      ])
    );
    onNotify('Orders CSV downloaded.');
  };

  return (
    <div className="space-y-5">
      {/* Search, Filter & Export Toolbar */}
      <div className="bg-white border border-[#E6DDD1] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex items-center border border-[#E6DDD1] bg-[#FAF8F4] px-3 min-h-[42px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6E655E] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer, phone, perfume..."
              className="bg-transparent text-sm w-full focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter orders by status"
              className="px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs uppercase tracking-[0.12em] focus:outline-none"
            >
              <option value="All">All Statuses ({orders.length})</option>
              {ORDER_STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st} ({orders.filter((o) => (o.status || 'New Order') === st).length})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] transition-colors text-xs uppercase tracking-[0.14em]"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E6DDD1] overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
            <tr>
              <th className="py-3.5 px-4">Order ID &amp; Date</th>
              <th className="py-3.5 px-4">Customer &amp; Destination</th>
              <th className="py-3.5 px-4">Products</th>
              <th className="py-3.5 px-4">Total &amp; COD</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Staff</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDD1]">
            {filteredOrders.map((ord) => (
              <tr key={ord.id || ord.orderNumber} className="hover:bg-[#FAF8F4]/60 align-top">
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-[#181614] tabular-nums block">
                    {ord.orderNumber}
                  </span>
                  <span className="text-[11px] text-[#6E655E]">
                    {formatDateTimeIN(ord.createdAt)}
                  </span>
                </td>

                <td className="py-3.5 px-4 min-w-[210px]">
                  <p className="font-medium text-[#181614]">{ord.customer.fullName}</p>
                  <p className="text-xs text-[#6E655E] tabular-nums">{ord.customer.phone}</p>
                  <p className="text-xs text-[#6E655E] truncate max-w-[220px]">
                    {ord.customer.city}, {ord.customer.state} {ord.customer.postalCode}
                  </p>
                </td>

                <td className="py-3.5 px-4 min-w-[220px]">
                  <div className="space-y-1.5">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs">
                        <img
                          src={resolveMediaUrl(item.image)}
                          alt={item.name}
                          className="w-8 h-9 object-cover bg-[#F2ECE4] border border-[#E6DDD1] shrink-0"
                        />
                        <div>
                          <span className="font-medium text-[#181614] block">{item.name}</span>
                          <span className="text-[#6E655E] tabular-nums">
                            {item.volume} × {item.quantity} ({formatINR(item.unitPrice)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-[#181614] tabular-nums block">
                    {formatINR(ord.total)}
                  </span>
                  <span className="text-[11px] text-[#6E655E]">{ord.paymentMethod}</span>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <select
                    value={ord.status || 'New Order'}
                    disabled={saving}
                    onChange={(e) =>
                      ord.id &&
                      patchOrder(
                        ord.id,
                        { status: e.target.value },
                        `${ord.orderNumber} marked ${e.target.value}`
                      )
                    }
                    className={`px-2 py-1 text-xs border focus:outline-none ${getStatusTone(
                      ord.status || 'New Order'
                    )}`}
                  >
                    {ORDER_STATUS_LIST.map((st) => (
                      <option key={st} value={st} className="bg-white text-[#181614]">
                        {st}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-3.5 px-4 whitespace-nowrap">
                  <select
                    value={ord.assignedEmployeeId || ''}
                    disabled={saving}
                    onChange={(e) =>
                      ord.id &&
                      patchOrder(
                        ord.id,
                        { assignedEmployeeId: e.target.value || null },
                        `Assignment updated for ${ord.orderNumber}`
                      )
                    }
                    className="px-2.5 py-1.5 bg-[#FAF8F4] border border-[#E6DDD1] text-xs text-[#181614] focus:outline-none max-w-[160px]"
                  >
                    <option value="">Unassigned</option>
                    {employees
                      .filter((emp) => emp.status === 'Active')
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department.split(' ')[0]})
                        </option>
                      ))}
                  </select>
                </td>

                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    {(ord.status === 'New Order' || !ord.status) && ord.id && (
                      <button
                        type="button"
                        title="Quick Confirm"
                        onClick={() =>
                          patchOrder(
                            ord.id!,
                            { status: 'Confirmed', statusNote: 'Confirmed by Admin' },
                            `${ord.orderNumber} confirmed`
                          )
                        }
                        className="p-2 border border-[#C5DFCC] bg-[#EDF5EF] text-[#1F5D37] hover:bg-[#1F5D37] hover:text-white transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Inspect & Edit Order"
                      onClick={() => openInspector(ord)}
                      className="p-2 border border-[#E6DDD1] bg-[#FAF8F4] text-[#181614] hover:border-[#181614]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Print Invoice"
                      onClick={() => setInvoiceOrder(ord)}
                      className="p-2 border border-[#E6DDD1] bg-[#FAF8F4] text-[#181614] hover:border-[#181614]"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-[#6E655E]">
                  No orders matched your current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Edit & History Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 z-50 bg-[#141210]/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[#FAF8F4] border border-[#E6DDD1] max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="px-6 py-4 bg-white border-b border-[#E6DDD1] flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="font-serif text-2xl text-[#181614]">
                  Order {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-[#6E655E]">
                  Placed {formatDateTimeIN(selectedOrder.createdAt)} · {selectedOrder.paymentMethod}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-9 h-9 flex items-center justify-center border border-[#E6DDD1] text-[#181614]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInspector} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm focus:outline-none"
                  >
                    {ORDER_STATUS_LIST.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Assign Employee
                  </label>
                  <select
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-[#E6DDD1] p-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Status Update Note
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g., Dispatched via BlueDart Express"
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#6E655E] mb-1">
                    Internal Operations Notes
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="VIP packaging or courier instructions"
                    className="w-full px-3 py-2.5 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
              </div>

              {/* Status Timeline */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-white border border-[#E6DDD1] p-4 space-y-2.5">
                  <h3 className="text-xs uppercase tracking-[0.14em] text-[#9A7742] font-medium">
                    Status Audit History
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start justify-between text-xs border-b border-[#E6DDD1]/60 pb-2 last:border-0">
                        <div>
                          <span className="font-semibold text-[#181614]">{h.status}</span>
                          <span className="text-[#6E655E]"> · {h.note} (by {h.actor})</span>
                        </div>
                        <span className="text-[#6E655E] tabular-nums shrink-0">
                          {formatDateTimeIN(h.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 border border-[#E6DDD1] bg-white text-xs uppercase tracking-[0.14em]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-[0.14em]"
                >
                  {saving ? 'Saving...' : 'Save Order Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable GST / COD Invoice Modal */}
      {invoiceOrder && (
        <div
          onClick={() => setInvoiceOrder(null)}
          className="fixed inset-0 z-50 bg-[#141210]/70 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="velora-printable w-full max-w-2xl bg-white border border-[#E6DDD1] p-6 sm:p-10 space-y-6 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-[#E6DDD1] pb-5">
              <div>
                <VeloraLogo tone="dark" size="md" />
                <p className="text-xs text-[#6E655E] mt-1">
                  {settings?.storeName || 'VELORA Parfums India'} · GSTIN:{' '}
                  {settings?.gstNumber || '27AABCV4812K1Z9'}
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="uppercase tracking-[0.16em] text-[#9A7742] font-semibold">
                  Tax &amp; COD Invoice
                </p>
                <p className="font-semibold text-base text-[#181614] tabular-nums mt-0.5">
                  {invoiceOrder.orderNumber}
                </p>
                <p className="text-[#6E655E]">{formatDateTimeIN(invoiceOrder.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="uppercase tracking-wider text-[#6E655E] mb-1">Billed &amp; Shipped To</p>
                <p className="font-semibold text-sm text-[#181614]">
                  {invoiceOrder.customer.fullName}
                </p>
                <p className="text-[#2B2623]">{invoiceOrder.customer.address}</p>
                <p className="text-[#2B2623]">
                  {invoiceOrder.customer.city}, {invoiceOrder.customer.state} –{' '}
                  {invoiceOrder.customer.postalCode}
                </p>
                <p className="text-[#6E655E] mt-1 tabular-nums">{invoiceOrder.customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="uppercase tracking-wider text-[#6E655E] mb-1">Payment &amp; Status</p>
                <p className="font-semibold text-[#181614]">{invoiceOrder.paymentMethod}</p>
                <p className="text-[#6E655E] mt-1">Status: {invoiceOrder.status || 'New Order'}</p>
                <p className="text-[#6E655E]">Est. Delivery: {invoiceOrder.estimatedDelivery}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-y border-[#E6DDD1]">
              <thead className="bg-[#FAF8F4] text-[#6E655E] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Fragrance</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDD1]">
                {invoiceOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-medium text-[#181614]">{item.name}</td>
                    <td className="py-2.5 px-3">{item.volume}</td>
                    <td className="py-2.5 px-3 tabular-nums">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                      {formatINR(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#6E655E]">
                  <span>Subtotal (incl. {settings?.taxRatePercent ?? 18}% GST)</span>
                  <span className="tabular-nums text-[#181614]">
                    {formatINR(invoiceOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#6E655E]">
                  <span>Insured Shipping</span>
                  <span className="tabular-nums text-[#181614]">
                    {invoiceOrder.shippingFee === 0
                      ? 'Complimentary'
                      : formatINR(invoiceOrder.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-sm text-[#181614] pt-2 border-t border-[#E6DDD1]">
                  <span>Total COD Payable</span>
                  <span className="tabular-nums">{formatINR(invoiceOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="no-print flex items-center justify-end gap-3 pt-4 border-t border-[#E6DDD1]">
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 border border-[#E6DDD1] text-xs uppercase tracking-[0.14em]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-[0.14em]"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
