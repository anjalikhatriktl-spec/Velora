import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckSquare,
  ClipboardList,
  Edit3,
  Eye,
  KeyRound,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  X,
  XCircle,
} from 'lucide-react';
import { formatINR } from '../../data/catalog';
import { formatDateIN, formatDateTimeIN, getStatusTone } from '../../lib/dashboardUtils';
import { resolveMediaUrl } from '../../lib/mediaAssets';
import {
  AdminModulePermission,
  CustomerRecord,
  EmployeeDepartment,
  EmployeeRecord,
  LeaveRequestRecord,
} from '../../types';
import { ImageUploaderField } from '../../components/ImageUploaderField';
import { AdminOverviewData } from './AdminTypes';

interface PeopleProps {
  data: AdminOverviewData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}

const DEPARTMENTS: EmployeeDepartment[] = [
  'Order Management',
  'Customer Support',
  'Inventory Management',
  'Sales & Marketing',
  'Packing & Dispatch',
];

const ALL_PERMISSIONS: { key: AdminModulePermission; label: string }[] = [
  { key: 'analytics', label: 'Analytics' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'customers', label: 'Customers' },
  { key: 'employees', label: 'Employees' },
  { key: 'attendance', label: 'Attendance & Leave' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'website', label: 'Website CMS' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'support', label: 'Customer Support' },
];

