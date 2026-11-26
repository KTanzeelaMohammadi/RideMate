import React, { useCallback, useEffect, useState } from 'react';
import {
  ClipboardList,
  Phone,
  Lock,
  Ban,
  Search,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import {
  AppPage,
  RequestStatus,
  RideRequestForRider,
  User,
} from '../types/ridemate';
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

interface MyRequestsPageProps {
  user: Omit<User, 'password'>;
  onNavigate: (page: AppPage) => void;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
  onRefreshCounts: () => void;
}

type RequestFilter = 'all' | RequestStatus;

export function MyRequestsPage({
  user,
  onNavigate,
  onNotify,
  onRefreshCounts,
}: MyRequestsPageProps) {
  const [requests, setRequests] = useState<RideRequestForRider[]>([]);
  const [filter, setFilter] = useState<RequestFilter>('all');
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<RideRequestForRider | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => {
      setRequests(dataService.getMyRequests(user.id));
      setLoading(false);
    }, 140);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    const res = dataService.cancelMyRequest(user.id, cancelTarget.id);
    setCancelTarget(null);
    if (!res.ok) {
      onNotify(res.error ?? 'Unable to cancel request.', 'error');
      return;
    }
    onNotify('Seat request cancelled.', 'success');
    onRefreshCounts();
    loadData();
  };

  const filtered = requests.filter((req) =>
    filter === 'all' ? true : req.status === filter
  );

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Track Pending, Accepted, Rejected, and Cancelled seat requests. Driver contact details appear exclusively once a request is Accepted."
        action={
          <button
            type="button"
            onClick={() => onNavigate('find-ride')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#244B3B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Find a Ride</span>
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex flex-wrap rounded-lg bg-[#EFEAE1] p-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'rejected', label: 'Rejected' },
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
          {filtered.length} request{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <SkeletonList rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={filter === 'all' ? 'No ride requests yet' : `No ${filter} requests`}
          description="Browse open campus carpool routes and request seats to coordinate commutes with fellow students."
          actionLabel="Browse Available Rides"
          onAction={() => onNavigate('find-ride')}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const canCancel = req.status === 'pending' || req.status === 'accepted';
            const totalCostShare = req.seatsRequested * req.ride.farePerSeat;

            return (
              <article
                key={req.id}
                className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)]"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#5F665F] tabular-nums">
                      <StatusLabel status={req.status} />
                      <span>
                        {formatDateLabel(req.ride.date)} · {formatTimeLabel(req.ride.time)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {req.seatsRequested} seat{req.seatsRequested > 1 ? 's' : ''} requested
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#244B3B]">
                        {formatCurrency(totalCostShare)} shared
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#292D29]">
                      {req.ride.source} → {req.ride.destination}
                    </h3>

                    <div className="text-xs text-[#5F665F] flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span>Driver: {req.ride.driverName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{req.ride.driverEnrollment}</span>
                      {req.ride.driverVehicle ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>
                            {req.ride.driverVehicle.color} {req.ride.driverVehicle.makeModel} ({req.ride.driverVehicle.plateNumber})
                          </span>
                        </>
                      ) : null}
                    </div>

                    {req.pickupNote ? (
                      <p className="text-xs text-[#5F665F]">Your note: "{req.pickupNote}"</p>
                    ) : null}

                    {/* Privacy-enforced driver contact panel */}
                    <div className="pt-1">
                      {req.status === 'accepted' && req.driverPhone ? (
                        <div className="inline-flex items-center gap-2 rounded-lg bg-[#DCE7DC]/60 px-3.5 py-2 text-xs font-medium text-[#244B3B]">
                          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>Driver Contact:</span>
                          <span className="font-mono font-semibold">{req.driverPhone}</span>
                        </div>
                      ) : (
                        <p className="inline-flex items-center gap-1.5 text-xs text-[#5F665F]">
                          <Lock className="h-3.5 w-3.5 text-[#B8A58A]" aria-hidden="true" />
                          <span>
                            Driver phone number is private and unlocked only for Accepted requests.
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {canCancel ? (
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setCancelTarget(req)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#9B2C2C]/25 px-3.5 py-2 text-xs font-medium text-[#9B2C2C] hover:bg-[#F9E6E6] transition-colors whitespace-nowrap"
                      >
                        <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Cancel Request</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(cancelTarget)}
        title="Cancel Seat Request"
        onClose={() => setCancelTarget(null)}
      >
        {cancelTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-[#5F665F] leading-relaxed">
              Cancel your {cancelTarget.seatsRequested}-seat request for{' '}
              <span className="font-medium text-[#292D29]">
                {cancelTarget.ride.source} → {cancelTarget.ride.destination}
              </span>
              ?{' '}
              {cancelTarget.status === 'accepted'
                ? 'Your reserved seats will be returned to the open listing.'
                : 'The driver will be notified that you withdrew this request.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-lg border border-[#244B3B]/20 px-4 py-2 text-sm font-medium text-[#5F665F] hover:bg-[#EFEAE1]"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-lg bg-[#9B2C2C] px-4 py-2 text-sm font-medium text-white hover:bg-[#7F2323]"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
