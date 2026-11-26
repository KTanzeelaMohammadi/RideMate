import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[#244B3B]/10 pb-5 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#292D29] text-balance">
          {title}
        </h1>
        <p className="mt-1.5 text-sm sm:text-[15px] text-[#5F665F] max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </div>
      {action ? <div className="shrink-0 flex items-center gap-3">{action}</div> : null}
    </div>
  );
}
