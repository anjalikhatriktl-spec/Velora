import { OrderStatus } from '../types';

export const ORDER_STATUS_LIST: OrderStatus[] = [
  'New Order',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
];

export const EMPLOYEE_ALLOWED_ORDER_STATUSES: OrderStatus[] = [
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export function formatDateTimeIN(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return iso;
  }
}

export function formatDateIN(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function getStatusTone(status: string): string {
  switch (status) {
    case 'Delivered':
    case 'Approved':
    case 'Present':
    case 'Active':
    case 'Completed':
    case 'Resolved':
      return 'bg-[#EDF5EF] text-[#1F5D37] border-[#C5DFCC]';
    case 'New Order':
    case 'Pending':
    case 'Open':
    case 'Late':
      return 'bg-[#FAF3E6] text-[#8A5D19] border-[#E6D1AD]';
    case 'Confirmed':
    case 'Processing':
    case 'Packed':
    case 'Shipped':
    case 'Out for Delivery':
    case 'In Progress':
      return 'bg-[#F0F4F8] text-[#284B6E] border-[#C9D9E8]';
    case 'Cancelled':
    case 'Returned':
    case 'Rejected':
    case 'Blocked':
    case 'Inactive':
    case 'Absent':
      return 'bg-[#FDF1F0] text-[#9E352B] border-[#ECC8C4]';
    default:
      return 'bg-[#F2ECE4] text-[#2B2623] border-[#E6DDD1]';
  }
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const escapeCell = (val: string | number | boolean | null | undefined) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
