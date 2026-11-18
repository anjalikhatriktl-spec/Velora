import React, { useState } from 'react';
import {
  ArrowDownUp,
  Bell,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Lock,
  MessageSquare,
  Package,
  Send,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { formatINR } from '../../data/catalog';
import {
  EMPLOYEE_ALLOWED_ORDER_STATUSES,
  formatDateTimeIN,
  getStatusTone,
} from '../../lib/dashboardUtils';
import { resolveMediaUrl } from '../../lib/mediaAssets';
import {
  AttendanceRecord,
  BottleVolume,
  EmployeeDepartment,
  InventoryMovement,
  LeaveRequestRecord,
  NotificationRecord,
  OrderRecord,
  PageRoute,
  Product,
  SupportEnquiry,
  TaskRecord,
} from '../../types';
import { ImageUploaderField } from '../../components/ImageUploaderField';

export interface EmployeeWorkspaceData {
  profile: {
    id: string;
    employeeCode: string;
    name: string;
    email: string;
    phone: string;
    designation: string;
    department: EmployeeDepartment;
    role: string;
    joiningDate: string;
    avatarUrl: string;
    bio?: string;
    address?: string;
  } | null;
  todayAttendance: AttendanceRecord | null;
  attendanceHistory: AttendanceRecord[];
  tasks: TaskRecord[];
  orders: OrderRecord[];
  enquiries: SupportEnquiry[];
  inventoryProducts: Product[];
  inventoryMovements: InventoryMovement[];
  leaveRequests: LeaveRequestRecord[];
  notifications: NotificationRecord[];
  permissions: {
    support: boolean;
    inventory: boolean;
  };
  performance: {
    assignedTasks: number;
    completedTasks: number;
    assignedOrders: number;
    processedOrders: number;
    attendancePercentage: number;
  };
}

interface EmpViewProps {
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNavigate: (r: PageRoute) => void;
  onNotify: (msg: string) => void;
}

// ── 1. EMPLOYEE HOME DASHBOARD ─────────────────────────────────────────────────
export const EmployeeHomeView: React.FC<EmpViewProps> = ({
  data,
  onRefresh,
  onNavigate,
  onNotify,
}) => {
  const { profile, todayAttendance, tasks, orders, notifications, performance } = data;
  const [busy, setBusy] = useState(false);

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/employee/attendance/check-in', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Unable to check in.');
      await onRefresh();
      onNotify(`Checked in at ${json.attendance?.checkInTime}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Check-in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/employee/attendance/check-out', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Unable to check out.');
      await onRefresh();
      onNotify(`Checked out at ${json.attendance?.checkOutTime}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Check-out failed.');
    } finally {
      setBusy(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner + Live Check-In Widget */}
      <div className="bg-[#141210] text-[#FAF8F4] p-6 sm:p-8 border border-[#2D2824] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile && (
            <img
              src={resolveMediaUrl(profile.avatarUrl)}
              alt={profile.name}
              className="w-16 h-16 object-cover border border-[#B8935A] shrink-0"
            />
          )}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#B8935A]">
              {profile?.employeeCode || 'VELORA STAFF'} · {profile?.department || 'Operations'}
            </p>
            <h2 className="font-serif text-3xl text-white mt-0.5">
              Welcome, {profile?.name || 'Team Member'}
            </h2>
            <p className="text-xs text-[#C8BEB2] mt-1">{profile?.designation}</p>
          </div>
        </div>

        <div className="bg-[#1D1A17] border border-[#2D2824] p-4 flex flex-wrap items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#B8935A] block">
              Today&rsquo;s Attendance
            </span>
            <p className="text-sm font-medium text-white mt-0.5 tabular-nums">
              {todayAttendance?.checkInTime
                ? `In: ${todayAttendance.checkInTime}${
                    todayAttendance.checkOutTime ? ` · Out: ${todayAttendance.checkOutTime}` : ''
                  }`
                : 'Not Checked In Yet'}
            </p>
          </div>
          <div className="flex gap-2">
            {!todayAttendance?.checkInTime && (
              <button
                type="button"
                disabled={busy}
                onClick={handleCheckIn}
                className="px-4 py-2 bg-[#B8935A] text-[#141210] hover:bg-white text-xs font-semibold uppercase tracking-wider"
              >
                Check In
              </button>
            )}
            {todayAttendance?.checkInTime && !todayAttendance?.checkOutTime && (
              <button
                type="button"
                disabled={busy}
                onClick={handleCheckOut}
                className="px-4 py-2 border border-[#B8935A] text-[#B8935A] hover:bg-[#B8935A] hover:text-[#141210] text-xs font-semibold uppercase tracking-wider"
              >
                Check Out
              </button>
            )}
            {todayAttendance?.checkOutTime && (
              <span className="px-3 py-1.5 bg-[#1F5D37]/30 border border-[#C5DFCC]/40 text-xs text-[#C5DFCC]">
                Shift Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('employee-tasks')}
          className="text-left bg-white border border-[#E6DDD1] hover:border-[#B8935A] p-5"
        >
          <span className="text-[11px] uppercase tracking-wider text-[#6E655E]">Pending Tasks</span>
          <p className="font-serif text-3xl text-[#181614] tabular-nums mt-2">
            {pendingTasks.length}
          </p>
          <p className="text-xs text-[#9A7742] mt-1">
            {performance.completedTasks}/{performance.assignedTasks} completed total
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('employee-orders')}
          className="text-left bg-white border border-[#E6DDD1] hover:border-[#B8935A] p-5"
        >
          <span className="text-[11px] uppercase tracking-wider text-[#6E655E]">
            Assigned Orders
          </span>
          <p className="font-serif text-3xl text-[#181614] tabular-nums mt-2">
            {performance.assignedOrders}
          </p>
          <p className="text-xs text-[#6E655E] mt-1">
            {performance.processedOrders} dispatched or delivered
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('employee-attendance')}
          className="text-left bg-white border border-[#E6DDD1] hover:border-[#B8935A] p-5"
        >
          <span className="text-[11px] uppercase tracking-wider text-[#6E655E]">
            Attendance Rate
          </span>
          <p className="font-serif text-3xl text-[#1F5D37] tabular-nums mt-2">
            {performance.attendancePercentage}%
          </p>
          <p className="text-xs text-[#6E655E] mt-1">Logged check-in punctuality</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('employee-notifications')}
          className="text-left bg-white border border-[#E6DDD1] hover:border-[#B8935A] p-5"
        >
          <span className="text-[11px] uppercase tracking-wider text-[#6E655E]">
            Unread Alerts
          </span>
          <p className="font-serif text-3xl text-[#181614] tabular-nums mt-2">
            {notifications.filter((n) => !n.read).length}
          </p>
          <p className="text-xs text-[#6E655E] mt-1">Assignments &amp; leave updates</p>
        </button>
      </div>

      {/* Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E6DDD1] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6DDD1] pb-3">
            <h3 className="font-serif text-xl text-[#181614]">Priority Tasks</h3>
            <button
              type="button"
              onClick={() => onNavigate('employee-tasks')}
              className="text-xs uppercase tracking-wider text-[#9A7742]"
            >
              View All →
            </button>
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-[#6E655E] py-4">All assigned tasks are completed.</p>
          ) : (
            pendingTasks.slice(0, 4).map((t) => (
              <div key={t.id} className="p-3 bg-[#FAF8F4] border border-[#E6DDD1] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#181614]">{t.title}</span>
                  <span className={`px-2 py-0.5 border ${getStatusTone(t.status)}`}>{t.status}</span>
                </div>
                <p className="text-[#6E655E]">
                  Priority: {t.priority} · Deadline: {t.deadline}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white border border-[#E6DDD1] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#E6DDD1] pb-3">
            <h3 className="font-serif text-xl text-[#181614]">Orders to Fulfill</h3>
            <button
              type="button"
              onClick={() => onNavigate('employee-orders')}
              className="text-xs uppercase tracking-wider text-[#9A7742]"
            >
              Manage →
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-xs text-[#6E655E] py-4">No orders assigned right now.</p>
          ) : (
            orders.slice(0, 4).map((o) => (
              <div key={o.orderNumber} className="p-3 bg-[#FAF8F4] border border-[#E6DDD1] text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#181614] tabular-nums">{o.orderNumber}</span>
                  <p className="text-[#6E655E]">
                    {o.customer.fullName} · {o.customer.city}
                  </p>
                </div>
                <span className={`px-2 py-0.5 border ${getStatusTone(o.status || 'New Order')}`}>
                  {o.status || 'New Order'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ── 2. MY PROFILE (PERSONAL FIELDS ONLY, ROLE/DEPT LOCKED) ─────────────────────
export const EmployeeProfileView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onRefreshAuth: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onRefreshAuth, onNotify }) => {
  const { profile } = data;
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || 'asset:velora-enchanted-mirage');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!profile) {
    return (
      <div className="bg-white border border-[#E6DDD1] p-8 text-center text-sm text-[#6E655E]">
        No employee profile is linked to this account.
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/employee/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, phone, address, bio, avatarUrl }),
    });
    if (res.ok) {
      await Promise.all([onRefresh(), onRefreshAuth()]);
      onNotify('Personal profile saved.');
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      onNotify(json.error || 'Password update failed.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    onNotify('Password updated securely.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form
        onSubmit={handleSaveProfile}
        className="lg:col-span-7 bg-white border border-[#E6DDD1] p-6 space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-[#E6DDD1] pb-3">
          <UserCheck className="w-4 h-4 text-[#9A7742]" />
          <h2 className="font-serif text-2xl text-[#181614]">Personal Details</h2>
        </div>

        <ImageUploaderField label="Profile Portrait" value={avatarUrl} onChange={setAvatarUrl} compact />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Staff Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E6DDD1]">
          <div>
            <label className="block text-[10px] uppercase text-[#6E655E] mb-1">
              Employee Code (Admin Locked)
            </label>
            <input
              type="text"
              disabled
              value={profile.employeeCode}
              className="w-full px-3 py-2 bg-[#F2ECE4] border border-[#E6DDD1] text-xs text-[#6E655E]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#6E655E] mb-1">
              Department &amp; Designation (Admin Locked)
            </label>
            <input
              type="text"
              disabled
              value={`${profile.department} — ${profile.designation}`}
              className="w-full px-3 py-2 bg-[#F2ECE4] border border-[#E6DDD1] text-xs text-[#6E655E]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
        >
          Save Personal Details
        </button>
      </form>

      <form
        onSubmit={handleChangePass}
        className="lg:col-span-5 bg-white border border-[#E6DDD1] p-6 space-y-4 self-start"
      >
        <div className="flex items-center gap-2 border-b border-[#E6DDD1] pb-3">
          <Lock className="w-4 h-4 text-[#9A7742]" />
          <h2 className="font-serif text-2xl text-[#181614]">Change Password</h2>
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
          className="w-full py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

// ── 3. MY ATTENDANCE ───────────────────────────────────────────────────────────
export const EmployeeAttendanceView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onNotify }) => {
  const { todayAttendance, attendanceHistory, performance } = data;
  const [busy, setBusy] = useState(false);

  const checkIn = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/employee/attendance/check-in', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Check-in error.');
      await onRefresh();
      onNotify(`Checked in at ${json.attendance?.checkInTime}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to check in.');
    } finally {
      setBusy(false);
    }
  };

  const checkOut = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/employee/attendance/check-out', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Check-out error.');
      await onRefresh();
      onNotify(`Checked out at ${json.attendance?.checkOutTime}.`);
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Unable to check out.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6DDD1] p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarCheck2 className="w-6 h-6 text-[#9A7742]" />
          <div>
            <h2 className="font-serif text-2xl text-[#181614]">Daily Shift Check-In / Out</h2>
            <p className="text-xs text-[#6E655E]">
              Attendance Rate: <strong className="text-[#181614]">{performance.attendancePercentage}%</strong> · Duplicate check-ins per day are prevented automatically.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy || Boolean(todayAttendance?.checkInTime)}
            onClick={checkIn}
            className="px-5 py-2.5 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] disabled:opacity-40 text-xs uppercase tracking-wider"
          >
            {todayAttendance?.checkInTime ? `Checked In (${todayAttendance.checkInTime})` : 'Check In Now'}
          </button>
          <button
            type="button"
            disabled={busy || !todayAttendance?.checkInTime || Boolean(todayAttendance?.checkOutTime)}
            onClick={checkOut}
            className="px-5 py-2.5 border border-[#181614] text-[#181614] hover:bg-[#181614] hover:text-white disabled:opacity-40 text-xs uppercase tracking-wider"
          >
            {todayAttendance?.checkOutTime
              ? `Checked Out (${todayAttendance.checkOutTime})`
              : 'Check Out Now'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E6DDD1] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] uppercase tracking-wider text-[#6E655E]">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Check In</th>
              <th className="py-3 px-4">Check Out</th>
              <th className="py-3 px-4">Hours</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDD1]">
            {attendanceHistory.map((a) => (
              <tr key={a.id}>
                <td className="py-3 px-4 tabular-nums font-medium">{a.date}</td>
                <td className="py-3 px-4 tabular-nums">{a.checkInTime || '—'}</td>
                <td className="py-3 px-4 tabular-nums">{a.checkOutTime || '—'}</td>
                <td className="py-3 px-4 tabular-nums">{a.workingHours} hrs</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 border ${getStatusTone(a.status)}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 4. MY TASKS ────────────────────────────────────────────────────────────────
export const EmployeeTasksView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onNotify }) => {
  const { tasks } = data;
  const [comments, setComments] = useState<Record<string, string>>({});

  const updateTask = async (id: string, status?: TaskRecord['status'], comment?: string) => {
    const res = await fetch(`/api/employee/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, comment }),
    });
    if (res.ok) {
      if (comment) setComments((prev) => ({ ...prev, [id]: '' }));
      await onRefresh();
      onNotify('Task updated.');
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((t) => (
        <div key={t.id} className="bg-white border border-[#E6DDD1] p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase px-2 py-0.5 bg-[#FAF3E6] text-[#8A5D19] border border-[#E6D1AD]">
                  {t.priority}
                </span>
                {t.relatedOrderNumber && (
                  <span className="text-xs font-medium text-[#9A7742]">
                    Order {t.relatedOrderNumber}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-2xl text-[#181614] mt-1">{t.title}</h3>
              <p className="text-xs text-[#6E655E]">
                Assigned by {t.assignedBy} · Deadline: {t.deadline}
              </p>
            </div>
            <select
              value={t.status}
              onChange={(e) => updateTask(t.id, e.target.value as TaskRecord['status'])}
              className={`px-3 py-1.5 text-xs border ${getStatusTone(t.status)}`}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {t.description && <p className="text-sm text-[#2B2623]">{t.description}</p>}

          {t.comments.length > 0 && (
            <div className="bg-[#FAF8F4] p-3 border border-[#E6DDD1] space-y-1.5 text-xs">
              {t.comments.map((c) => (
                <p key={c.id} className="flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#9A7742] mt-0.5 shrink-0" />
                  <span>
                    <strong>{c.author}:</strong> {c.text}
                  </span>
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={comments[t.id] || ''}
              onChange={(e) => setComments({ ...comments, [t.id]: e.target.value })}
              placeholder="Add progress note or completion update..."
              className="flex-1 px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
            />
            <button
              type="button"
              onClick={() =>
                comments[t.id]?.trim() && updateTask(t.id, undefined, comments[t.id])
              }
              className="px-4 py-2 bg-[#181614] text-[#FAF8F4] text-xs uppercase tracking-wider"
            >
              Post Note
            </button>
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="bg-white border border-[#E6DDD1] p-10 text-center text-sm text-[#6E655E]">
          <ClipboardList className="w-8 h-8 text-[#9A7742] mx-auto mb-2" />
          No tasks assigned to you right now.
        </div>
      )}
    </div>
  );
};

// ── 5. ASSIGNED ORDERS ─────────────────────────────────────────────────────────
export const EmployeeOrdersView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onNotify }) => {
  const { orders } = data;
  const [notes, setNotes] = useState<Record<string, string>>({});

  const updateOrder = async (ord: OrderRecord, status?: string, internalNotes?: string) => {
    if (!ord.id) return;
    const res = await fetch(`/api/employee/orders/${ord.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, internalNotes }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      onNotify(json.error || 'Unable to update order.');
      return;
    }
    await onRefresh();
    onNotify(`Order ${ord.orderNumber} updated.`);
  };

  return (
    <div className="space-y-4">
      {orders.map((ord) => (
        <div key={ord.orderNumber} className="bg-white border border-[#E6DDD1] p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6DDD1] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl text-[#181614] tabular-nums">
                  {ord.orderNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[11px] border ${getStatusTone(
                    ord.status || 'New Order'
                  )}`}
                >
                  {ord.status || 'New Order'}
                </span>
              </div>
              <p className="text-xs text-[#6E655E] mt-1">
                {ord.customer.fullName} · {ord.customer.phone} · {ord.customer.address},{' '}
                {ord.customer.city}, {ord.customer.state} – {ord.customer.postalCode}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={ord.status || 'Confirmed'}
                onChange={(e) => updateOrder(ord, e.target.value, notes[ord.orderNumber])}
                className="px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
              >
                {EMPLOYEE_ALLOWED_ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ord.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 bg-[#FAF8F4] border border-[#E6DDD1] text-xs">
                <img
                  src={resolveMediaUrl(item.image)}
                  alt={item.name}
                  className="w-10 h-12 object-cover bg-white border border-[#E6DDD1]"
                />
                <div>
                  <p className="font-medium text-[#181614]">{item.name}</p>
                  <p className="text-[#6E655E]">
                    {item.volume} × {item.quantity} · COD {ord.paymentMethod.includes('UPI') ? 'UPI' : 'Cash'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={notes[ord.orderNumber] ?? ord.internalNotes ?? ''}
              onChange={(e) => setNotes({ ...notes, [ord.orderNumber]: e.target.value })}
              placeholder="Packing & dispatch note (e.g., Sealed gift wrap + BlueDart AWB)..."
              className="flex-1 min-w-[200px] px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
            />
            <button
              type="button"
              onClick={() => updateOrder(ord, undefined, notes[ord.orderNumber] ?? ord.internalNotes)}
              className="px-4 py-2 bg-[#181614] text-[#FAF8F4] text-xs uppercase tracking-wider"
            >
              Save Fulfillment Note
            </button>
          </div>
        </div>
      ))}
      {orders.length === 0 && (
        <div className="bg-white border border-[#E6DDD1] p-10 text-center text-sm text-[#6E655E]">
          <ShoppingBag className="w-8 h-8 text-[#9A7742] mx-auto mb-2" />
          No orders assigned to your queue.
        </div>
      )}
    </div>
  );
};

// ── 6. CUSTOMER SUPPORT ACCESS ─────────────────────────────────────────────────
export const EmployeeSupportView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onNotify }) => {
  const { enquiries, permissions } = data;
  const [notes, setNotes] = useState<Record<string, string>>({});

  if (!permissions.support) {
    return (
      <div className="bg-white border border-[#E6DDD1] p-10 text-center text-sm text-[#6E655E]">
        Customer Support tools are restricted to authorized Support Team members.
      </div>
    );
  }

  const updateEnq = async (id: string, status?: string, note?: string) => {
    const res = await fetch(`/api/employee/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status, note }),
    });
    if (res.ok) {
      if (note) setNotes((p) => ({ ...p, [id]: '' }));
      await onRefresh();
      onNotify('Support ticket updated.');
    }
  };

  return (
    <div className="space-y-4">
      {enquiries.map((enq) => (
        <div key={enq.id} className="bg-white border border-[#E6DDD1] p-5 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl text-[#181614]">{enq.subject}</h3>
              <p className="text-xs text-[#6E655E]">
                {enq.customerName} · {enq.email} · {enq.phone || 'N/A'}
              </p>
            </div>
            <select
              value={enq.status}
              onChange={(e) => updateEnq(enq.id, e.target.value)}
              className={`px-3 py-1.5 text-xs border ${getStatusTone(enq.status)}`}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <p className="text-sm bg-[#FAF8F4] p-3 border border-[#E6DDD1]">{enq.message}</p>
          {enq.notes.map((n) => (
            <p key={n.id} className="text-xs text-[#6E655E] pl-3 border-l-2 border-[#B8935A]">
              <strong>{n.author}:</strong> {n.text}
            </p>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={notes[enq.id] || ''}
              onChange={(e) => setNotes({ ...notes, [enq.id]: e.target.value })}
              placeholder="Log resolution or customer callback summary..."
              className="flex-1 px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-xs"
            />
            <button
              type="button"
              onClick={() => notes[enq.id]?.trim() && updateEnq(enq.id, undefined, notes[enq.id])}
              className="px-4 py-2 bg-[#181614] text-white text-xs uppercase"
            >
              Add Note
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── 7. INVENTORY ACCESS ────────────────────────────────────────────────────────
export const EmployeeInventoryView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onNotify }) => {
  const { inventoryProducts, inventoryMovements, permissions } = data;
  const [target, setTarget] = useState<{
    productId: string;
    productName: string;
    volume: BottleVolume;
  } | null>(null);
  const [type, setType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [quantity, setQuantity] = useState(5);
  const [reason, setReason] = useState('Warehouse count verification');

  if (!permissions.inventory) {
    return (
      <div className="bg-white border border-[#E6DDD1] p-10 text-center text-sm text-[#6E655E]">
        Inventory tools are restricted to authorized Inventory &amp; Dispatch personnel.
      </div>
    );
  }

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    const res = await fetch('/api/employee/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        productId: target.productId,
        volume: target.volume,
        type,
        quantity,
        reason,
      }),
    });
    if (res.ok) {
      setTarget(null);
      await onRefresh();
      onNotify('Inventory count updated.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6DDD1] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF8F4] border-b border-[#E6DDD1] uppercase tracking-wider text-[#6E655E]">
            <tr>
              <th className="py-3 px-4">Perfume</th>
              <th className="py-3 px-4">30ml Stock</th>
              <th className="py-3 px-4">50ml Stock</th>
              <th className="py-3 px-4">100ml Stock</th>
              <th className="py-3 px-4 text-right">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DDD1]">
            {inventoryProducts.map((p) => (
              <tr key={p.id}>
                <td className="py-3 px-4 font-medium text-sm text-[#181614]">{p.name}</td>
                <td className="py-3 px-4 tabular-nums">{p.stock?.['30ml'] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{p.stock?.['50ml'] ?? 0}</td>
                <td className="py-3 px-4 tabular-nums">{p.stock?.['100ml'] ?? 0}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setTarget({ productId: p.id, productName: p.name, volume: '50ml' })
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#181614] text-white uppercase"
                  >
                    <ArrowDownUp className="w-3 h-3" /> Update Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#E6DDD1] p-5 space-y-2">
        <h3 className="font-serif text-xl text-[#181614]">Recent Stock Movements</h3>
        {inventoryMovements.slice(0, 8).map((m) => (
          <div key={m.id} className="text-xs flex justify-between py-2 border-b border-[#E6DDD1]/60 last:border-0">
            <span>
              <strong>{m.productName}</strong> ({m.volume}): {m.previousStock} →{' '}
              <strong>{m.newStock}</strong> ({m.reason})
            </span>
            <span className="text-[#6E655E] tabular-nums">{formatDateTimeIN(m.createdAt)}</span>
          </div>
        ))}
      </div>

      {target && (
        <div
          onClick={() => setTarget(null)}
          className="fixed inset-0 z-50 bg-[#141210]/60 flex items-center justify-center p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAdjust}
            className="w-full max-w-md bg-white border border-[#E6DDD1] p-6 space-y-4"
          >
            <h3 className="font-serif text-2xl text-[#181614]">Update Stock: {target.productName}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Volume</label>
                <select
                  value={target.volume}
                  onChange={(e) =>
                    setTarget({ ...target, volume: e.target.value as BottleVolume })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                >
                  <option value="30ml">30ml</option>
                  <option value="50ml">50ml</option>
                  <option value="100ml">100ml</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Action</label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as 'stock_in' | 'stock_out' | 'adjustment')
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
                >
                  <option value="stock_in">Stock In</option>
                  <option value="stock_out">Stock Out</option>
                  <option value="adjustment">Exact Count</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Quantity</label>
              <input
                type="number"
                min={0}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Reason</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTarget(null)}
                className="px-4 py-2 border border-[#E6DDD1] text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#181614] text-white text-xs uppercase"
              >
                Save Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ── 8. LEAVE REQUESTS ──────────────────────────────────────────────────────────
export const EmployeeLeaveView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
  onNotify: (msg: string) => void;
}> = ({ data, onRefresh, onNotify }) => {
  const { leaveRequests } = data;
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Emergency'>('Casual Leave');
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/employee/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ leaveType, startDate, endDate, reason }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      onNotify(json.error || 'Unable to submit leave request.');
      return;
    }
    setReason('');
    await onRefresh();
    onNotify('Leave request sent to Admin for review.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-5 bg-white border border-[#E6DDD1] p-6 space-y-4 self-start"
      >
        <h2 className="font-serif text-2xl text-[#181614]">Apply for Leave</h2>
        <div>
          <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) =>
              setLeaveType(
                e.target.value as 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Emergency'
              )
            }
            className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
          >
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-[#6E655E] mb-1">End Date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] uppercase text-[#6E655E] mb-1">Reason *</label>
          <textarea
            rows={3}
            required
            minLength={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe reason for leave..."
            className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E6DDD1] text-sm resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#181614] text-[#FAF8F4] hover:bg-[#9A7742] text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5" /> Submit Request
        </button>
      </form>

      <div className="lg:col-span-7 space-y-3">
        {leaveRequests.map((l) => (
          <div key={l.id} className="bg-white border border-[#E6DDD1] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[#181614]">{l.leaveType}</h3>
              <span className={`px-2.5 py-0.5 text-[11px] border ${getStatusTone(l.status)}`}>
                {l.status}
              </span>
            </div>
            <p className="text-xs text-[#6E655E] tabular-nums">
              {l.startDate} to {l.endDate}
            </p>
            <p className="text-sm text-[#2B2623]">{l.reason}</p>
            {l.adminComment && (
              <p className="text-xs text-[#9A7742] bg-[#FAF8F4] p-2.5 border border-[#E6DDD1]">
                Admin Note ({l.reviewedBy}): {l.adminComment}
              </p>
            )}
          </div>
        ))}
        {leaveRequests.length === 0 && (
          <div className="bg-white border border-[#E6DDD1] p-10 text-center text-sm text-[#6E655E]">
            No leave requests filed yet.
          </div>
        )}
      </div>
    </div>
  );
};

// ── 9. EMPLOYEE NOTIFICATIONS ──────────────────────────────────────────────────
export const EmployeeNotificationsView: React.FC<{
  data: EmployeeWorkspaceData;
  onRefresh: () => Promise<void>;
}> = ({ data, onRefresh }) => {
  const { notifications } = data;
  const markRead = async (id?: string) => {
    await fetch('/api/employee/notifications/read', {
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
            My Notifications ({notifications.filter((n) => !n.read).length} unread)
          </h2>
        </div>
        <button
          type="button"
          onClick={() => markRead()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#181614] text-white text-xs uppercase"
        >
          <Check className="w-3.5 h-3.5" /> Mark All Read
        </button>
      </div>

      <div className="bg-white border border-[#E6DDD1] divide-y divide-[#E6DDD1]">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 flex items-start justify-between gap-4 ${!n.read ? 'bg-[#FAF8F4]' : ''}`}>
            <div>
              <p className="font-medium text-sm text-[#181614]">{n.title}</p>
              <p className="text-xs text-[#6E655E] mt-0.5">{n.message}</p>
              <p className="text-[11px] text-[#8A8076] mt-1 tabular-nums">
                {formatDateTimeIN(n.createdAt)}
              </p>
            </div>
            {!n.read && (
              <button
                type="button"
                onClick={() => markRead(n.id)}
                className="px-3 py-1.5 border border-[#E6DDD1] text-[11px] uppercase"
              >
                Read
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-8 text-center text-xs text-[#6E655E]">No notifications yet.</div>
        )}
      </div>
    </div>
  );
};