// ── 1. CUSTOMERS & ENQUIRIES MANAGEMENT ────────────────────────────────────────
export const AdminCustomersView: React.FC<PeopleProps> = ({ data, onRefresh, onNotify }) => {
  const { customers, orders, enquiries } = data;
  const [tab, setTab] = useState<'customers' | 'enquiries'>('customers');
  const [search, setSearch] = useState('');
  const [inspecting, setInspecting] = useState<CustomerRecord | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const toggleStatus = async (c: CustomerRecord) => {
    const next = c.status === 'Active' ? 'Blocked' : 'Active';
    const res = await fetch(`/api/admin/customers/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      await onRefresh();
      onNotify(`${c.name} marked ${next}.`);
    }
  };

  const updateEnquiry = async (id: string, status?: string, note?: string) => {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) {
      setReplyText((prev) => ({ ...prev, [id]: '' }));
      await onRefresh();
      onNotify('Enquiry updated.');
    }
  };

  const customerOrders = useMemo(() => {
    if (!inspecting) return [];
    return orders.filter(
      (o) =>
        o.customerId === inspecting.id ||
        o.customer.email.toLowerCase() === inspecting.email.toLowerCase()
    );
  }, [inspecting, orders]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E6DDD1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('customers')}
            className={`px-4 py-2 text-xs uppercase tracking-[0.14em] border ${
              tab === 'customers'
                ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                : 'bg-[#FAF8F4] text-[#6E655E] border-[#E6DDD1]'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('enquiries')}
            className={`px-4 py-2 text-xs uppercase tracking-[0.14em] border ${
              tab === 'enquiries'
                ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
                : 'bg-[#FAF8F4] text-[#6E655E] border-[#E6DDD1]'
            }`}
          >
            Boutique Enquiries ({enquiries.length})
          </button>
        </div>

        {tab === 'customers' && (
          <div className="relative flex items-center border border-[#E6DDD1] bg-[#FAF8F4] px-3 min-h-[40px] w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6E655E] mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, city..."
              className="bg-transparent text-sm w-full focus:outline-none"
            />
          </div>
        )}
      </div>

      {tab === 'customers' ? (
        <div className="bg-white border border-[#E6DDD1] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] text-[11px] uppercase tracking-[0.14em] text-[#6E655E]">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDD1]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F4]/60">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#181614]">{c.name}</p>
                    <p className="text-xs text-[#6E655E]">
                      {c.email} · {c.phone}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#2B2623]">
                    {c.city}, {c.state} ({c.postalCode})
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">{c.totalOrders}</td>
                  <td className="py-3.5 px-4 font-semibold tabular-nums">
                    {formatINR(c.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 text-[11px] border ${getStatusTone(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspecting(c)}
                        className="p-2 border border-[#E6DDD1] bg-[#FAF8F4] hover:border-[#181614]"
                        title="View Customer Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(c)}
                        className="px-3 py-1.5 text-[11px] uppercase tracking-wider border border-[#E6DDD1] hover:border-[#181614]"
                      >
                        {c.status === 'Active' ? 'Block' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="bg-white border border-[#E6DDD1] p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl text-[#181614]">{enq.subject}</h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase border ${getStatusTone(
                        enq.status
                      )}`}
                    >
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E655E] mt-0.5">
                    {enq.customerName} · {enq.email} · {enq.phone || 'No phone'} ·{' '}
                    {formatDateTimeIN(enq.createdAt)}
                  </p>
                </div>
                <select
                  value={enq.status}
                  onChange={(e) => updateEnquiry(enq.id, e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <p className="text-sm text-[#2B2623] bg-[#FAF8F4] p-3 border border-[#E6DDD1]">
                {enq.message}
              </p>
              {enq.notes.length > 0 && (
                <div className="space-y-1.5 pl-3 border-l-2 border-[#B8935A]">
                  {enq.notes.map((n) => (
                    <p key={n.id} className="text-xs text-[#6E655E]">
                      <strong className="text-[#181614]">{n.author}:</strong> {n.text}
                    </p>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText[enq.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [enq.id]: e.target.value })}
                  placeholder="Add internal concierge note..."
                  className="flex-1 px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    replyText[enq.id]?.trim() &&
                    updateEnquiry(enq.id, undefined, replyText[enq.id])
                  }
                  className="px-4 py-2 bg-[#181614] text-[#FAF8F4] text-xs uppercase tracking-wider"
                >
                  Save Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Profile Modal */}
      {inspecting && (
        <div
          onClick={() => setInspecting(null)}
          className="fixed inset-0 z-50 bg-[#141210]/60 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white border border-[#E6DDD1] max-h-[88vh] overflow-y-auto p-6 space-y-5"
          >
            <div className="flex items-start justify-between border-b border-[#E6DDD1] pb-4">
              <div>
                <h2 className="font-serif text-3xl text-[#181614]">{inspecting.name}</h2>
                <p className="text-xs text-[#6E655E] mt-1">
                  {inspecting.email} · {inspecting.phone}
                </p>
                <p className="text-xs text-[#6E655E]">
                  {inspecting.address}, {inspecting.city}, {inspecting.state} –{' '}
                  {inspecting.postalCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspecting(null)}
                className="w-9 h-9 flex items-center justify-center border border-[#E6DDD1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-[#FAF8F4] border border-[#E6DDD1]">
                <span className="text-[10px] uppercase text-[#6E655E] block">Orders</span>
                <strong className="font-serif text-2xl tabular-nums">
                  {inspecting.totalOrders}
                </strong>
              </div>
              <div className="p-3 bg-[#FAF8F4] border border-[#E6DDD1]">
                <span className="text-[10px] uppercase text-[#6E655E] block">Lifetime Spend</span>
                <strong className="font-serif text-2xl tabular-nums">
                  {formatINR(inspecting.totalSpent)}
                </strong>
              </div>
              <div className="p-3 bg-[#FAF8F4] border border-[#E6DDD1]">
                <span className="text-[10px] uppercase text-[#6E655E] block">Registered</span>
                <strong className="text-xs block mt-2">
                  {formatDateIN(inspecting.registeredAt)}
                </strong>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-[0.14em] text-[#9A7742] font-medium">
                Order History
              </h3>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-[#6E655E]">No order records linked.</p>
              ) : (
                <div className="divide-y divide-[#E6DDD1] border border-[#E6DDD1]">
                  {customerOrders.map((o) => (
                    <div key={o.orderNumber} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-[#181614] tabular-nums">
                          {o.orderNumber}
                        </p>
                        <p className="text-[#6E655E]">
                          {o.items.map((i) => `${i.name} (${i.volume}×${i.quantity})`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums">{formatINR(o.total)}</p>
                        <span className="text-[10px] text-[#6E655E]">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 2. EMPLOYEE MANAGEMENT ─────────────────────────────────────────────────────
export const AdminEmployeesView: React.FC<PeopleProps> = ({ data, onRefresh, onNotify }) => {
  const { employees, orders, tasks } = data;
  const [search, setSearch] = useState('');
  const [modalEmp, setModalEmp] = useState<
    (Partial<EmployeeRecord> & { initialPassword?: string; resetPassword?: string }) | null
  >(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const openAdd = () => {
    setIsNew(true);
    setModalEmp({
      name: '',
      email: '',
      phone: '+91 ',
      designation: 'Fragrance Specialist',
      department: 'Order Management',
      salary: 48000,
      role: 'EMPLOYEE',
      status: 'Active',
      joiningDate: new Date().toISOString().slice(0, 10),
      avatarUrl: 'asset:velora-enchanted-mirage',
      permissions: ['orders', 'tasks'],
      initialPassword: '',
    });
  };

  const togglePermission = (perm: AdminModulePermission) => {
    if (!modalEmp) return;
    const current = modalEmp.permissions || [];
    const next = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];
    setModalEmp({ ...modalEmp, permissions: next });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmp) return;
    setSaving(true);
    try {
      const endpoint = isNew ? '/api/admin/employees' : `/api/admin/employees/${modalEmp.id}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(modalEmp),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save employee.');
      await onRefresh();
      onNotify(
        isNew
          ? `Employee ${json.employee?.name} added.${
              json.employee?.inviteCode ? ` Invite Code: ${json.employee.inviteCode}` : ''
            }`
          : 'Employee record updated.'
      );
      setModalEmp(null);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to save employee.');
    } finally {
      setSaving(false);
    }
  };

  const regenerateInvite = async (emp: EmployeeRecord) => {
    const res = await fetch(`/api/admin/employees/${emp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ regenerateInvite: true }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      await onRefresh();
      onNotify(`New invite code for ${emp.name}: ${json.employee?.inviteCode}`);
    }
  };

  const handleDelete = async (emp: EmployeeRecord) => {
    const res = await fetch(`/api/admin/employees/${emp.id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      await onRefresh();
      onNotify(`${emp.name} removed from directory.`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E6DDD1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex items-center border border-[#E6DDD1] bg-[#FAF8F4] px-3 min-h-[42px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E655E] mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee ID, name, department..."
            className="bg-transparent text-sm w-full focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-[0.14em]"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((emp) => {
          const assignedOrdersCount = orders.filter((o) => o.assignedEmployeeId === emp.id).length;
          const completedTasksCount = tasks.filter(
            (t) => t.assignedToEmployeeId === emp.id && t.status === 'Completed'
          ).length;

          return (
            <div key={emp.id} className="bg-white border border-[#E6DDD1] p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveMediaUrl(emp.avatarUrl)}
                      alt={emp.name}
                      className="w-12 h-12 object-cover bg-[#F2ECE4] border border-[#E6DDD1] shrink-0"
                    />
                    <div>
                      <span className="text-[10px] tracking-[0.16em] uppercase text-[#9A7742] font-semibold">
                        {emp.employeeCode} · {emp.role === 'ADMIN_MANAGER' ? 'Admin Manager' : 'Staff'}
                      </span>
                      <h3 className="font-serif text-xl text-[#181614] leading-tight">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-[#6E655E]">{emp.designation}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] border ${getStatusTone(emp.status)}`}>
                    {emp.status}
                  </span>
                </div>

                <div className="text-xs text-[#2B2623] space-y-1 bg-[#FAF8F4] p-3 border border-[#E6DDD1]">
                  <p>
                    <strong>Department:</strong> {emp.department}
                  </p>
                  <p>
                    <strong>Email:</strong> {emp.email}
                  </p>
                  <p className="tabular-nums">
                    <strong>Phone:</strong> {emp.phone} · <strong>Salary:</strong>{' '}
                    {formatINR(emp.salary)}/mo
                  </p>
                  <p className="tabular-nums">
                    <strong>Activity:</strong> {assignedOrdersCount} assigned orders ·{' '}
                    {completedTasksCount} completed tasks
                  </p>
                  {emp.inviteCode && (
                    <p className="pt-1 text-[#9A7742] font-semibold">
                      Portal Invite Code: <span className="select-all">{emp.inviteCode}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E6DDD1]">
                <button
                  type="button"
                  onClick={() => regenerateInvite(emp)}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#9A7742] hover:text-[#181614]"
                >
                  <KeyRound className="w-3.5 h-3.5" /> New Invite Code
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNew(false);
                      setModalEmp({ ...emp, resetPassword: '' });
                    }}
                    className="p-2 border border-[#E6DDD1] bg-[#FAF8F4] hover:border-[#181614]"
                    title="Edit Employee"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(emp)}
                    className="p-2 border border-[#ECC8C4] bg-[#FDF1F0] text-[#9E352B]"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      {modalEmp && (
        <div
          onClick={() => setModalEmp(null)}
          className="fixed inset-0 z-50 bg-[#141210]/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#FAF8F4] border border-[#E6DDD1] max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 bg-white border-b border-[#E6DDD1] flex items-center justify-between sticky top-0 z-10">
              <h2 className="font-serif text-2xl text-[#181614]">
                {isNew ? 'Onboard VELORA Employee' : `Edit ${modalEmp.name}`}
              </h2>
              <button
                type="button"
                onClick={() => setModalEmp(null)}
                className="w-9 h-9 flex items-center justify-center border border-[#E6DDD1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalEmp.name || ''}
                    onChange={(e) => setModalEmp({ ...modalEmp, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!isNew}
                    value={modalEmp.email || ''}
                    onChange={(e) => setModalEmp({ ...modalEmp, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={modalEmp.phone || ''}
                    onChange={(e) => setModalEmp({ ...modalEmp, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalEmp.designation || ''}
                    onChange={(e) => setModalEmp({ ...modalEmp, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Department
                  </label>
                  <select
                    value={modalEmp.department || 'Order Management'}
                    onChange={(e) =>
                      setModalEmp({
                        ...modalEmp,
                        department: e.target.value as EmployeeDepartment,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Monthly Salary (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={modalEmp.salary ?? 45000}
                    onChange={(e) => setModalEmp({ ...modalEmp, salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Portal Role
                  </label>
                  <select
                    value={modalEmp.role || 'EMPLOYEE'}
                    onChange={(e) =>
                      setModalEmp({
                        ...modalEmp,
                        role: e.target.value as 'ADMIN_MANAGER' | 'EMPLOYEE',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  >
                    <option value="EMPLOYEE">Employee (Employee Portal)</option>
                    <option value="ADMIN_MANAGER">Admin Manager (Admin Portal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                    Account Status
                  </label>
                  <select
                    value={modalEmp.status || 'Active'}
                    onChange={(e) =>
                      setModalEmp({
                        ...modalEmp,
                        status: e.target.value as 'Active' | 'Inactive',
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-[#E6DDD1] p-4">
                <ImageUploaderField
                  label="Staff Photo"
                  value={modalEmp.avatarUrl || 'asset:velora-enchanted-mirage'}
                  onChange={(url) => setModalEmp({ ...modalEmp, avatarUrl: url })}
                  compact
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#6E655E] mb-1">
                  {isNew
                    ? 'Assign Login Password (optional — leave blank to issue Invite Code)'
                    : 'Reset Password (optional, min 8 chars)'}
                </label>
                <input
                  type="password"
                  minLength={8}
                  value={isNew ? modalEmp.initialPassword || '' : modalEmp.resetPassword || ''}
                  onChange={(e) =>
                    setModalEmp(
                      isNew
                        ? { ...modalEmp, initialPassword: e.target.value }
                        : { ...modalEmp, resetPassword: e.target.value }
                    )
                  }
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 bg-white border border-[#E6DDD1] text-sm"
                />
              </div>

              <div className="bg-white border border-[#E6DDD1] p-4 space-y-2">
                <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#9A7742] font-medium">
                  <Shield className="w-3.5 h-3.5" /> Module Permissions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm.key} className="inline-flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(modalEmp.permissions || []).includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="accent-[#181614] w-3.5 h-3.5"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEmp(null)}
                  className="px-5 py-2.5 border border-[#E6DDD1] bg-white text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
                >
                  {saving ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 3. ATTENDANCE & LEAVE MANAGEMENT ───────────────────────────────────────────
export const AdminAttendanceView: React.FC<PeopleProps> = ({ data, onRefresh, onNotify }) => {
  const { attendance, leaveRequests, employees } = data;
  const [tab, setTab] = useState<'logs' | 'leave'>('logs');
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attStatus, setAttStatus] = useState<'Present' | 'Late' | 'Half Day' | 'Absent'>('Present');
  const [hours, setHours] = useState(8);
  const [leaveComments, setLeaveComments] = useState<Record<string, string>>({});

  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = attendance.filter((a) => a.date === today);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId) return;
    const res = await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        employeeId: empId,
        date: attDate,
        status: attStatus,
        workingHours: hours,
        checkInTime: attStatus === 'Absent' ? null : '10:00 am',
        checkOutTime: attStatus === 'Absent' ? null : '06:00 pm',
      }),
    });
    if (res.ok) {
      await onRefresh();
      onNotify('Attendance recorded.');
    }
  };

  const handleLeaveDecision = async (leave: LeaveRequestRecord, decision: 'Approved' | 'Rejected') => {
    const res = await fetch(`/api/admin/leave/${leave.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: decision,
        adminComment: leaveComments[leave.id] || `${decision} by Admin`,
      }),
    });
    if (res.ok) {
      await onRefresh();
      onNotify(`Leave ${decision.toLowerCase()} for ${leave.employeeName}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E6DDD1] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#6E655E]">Present Today</p>
          <p className="font-serif text-3xl text-[#1F5D37] tabular-nums mt-1">
            {todayRecords.filter((r) => r.status === 'Present').length}
          </p>
        </div>
        <div className="bg-white border border-[#E6DDD1] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#6E655E]">Late Today</p>
          <p className="font-serif text-3xl text-[#8A5D19] tabular-nums mt-1">
            {todayRecords.filter((r) => r.status === 'Late').length}
          </p>
        </div>
        <div className="bg-white border border-[#E6DDD1] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#6E655E]">Absent Today</p>
          <p className="font-serif text-3xl text-[#9E352B] tabular-nums mt-1">
            {todayRecords.filter((r) => r.status === 'Absent').length}
          </p>
        </div>
        <div className="bg-white border border-[#E6DDD1] p-4">
          <p className="text-[11px] uppercase tracking-wider text-[#6E655E]">Pending Leaves</p>
          <p className="font-serif text-3xl text-[#181614] tabular-nums mt-1">
            {leaveRequests.filter((l) => l.status === 'Pending').length}
          </p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('logs')}
          className={`px-4 py-2 text-xs uppercase tracking-[0.14em] border ${
            tab === 'logs'
              ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
              : 'bg-white text-[#6E655E] border-[#E6DDD1]'
          }`}
        >
          Attendance Logs ({attendance.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('leave')}
          className={`px-4 py-2 text-xs uppercase tracking-[0.14em] border ${
            tab === 'leave'
              ? 'bg-[#181614] text-[#FAF8F4] border-[#181614]'
              : 'bg-white text-[#6E655E] border-[#E6DDD1]'
          }`}
        >
          Leave Requests ({leaveRequests.length})
        </button>
      </div>

      {tab === 'logs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleMarkAttendance}
            className="lg:col-span-4 bg-white border border-[#E6DDD1] p-5 space-y-4 self-start"
          >
            <h3 className="font-serif text-xl text-[#181614]">Log / Adjust Attendance</h3>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Employee</label>
              <select
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Date</label>
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Status</label>
                <select
                  value={attStatus}
                  onChange={(e) =>
                    setAttStatus(e.target.value as 'Present' | 'Late' | 'Half Day' | 'Absent')
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Hours</label>
                <input
                  type="number"
                  step={0.5}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
            >
              Save Attendance Record
            </button>
          </form>

          <div className="lg:col-span-8 bg-white border border-[#E6DDD1] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] uppercase tracking-wider text-[#6E655E]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDD1]">
                {attendance.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 px-4 tabular-nums">{a.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#181614] block">{a.employeeName}</span>
                      <span className="text-[#6E655E]">{a.department}</span>
                    </td>
                    <td className="py-3 px-4 tabular-nums">{a.checkInTime || '—'}</td>
                    <td className="py-3 px-4 tabular-nums">{a.checkOutTime || '—'}</td>
                    <td className="py-3 px-4 tabular-nums">{a.workingHours}h</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 border ${getStatusTone(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {leaveRequests.map((l) => (
            <div key={l.id} className="bg-white border border-[#E6DDD1] p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl text-[#181614]">{l.employeeName}</h3>
                    <span className={`px-2 py-0.5 text-[11px] border ${getStatusTone(l.status)}`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6E655E] mt-0.5">
                    {l.employeeCode} · {l.department} · {l.leaveType}: {l.startDate} to {l.endDate}
                  </p>
                </div>
                {l.reviewedBy && (
                  <span className="text-xs text-[#6E655E]">Reviewed by {l.reviewedBy}</span>
                )}
              </div>

              <p className="text-sm text-[#2B2623] bg-[#FAF8F4] p-3 border border-[#E6DDD1]">
                {l.reason}
              </p>

              {l.status === 'Pending' && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={leaveComments[l.id] || ''}
                    onChange={(e) => setLeaveComments({ ...leaveComments, [l.id]: e.target.value })}
                    placeholder="Admin comment (optional)..."
                    className="flex-1 min-w-[200px] px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleLeaveDecision(l, 'Approved')}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#1F5D37] text-white text-xs uppercase tracking-wider"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLeaveDecision(l, 'Rejected')}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#9E352B] text-white text-xs uppercase tracking-wider"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── 4. TASK MANAGEMENT ─────────────────────────────────────────────────────────
export const AdminTasksView: React.FC<PeopleProps> = ({ data, onRefresh, onNotify }) => {
  const { tasks, employees, orders } = data;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(employees[0]?.id || '');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [relatedOrder, setRelatedOrder] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title,
        description,
        assignedToEmployeeId: assignedTo,
        priority,
        deadline,
        relatedOrderNumber: relatedOrder || null,
      }),
    });
    if (res.ok) {
      setTitle('');
      setDescription('');
      setRelatedOrder('');
      await onRefresh();
      onNotify('Task assigned to staff member.');
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE', credentials: 'include' });
    await onRefresh();
    onNotify('Task deleted.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form
        onSubmit={handleCreate}
        className="lg:col-span-4 bg-white border border-[#E6DDD1] p-5 space-y-4 self-start"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#9A7742]" />
          <h2 className="font-serif text-2xl text-[#181614]">Assign Staff Task</h2>
        </div>

        <div>
          <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Task Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dispatch Gold-Seal Gift Order"
            className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Assign To *</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.department})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Urgent')
              }
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
            Linked Order (Optional)
          </label>
          <select
            value={relatedOrder}
            onChange={(e) => setRelatedOrder(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
          >
            <option value="">None</option>
            {orders.slice(0, 15).map((o) => (
              <option key={o.orderNumber} value={o.orderNumber}>
                {o.orderNumber} — {o.customer.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Instructions</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Assign Task
        </button>
      </form>

      <div className="lg:col-span-8 space-y-3">
        {tasks.map((t) => (
          <div key={t.id} className="bg-white border border-[#E6DDD1] p-5 space-y-2.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#FAF3E6] text-[#8A5D19] border border-[#E6D1AD]">
                    {t.priority}
                  </span>
                  <span className={`text-[10px] uppercase px-2 py-0.5 border ${getStatusTone(t.status)}`}>
                    {t.status}
                  </span>
                  {t.relatedOrderNumber && (
                    <span className="text-xs font-medium text-[#9A7742]">
                      Order {t.relatedOrderNumber}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl text-[#181614] mt-1">{t.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="p-2 border border-[#ECC8C4] text-[#9E352B]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {t.description && <p className="text-xs text-[#2B2623]">{t.description}</p>}

            <div className="flex flex-wrap items-center justify-between text-xs text-[#6E655E] pt-1 border-t border-[#E6DDD1]">
              <span>
                Assigned to <strong className="text-[#181614]">{t.assignedToName}</strong>
              </span>
              <span>Due: {t.deadline}</span>
            </div>

            {t.comments.length > 0 && (
              <div className="bg-[#FAF8F4] p-2.5 border border-[#E6DDD1] space-y-1 text-xs">
                {t.comments.map((c) => (
                  <p key={c.id} className="flex items-start gap-1.5">
                    <MessageSquare className="w-3 h-3 text-[#9A7742] mt-0.5 shrink-0" />
                    <span>
                      <strong>{c.author}:</strong> {c.text}
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="bg-white border border-[#E6DDD1] p-10 text-center text-sm text-[#6E655E]">
            <CheckSquare className="w-8 h-8 text-[#9A7742] mx-auto mb-2" />
            No tasks created yet.
          </div>
        )}
      </div>
    </div>
  );
};
