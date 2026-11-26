import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';

type StatusKind =
  | 'open'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'removed'
  | 'resolved'
  | 'dismissed'
  | 'blocked'
  | 'active';

const STATUS_META: Record<
  StatusKind,
  { label: string; colorClass: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  open: {
    label: 'Open',
    colorClass: 'text-[#244B3B] bg-[#DCE7DC]/60',
    Icon: CheckCircle2,
  },
  active: {
    label: 'Active',
    colorClass: 'text-[#244B3B] bg-[#DCE7DC]/60',
    Icon: CheckCircle2,
  },
  accepted: {
    label: 'Accepted',
    colorClass: 'text-[#1E5631] bg-[#DCE7DC]/75',
    Icon: CheckCircle2,
  },
  completed: {
    label: 'Completed',
    colorClass: 'text-[#244B3B] bg-[#EFEAE1]',
    Icon: CheckCircle2,
  },
  resolved: {
    label: 'Resolved',
    colorClass: 'text-[#1E5631] bg-[#DCE7DC]/75',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'Pending',
    colorClass: 'text-[#8A5A19] bg-[#F5ECD9]',
    Icon: Clock,
  },
  rejected: {
    label: 'Rejected',
    colorClass: 'text-[#9B2C2C] bg-[#F9E6E6]',
    Icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    colorClass: 'text-[#5F665F] bg-[#EFEAE1]',
    Icon: Ban,
  },
  dismissed: {
    label: 'Dismissed',
    colorClass: 'text-[#5F665F] bg-[#EFEAE1]',
    Icon: Ban,
  },
  removed: {
    label: 'Removed',
    colorClass: 'text-[#9B2C2C] bg-[#F9E6E6]',
    Icon: AlertCircle,
  },
  blocked: {
    label: 'Blocked',
    colorClass: 'text-[#9B2C2C] bg-[#F9E6E6]',
    Icon: ShieldAlert,
  },
};

export function StatusLabel({ status }: { status: StatusKind }) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 ${meta.colorClass}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
