import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 px-6 py-12 text-center shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCE7DC]/60 text-[#244B3B]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#292D29]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[#5F665F] leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#244B3B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C3B2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#244B3B] whitespace-nowrap"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
