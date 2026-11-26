import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Calendar,
  Users,
  Flag,
  Lock,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { LocationCombobox } from '../components/ui/LocationCombobox';
import {
  AppPage,
  RideRequestForRider,
  RideWithDriver,
  User,
} from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/SkeletonList';
import { Modal } from '../components/ui/Modal';
import { StatusLabel } from '../components/ui/StatusLabel';
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
} from '../utils/formatters';

interface FindRidePageProps {
  user: Omit<User, 'password'>;
  onNavigate: (page: AppPage) => void;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
  onRefreshCounts: () => void;
}

export function FindRidePage({
  user,
  onNavigate,
  onNotify,
  onRefreshCounts,
}: FindRidePageProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [rides, setRides] = useState<RideWithDriver[]>([]);
  const [myRequests, setMyRequests] = useState<RideRequestForRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request modal state
  const [selectedRide, setSelectedRide] = useState<RideWithDriver | null>(null);
  const [seatsRequested, setSeatsRequested] = useState(1);
  const [pickupNote, setPickupNote] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);

  // Report modal state
  const [reportRide, setReportRide] = useState<RideWithDriver | null>(null);
  const [reportReason, setReportReason] = useState('Misleading route or fare');
  const [reportDetails, setReportDetails] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);

  const loadRides = useCallback(() => {
    setLoading(true);
    setError(null);
    window.setTimeout(() => {
      try {
        const results = dataService.searchRides({ source, destination, date });
        const requests = dataService.getMyRequests(user.id);
        setRides(results);
        setMyRequests(requests);
      } catch {
        setError('Could not load available rides. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 160);
  }, [source, destination, date, user.id]);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const handleResetFilters = () => {
    setSource('');
    setDestination('');
    setDate('');
  };

  const openRequestModal = (ride: RideWithDriver) => {
    setSelectedRide(ride);
    setSeatsRequested(1);
    setPickupNote('');
    setRequestError(null);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRide) return;
    setRequestError(null);

    const res = dataService.requestSeats(user.id, {
      rideId: selectedRide.id,
      seatsRequested,
      pickupNote,
    });

    if (!res.ok) {
      setRequestError(res.error ?? 'Failed to submit request.');
      return;
    }

    setSelectedRide(null);
    onRefreshCounts();
    onNotify('Seat request sent! Driver contact info unlocks once accepted.', 'success');
    loadRides();
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportRide) return;
    setReportError(null);

    const res = dataService.submitReport(user.id, {
      targetRideId: reportRide.id,
      reason: reportReason,
      details: reportDetails,
    });

    if (!res.ok) {
      setReportError(res.error ?? 'Unable to submit report.');
      return;
    }

    setReportRide(null);
    setReportDetails('');
    onNotify('Safety report submitted to Campus Transport Administration.', 'success');
  };

  const getActiveRequestForRide = (rideId: string) =>
    myRequests.find(
      (req) => req.rideId === rideId && (req.status === 'pending' || req.status === 'accepted')
    );

  return (
    <div>
      <PageHeader
        title="Find a Ride"
        subtitle="Search upcoming student carpools by pickup point, destination, or departure date. Driver phone numbers stay hidden until your seat request is accepted."
        action={
          <button
            type="button"
            onClick={() => onNavigate('my-requests')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-[#FCFBF8] px-4 py-2 text-sm font-medium text-[#244B3B] hover:bg-[#DCE7DC]/50 transition-colors whitespace-nowrap"
          >
            <span>My Requests</span>
          </button>
        }
      />

      {/* Search Bar */}
      <section className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 mb-6 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label htmlFor="search-source" className="block text-xs font-medium text-[#5F665F] mb-1.5">
              From (Source)
            </label>
            <LocationCombobox
              id="search-source"
              value={source}
              onChange={setSource}
              placeholder="e.g., Nageshwar City, Hostel A"
              iconTone="muted"
            />
          </div>

          <div className="md:col-span-4">
            <label htmlFor="search-dest" className="block text-xs font-medium text-[#5F665F] mb-1.5">
              To (Destination)
            </label>
            <LocationCombobox
              id="search-dest"
              value={destination}
              onChange={setDestination}
              placeholder="e.g., Marwadi University Main Gate"
              iconTone="forest"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="search-date" className="block text-xs font-medium text-[#5F665F] mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="h-4 w-4 text-[#5F665F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="search-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white pl-9 pr-3 py-2.5 text-sm text-[#292D29] font-mono focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
              />
            </div>
          </div>

          <div className="md:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset search filters"
              className="w-full md:w-auto inline-flex h-[42px] items-center justify-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-white px-3 text-xs font-medium text-[#5F665F] hover:bg-[#EFEAE1] hover:text-[#292D29] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="md:hidden">Clear Filters</span>
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-[#9B2C2C]/20 bg-[#F9E6E6] px-4 py-3 text-sm text-[#9B2C2C]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <SkeletonList rows={3} />
      ) : rides.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching rides found"
          description="No open rides match your current route or date filters. Try clearing your filters or offer a ride on this route yourself."
          actionLabel={source || destination || date ? 'Clear Search Filters' : 'Offer a Ride'}
          onAction={source || destination || date ? handleResetFilters : () => onNavigate('offer-ride')}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#5F665F]">
            <span className="tabular-nums">
              Showing {rides.length} upcoming ride{rides.length === 1 ? '' : 's'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#244B3B]" aria-hidden="true" />
              <span>Cost-sharing only · Phone numbers protected</span>
            </span>
          </div>

          <div className="space-y-3.5">
            {rides.map((ride) => {
              const isOwnRide = ride.driverId === user.id;
              const existingActive = getActiveRequestForRide(ride.id);
              const isFull = ride.availableSeats <= 0;

              return (
                <article
                  key={ride.id}
                  className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)] transition-colors hover:border-[#244B3B]/25"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5F665F] tabular-nums">
                        <span className="font-medium text-[#244B3B]">
                          {formatDateLabel(ride.date)} · {formatTimeLabel(ride.time)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ride.driverName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{ride.driverEnrollment}</span>
                        {ride.driverVehicle ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {ride.driverVehicle.color} {ride.driverVehicle.makeModel}
                            </span>
                          </>
                        ) : null}
                      </div>

                      <h3 className="text-lg font-semibold text-[#292D29]">
                        {ride.source} → {ride.destination}
                      </h3>

                      {ride.notes ? (
                        <p className="text-sm text-[#5F665F] leading-relaxed">{ride.notes}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6 shrink-0 border-t lg:border-t-0 border-[#244B3B]/10 pt-4 lg:pt-0">
                      <div className="text-left lg:text-right tabular-nums">
                        <p className="text-lg font-semibold font-mono text-[#244B3B]">
                          {formatCurrency(ride.farePerSeat)}
                        </p>
                        <p className="text-xs text-[#5F665F]">cost share / seat</p>
                      </div>

                      <div className="text-left lg:text-right tabular-nums">
                        <p className="inline-flex items-center gap-1 text-sm font-medium text-[#292D29]">
                          <Users className="h-3.5 w-3.5 text-[#244B3B]" aria-hidden="true" />
                          <span>
                            {ride.availableSeats} / {ride.totalSeats}
                          </span>
                        </p>
                        <p className="text-xs text-[#5F665F]">seats left</p>
                      </div>

                      <div className="flex items-center gap-2 ml-auto sm:ml-0">
                        {isOwnRide ? (
                          <button
                            type="button"
                            onClick={() => onNavigate('my-rides')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-[#DCE7DC]/45 px-4 py-2 text-xs font-medium text-[#244B3B] hover:bg-[#DCE7DC] transition-colors whitespace-nowrap"
                          >
                            <span>Your Ride · Manage</span>
                          </button>
                        ) : existingActive ? (
                          <button
                            type="button"
                            onClick={() => onNavigate('my-requests')}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#244B3B]/15 bg-[#EFEAE1] px-3.5 py-2 text-xs font-medium text-[#292D29] hover:bg-[#DCE7DC]/50 transition-colors whitespace-nowrap"
                          >
                            <StatusLabel status={existingActive.status} />
                            <span>View</span>
                          </button>
                        ) : isFull ? (
                          <span className="rounded-lg bg-[#EFEAE1] px-4 py-2 text-xs font-medium text-[#5F665F] whitespace-nowrap">
                            Ride Full
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRequestModal(ride)}
                            className="inline-flex items-center justify-center rounded-lg bg-[#244B3B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap"
                          >
                            Request Seat
                          </button>
                        )}

                        {!isOwnRide ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReportRide(ride);
                              setReportError(null);
                              setReportDetails('');
                            }}
                            title="Report listing"
                            aria-label={`Report ride from ${ride.source} to ${ride.destination}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#244B3B]/15 text-[#5F665F] hover:bg-[#F9E6E6] hover:text-[#9B2C2C] transition-colors shrink-0"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Seat Modal */}
      <Modal
        isOpen={Boolean(selectedRide)}
        title="Request Carpool Seat"
        onClose={() => setSelectedRide(null)}
      >
        {selectedRide ? (
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="rounded-lg bg-[#F7F5EF] border border-[#244B3B]/10 p-3.5 text-sm">
              <p className="font-semibold text-[#292D29]">
                {selectedRide.source} → {selectedRide.destination}
              </p>
              <p className="mt-1 text-xs text-[#5F665F] tabular-nums">
                {formatDateLabel(selectedRide.date)} at {formatTimeLabel(selectedRide.time)} · Driver:{' '}
                {selectedRide.driverName} · {formatCurrency(selectedRide.farePerSeat)}/seat
              </p>
            </div>

            {requestError ? (
              <div className="rounded-lg bg-[#F9E6E6] px-3.5 py-2.5 text-xs text-[#9B2C2C] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            ) : null}

            <div>
              <label htmlFor="req-seats" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Seats Needed (max {selectedRide.availableSeats})
              </label>
              <select
                id="req-seats"
                value={seatsRequested}
                onChange={(e) => setSeatsRequested(Number(e.target.value))}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono text-[#292D29] focus:border-[#244B3B] focus:outline-none"
              >
                {Array.from({ length: selectedRide.availableSeats }, (_, idx) => idx + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} seat{n > 1 ? 's' : ''} ({formatCurrency(n * selectedRide.farePerSeat)} shared)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-note" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Pickup Landmark Note (Optional)
              </label>
              <textarea
                id="req-note"
                rows={3}
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                placeholder="e.g., Waiting outside Library East steps at 8:25 AM."
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none"
              />
            </div>

            <p className="text-xs text-[#5F665F] flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#244B3B] shrink-0" />
              <span>Driver contact details become visible in My Requests after acceptance.</span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRide(null)}
                className="rounded-lg border border-[#244B3B]/20 px-4 py-2 text-sm font-medium text-[#5F665F] hover:bg-[#EFEAE1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#244B3B] px-5 py-2 text-sm font-medium text-white hover:bg-[#1C3B2E]"
              >
                Send Request
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Report Ride Modal */}
      <Modal
        isOpen={Boolean(reportRide)}
        title="Report Ride Listing"
        onClose={() => setReportRide(null)}
      >
        {reportRide ? (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <p className="text-xs text-[#5F665F]">
              Reporting: <span className="font-medium text-[#292D29]">{reportRide.source} → {reportRide.destination}</span> ({reportRide.driverName})
            </p>

            {reportError ? (
              <div className="rounded-lg bg-[#F9E6E6] px-3.5 py-2.5 text-xs text-[#9B2C2C]">
                {reportError}
              </div>
            ) : null}

            <div>
              <label htmlFor="rep-reason" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Reason
              </label>
              <select
                id="rep-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29]"
              >
                <option value="Misleading route or fare">Misleading route or commercial fare</option>
                <option value="Pickup point safety concern">Pickup point safety concern</option>
                <option value="Suspicious or duplicate listing">Suspicious or duplicate listing</option>
                <option value="Other community guideline issue">Other community guideline issue</option>
              </select>
            </div>

            <div>
              <label htmlFor="rep-details" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Details for Campus Admin
              </label>
              <textarea
                id="rep-details"
                rows={3}
                required
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what should be reviewed (at least 10 characters)..."
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportRide(null)}
                className="rounded-lg border border-[#244B3B]/20 px-4 py-2 text-sm font-medium text-[#5F665F] hover:bg-[#EFEAE1]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#9B2C2C] px-5 py-2 text-sm font-medium text-white hover:bg-[#7F2323]"
              >
                Submit Report
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
