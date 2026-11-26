import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { AppPage, NotificationItem, User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/SkeletonList';
import { formatRelativeTime } from '../utils/formatters';

interface NotificationsPageProps {
  user: Omit<User, 'password'>;
  onNavigate: (page: AppPage) => void;
  onRefreshCounts: () => void;
}

export function NotificationsPage({
  user,
  onNavigate,
  onRefreshCounts,
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      setNotifications(dataService.getNotifications(user.id));
      setLoading(false);
    }, 120);
  }, [user.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = (item: NotificationItem) => {
    if (!item.isRead) {
      dataService.markNotificationRead(user.id, item.id);
      onRefreshCounts();
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }
    onNavigate(item.targetPage);
  };

  const handleMarkAllRead = () => {
    dataService.markAllNotificationsRead(user.id);
    onRefreshCounts();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const visible =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated on seat requests, driver confirmations, cancellations, and administrative notices."
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-[#FCFBF8] px-4 py-2 text-sm font-medium text-[#244B3B] hover:bg-[#DCE7DC]/50 transition-colors whitespace-nowrap"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              <span>Mark All Read</span>
            </button>
          ) : null
        }
      />

      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-lg bg-[#EFEAE1] p-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#FCFBF8] text-[#244B3B] shadow-xs'
                : 'text-[#5F665F] hover:text-[#292D29]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'unread'
                ? 'bg-[#FCFBF8] text-[#244B3B] shadow-xs'
                : 'text-[#5F665F] hover:text-[#292D29]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'All caught up' : 'No notifications yet'}
          description="Request updates, driver approvals, and ride status changes will appear here."
          actionLabel="Find a Ride"
          onAction={() => onNavigate('find-ride')}
        />
      ) : (
        <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 divide-y divide-[#244B3B]/10 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
          {visible.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleMarkRead(item)}
              className={`w-full text-left p-5 transition-colors hover:bg-[#DCE7DC]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                item.isRead ? 'bg-transparent' : 'bg-[#DCE7DC]/20'
              }`}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#5F665F]">
                  <span className="font-semibold text-[#292D29] text-sm">{item.title}</span>
                  {!item.isRead ? (
                    <span className="text-xs font-medium text-[#244B3B]">· Unread</span>
                  ) : null}
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{formatRelativeTime(item.createdAt)}</span>
                </div>
                <p className="text-sm text-[#5F665F] leading-relaxed">{item.message}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#244B3B] whitespace-nowrap shrink-0">
                <span>Open</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
