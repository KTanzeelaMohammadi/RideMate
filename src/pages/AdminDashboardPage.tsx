import React, { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Car,
  ClipboardList,
  Flag,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { AdminOverview, Report, User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonList } from '../components/ui/SkeletonList';
import { StatusLabel } from '../components/ui/StatusLabel';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
} from '../utils/formatters';

interface AdminDashboardPageProps {
  user: Omit<User, 'password'>;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
}

type AdminTab = 'users' | 'rides' | 'reports';

export function AdminDashboardPage({ user, onNotify }: AdminDashboardPageProps) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [tab, setTab] = useState<AdminTab>('users');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Resolve report modal
  const [resolvingReport, setResolvingReport] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const loadAdminData = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      const res = dataService.getAdminOverview(user.id);
      if (!res.ok || !res.data) {
        setAuthError(res.error ?? 'Unauthorized access.');
        setLoading(false);
        return;
      }
      setAuthError(null);
      setOverview(res.data);
      setLoading(false);
    }, 150);
  }, [user.id]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleToggleBlock = (targetUserId: string) => {
    const res = dataService.toggleBlockUser(user.id, targetUserId);
    if (!res.ok || !res.data) {
      onNotify(res.error ?? 'Unable to update user status.', 'error');
      return;
    }
    onNotify(
      res.data.isBlocked
        ? 'User account blocked and open rides cancelled.'
        : 'User account unblocked.',
      'success'
    );
    loadAdminData();
  };

  const handleRemoveRide = (rideId: string) => {
    const res = dataService.adminRemoveRide(user.id, rideId);
    if (!res.ok) {
      onNotify(res.error ?? 'Unable to remove ride.', 'error');
      return;
    }
    onNotify('Ride listing removed and affected students notified.', 'success');
    loadAdminData();
  };

  const handleResolveReport = (status: 'resolved' | 'dismissed') => {
    if (!resolvingReport) return;
    const res = dataService.resolveReport(user.id, resolvingReport.id, status, adminNote);
    setResolvingReport(null);
    setAdminNote('');
    if (!res.ok) {
      onNotify(res.error ?? 'Unable to update report.', 'error');
      return;
    }
    onNotify(`Report marked ${status}.`, 'success');
    loadAdminData();
  };

  if (user.role !== 'admin' || authError) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Administrator Access Required"
        description={
          authError ??
          'Only Campus Transport Administrators can access user moderation, ride removal, and report resolution.'
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Console"
        subtitle="Oversee campus carpool users, active ride listings, seat requests, and safety reports."
      />

      {loading || !overview ? (
        <SkeletonList rows={3} />
      ) : (
        <div className="space-y-6">
          {/* 4-Column Admin KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Total Users</span>
                <Users className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[#292D29]">
                {overview.totalUsers}
              </p>
            </div>

            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Total Rides</span>
                <Car className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[#292D29]">
                {overview.totalRides}
              </p>
            </div>

            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Total Requests</span>
                <ClipboardList className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[#292D29]">
                {overview.totalRequests}
              </p>
            </div>

            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Reports (Open / Total)</span>
                <Flag className="h-4 w-4 text-[#9B2C2C]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold font-mono tabular-nums text-[#292D29]">
                {overview.openReports} / {overview.totalReports}
              </p>
            </div>
          </section>

          {/* Segmented Tabs */}
          <div className="inline-flex rounded-lg bg-[#EFEAE1] p-1">
            {(
              [
                { id: 'users', label: `Users (${overview.users.length})` },
                { id: 'rides', label: `Rides (${overview.rides.length})` },
                { id: 'reports', label: `Reports (${overview.reports.length})` },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  tab === item.id
                    ? 'bg-[#FCFBF8] text-[#244B3B] shadow-xs'
                    : 'text-[#5F665F] hover:text-[#292D29]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Users Table */}
          {tab === 'users' ? (
            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 overflow-x-auto shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#244B3B]/10 text-xs font-medium text-[#5F665F]">
                    <th className="py-3.5 px-5">Student / Staff</th>
                    <th className="py-3.5 px-4">Enrollment</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#244B3B]/10 text-sm">
                  {overview.users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#DCE7DC]/20 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="font-medium text-[#292D29]">{u.name}</p>
                        <p className="text-xs text-[#5F665F]">{u.email}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#292D29]">
                        {u.enrollmentNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs capitalize text-[#5F665F]">
                        {u.role}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusLabel status={u.isBlocked ? 'blocked' : 'active'} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {u.id === user.id ? (
                          <span className="text-xs text-[#5F665F]">Current Admin</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(u.id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                              u.isBlocked
                                ? 'border-[#244B3B]/25 text-[#244B3B] hover:bg-[#DCE7DC]/50'
                                : 'border-[#9B2C2C]/25 text-[#9B2C2C] hover:bg-[#F9E6E6]'
                            }`}
                          >
                            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{u.isBlocked ? 'Unblock User' : 'Block User'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Rides Table */}
          {tab === 'rides' ? (
            overview.rides.length === 0 ? (
              <EmptyState
                icon={Car}
                title="No rides in system"
                description="Active and completed rides posted by students will appear here."
              />
            ) : (
              <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 divide-y divide-[#244B3B]/10 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
                {overview.rides.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#5F665F] tabular-nums">
                        <StatusLabel status={r.status} />
                        <span>
                          {formatDateLabel(r.date)} · {formatTimeLabel(r.time)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Driver: {r.driverName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          {r.availableSeats}/{r.totalSeats} seats · {formatCurrency(r.farePerSeat)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{r.requestCount} request{r.requestCount === 1 ? '' : 's'}</span>
                      </div>
                      <p className="text-base font-semibold text-[#292D29]">
                        {r.source} → {r.destination}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRide(r.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#9B2C2C]/25 px-3.5 py-2 text-xs font-medium text-[#9B2C2C] hover:bg-[#F9E6E6] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove Ride</span>
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : null}

          {/* Reports List */}
          {tab === 'reports' ? (
            overview.reports.length === 0 ? (
              <EmptyState
                icon={Flag}
                title="No reports filed"
                description="Student safety or listing reports submitted from Find a Ride will appear here."
              />
            ) : (
              <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 divide-y divide-[#244B3B]/10 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
                {overview.reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#5F665F]">
                        <StatusLabel status={rep.status} />
                        <span className="font-semibold text-[#292D29]">{rep.reason}</span>
                        <span aria-hidden="true">·</span>
                        <span>Reported by {rep.reporterName}</span>
                      </div>
                      {rep.targetRideSummary ? (
                        <p className="text-xs font-medium text-[#244B3B]">
                          Ride: {rep.targetRideSummary}
                          {rep.targetUserName ? ` · Driver: ${rep.targetUserName}` : ''}
                        </p>
                      ) : null}
                      <p className="text-sm text-[#292D29] leading-relaxed">{rep.details}</p>
                      {rep.adminNote ? (
                        <p className="text-xs text-[#5F665F]">Admin note: {rep.adminNote}</p>
                      ) : null}
                    </div>

                    {rep.status === 'open' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingReport(rep);
                          setAdminNote('');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#244B3B] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap shrink-0"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Review & Resolve</span>
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )
          ) : null}
        </div>
      )}

      <Modal
        isOpen={Boolean(resolvingReport)}
        title="Resolve Safety Report"
        onClose={() => setResolvingReport(null)}
      >
        {resolvingReport ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#F7F5EF] p-3.5 text-xs text-[#5F665F] space-y-1">
              <p className="font-semibold text-[#292D29]">{resolvingReport.reason}</p>
              <p>{resolvingReport.details}</p>
            </div>

            <div>
              <label htmlFor="admin-note" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Resolution Note
              </label>
              <textarea
                id="admin-note"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Document the action taken or guidance provided..."
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleResolveReport('dismissed')}
                className="rounded-lg border border-[#244B3B]/20 px-4 py-2 text-sm font-medium text-[#5F665F] hover:bg-[#EFEAE1]"
              >
                Dismiss Report
              </button>
              <button
                type="button"
                onClick={() => handleResolveReport('resolved')}
                className="rounded-lg bg-[#244B3B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C3B2E]"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
