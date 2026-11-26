import React, { useCallback, useEffect, useState } from 'react';
import {
  Car,
  Check,
  X,
  Phone,
  CheckCircle2,
  Ban,
  Users,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { AppPage, Ride, RideRequestForDriver, User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/SkeletonList';
import { StatusLabel } from '../components/ui/StatusLabel';
import { Modal } from '../components/ui/Modal';
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
} from '../utils/formatters';

interface MyRidesPageProps {
  user: Omit<User, 'password'>;
  onNavigate: (page: AppPage) => void;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
  onRefreshCounts: () => void;
}

type RideFilter = 'all' | 'open' | 'completed' | 'cancelled';

export function MyRidesPage({
  user,
  onNavigate,
  onNotify,
  onRefreshCounts,
}: MyRidesPageProps) {
  const [items, setItems] = useState<Array<{ ride: Ride; requests: RideRequestForDriver[] }>>([]);
  const [filter, setFilter] = useState<RideFilter>('all');
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'cancel' | 'complete';
    ride: Ride;
  } | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      setItems(dataService.getDriverRidesWithRequests(user.id));
      setLoading(false);
    }, 140);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = (requestId: string) => {
    const res = dataService.acceptRequest(user.id, requestId);
    if (!res.ok) {
      onNotify(res.error ?? 'Unable to accept request.', 'error');
      return;
    }
    onNotify('Passenger request accepted and seats updated.', 'success');
    onRefreshCounts();
    loadData();
  };

  const handleReject = (requestId: string) => {
    const res = dataService.rejectRequest(user.id, requestId);
    if (!res.ok) {
      onNotify(res.error ?? 'Unable to decline request.', 'error');
      return;
    }
    onNotify('Passenger request declined.', 'success');
    onRefreshCounts();
    loadData();
  };

  const handleConfirmRideAction = () => {
    if (!confirmAction) return;
    const { type, ride } = confirmAction;
    const res =
      type === 'complete'
        ? dataService.completeRide(user.id, ride.id)
        : dataService.cancelRide(user.id, ride.id);

    setConfirmAction(null);
    if (!res.ok) {
      onNotify(res.error ?? 'Action failed.', 'error');
      return;
    }
    onNotify(
      type === 'complete'
        ? 'Ride marked as completed.'
        : 'Ride cancelled and affected passengers notified.',
      'success'
    );
    onRefreshCounts();
    loadData();
  };

  const filtered = items.filter((entry) =>
    filter === 'all' ? true : entry.ride.status === filter
  );

  return (
    <div>
      <PageHeader
        title="My Rides"
        subtitle="Manage carpool listings you have offered, review incoming student requests, and mark trips completed or cancelled."
        action={
          <button
            type="button"
            onClick={() => onNavigate('offer-ride')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#244B3B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap"
          >
            <span>+ Offer New Ride</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex rounded-lg bg-[#EFEAE1] p-1">
          {(
            [
              { id: 'all', label: 'All Rides' },
              { id: 'open', label: 'Open' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-[#FCFBF8] text-[#244B3B] shadow-xs'
                  : 'text-[#5F665F] hover:text-[#292D29]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#5F665F] tabular-nums">
          {filtered.length} listing{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title={filter === 'all' ? 'You have not offered any rides yet' : `No ${filter} rides`}
          description="Publish your campus commute route to match with fellow students and split fuel costs."
          actionLabel="Offer a Ride"
          onAction={() => onNavigate('offer-ride')}
        />
      ) : (
        <div className="space-y-5">
          {filtered.map(({ ride, requests }) => {
            const pendingCount = requests.filter((r) => r.status === 'pending').length;
            return (
              <article
                key={ride.id}
                className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(36,75,59,0.04)]"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4 border-b border-[#244B3B]/10">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#5F665F] tabular-nums">
                      <StatusLabel status={ride.status} />
                      <span>
                        {formatDateLabel(ride.date)} · {formatTimeLabel(ride.time)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {ride.availableSeats} of {ride.totalSeats} seats left
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#244B3B]">
                        {formatCurrency(ride.farePerSeat)}/seat
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#292D29]">
                      {ride.source} → {ride.destination}
                    </h3>

                    {ride.notes ? (
                      <p className="text-xs text-[#5F665F]">{ride.notes}</p>
                    ) : null}
                  </div>

                  {ride.status === 'open' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: 'complete', ride })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-[#DCE7DC]/45 px-3.5 py-2 text-xs font-medium text-[#244B3B] hover:bg-[#DCE7DC] transition-colors whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Complete</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmAction({ type: 'cancel', ride })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#9B2C2C]/25 px-3.5 py-2 text-xs font-medium text-[#9B2C2C] hover:bg-[#F9E6E6] transition-colors whitespace-nowrap"
                      >
                        <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Cancel Ride</span>
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Passenger Requests Table / List */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-[#292D29] flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#244B3B]" aria-hidden="true" />
                      <span>
                        Passenger Requests ({requests.length})
                        {pendingCount > 0 ? ` · ${pendingCount} awaiting action` : ''}
                      </span>
                    </h4>
                  </div>

                  {requests.length === 0 ? (
                    <p className="text-xs text-[#5F665F] py-2">
                      No seat requests received for this ride yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#244B3B]/10">
                      {requests.map((req) => (
                        <div
                          key={req.id}
                          className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="font-medium text-[#292D29]">{req.riderName}</span>
                              <span className="text-xs font-mono text-[#5F665F]">
                                {req.riderEnrollment}
                              </span>
                              <span className="text-[#B8A58A]" aria-hidden="true">·</span>
                              <span className="text-xs font-medium text-[#244B3B] tabular-nums">
                                {req.seatsRequested} seat{req.seatsRequested > 1 ? 's' : ''}
                              </span>
                              <StatusLabel status={req.status} />
                            </div>
                            {req.pickupNote ? (
                              <p className="text-xs text-[#5F665F]">Note: "{req.pickupNote}"</p>
                            ) : null}
                            {req.status === 'accepted' && req.riderPhone ? (
                              <p className="text-xs font-mono text-[#244B3B] inline-flex items-center gap-1.5">
                                <Phone className="h-3 w-3" aria-hidden="true" />
                                <span>Passenger contact: {req.riderPhone}</span>
                              </p>
                            ) : null}
                          </div>

                          {req.status === 'pending' && ride.status === 'open' ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={ride.availableSeats < req.seatsRequested}
                                onClick={() => handleAccept(req.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#244B3B] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#1C3B2E] disabled:opacity-50 transition-colors whitespace-nowrap"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(req.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#9B2C2C]/25 px-3.5 py-1.5 text-xs font-medium text-[#9B2C2C] hover:bg-[#F9E6E6] transition-colors whitespace-nowrap"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Decline</span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmAction)}
        title={
          confirmAction?.type === 'complete'
            ? 'Mark Ride Completed'
            : 'Cancel Offered Ride'
        }
        onClose={() => setConfirmAction(null)}
      >
        {confirmAction ? (
          <div className="space-y-4">
            <p className="text-sm text-[#5F665F] leading-relaxed">
              {confirmAction.type === 'complete'
                ? `Mark "${confirmAction.ride.source} → ${confirmAction.ride.destination}" as completed? Accepted passengers will be notified and any remaining pending requests will be closed.`
                : `Cancel "${confirmAction.ride.source} → ${confirmAction.ride.destination}"? All pending and accepted passenger requests on this ride will be cancelled and riders will receive an alert.`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-lg border border-[#244B3B]/20 px-4 py-2 text-sm font-medium text-[#5F665F] hover:bg-[#EFEAE1]"
              >
                Keep Open
              </button>
              <button
                type="button"
                onClick={handleConfirmRideAction}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  confirmAction.type === 'complete'
                    ? 'bg-[#244B3B] hover:bg-[#1C3B2E]'
                    : 'bg-[#9B2C2C] hover:bg-[#7F2323]'
                }`}
              >
                {confirmAction.type === 'complete' ? 'Confirm Completed' : 'Yes, Cancel Ride'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
