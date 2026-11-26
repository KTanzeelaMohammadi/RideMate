import React from 'react';

interface SkeletonListProps {
  rows?: number;
}

export function SkeletonList({ rows = 3 }: SkeletonListProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 animate-pulse"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2.5 flex-1">
              <div className="h-4 w-48 rounded bg-[#DCE7DC]/70" />
              <div className="h-5 w-72 max-w-full rounded bg-[#EFEAE1]" />
              <div className="h-3.5 w-56 rounded bg-[#EFEAE1]/80" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 rounded-lg bg-[#DCE7DC]/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
