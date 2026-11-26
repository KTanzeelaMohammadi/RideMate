import React, { useEffect, useState } from 'react';
import {
  Car,
  Users,
  IndianRupee,
  Calendar,
  ArrowRight,
  Search,
  PlusCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { AppPage, DashboardSummary, User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/SkeletonList';
import {
  formatCurrency,
  formatDateLabel,
  formatRelativeTime,
  formatTimeLabel,
} from '../utils/formatters';

interface DashboardPageProps {
  user: Omit<User, 'password'>;
  onNavigate: (page: AppPage) => void;
}

export function DashboardPage({ user, onNavigate }: DashboardPageProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      setSummary(dataService.getDashboardSummary(user.id));
      setLoading(false);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [user.id]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle={`${user.department} · ${user.enrollmentNumber}`}
        action={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('find-ride')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-[#FCFBF8] px-4 py-2 text-sm font-medium text-[#244B3B] hover:bg-[#DCE7DC]/50 transition-colors whitespace-nowrap"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Find a Ride</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('offer-ride')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#244B3B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              <span>Offer a Ride</span>
            </button>
          </div>
        }
      />

      {loading || !summary ? (
        <SkeletonList rows={3} />
      ) : (
        <div className="space-y-8">
          {/* 4-column KPI strip */}
          <section aria-label="Carpool summary metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Rides Offered</span>
                <Car className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold text-[#292D29] font-mono tabular-nums">
                {summary.ridesOffered}
              </p>
              <p className="mt-1 text-xs text-[#5F665F]">Active & completed trips</p>
            </div>

            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Rides Joined</span>
                <Users className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold text-[#292D29] font-mono tabular-nums">
                {summary.ridesJoined}
              </p>
              <p className="mt-1 text-xs text-[#5F665F]">Accepted passenger seats</p>
            </div>

            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Seats Filled</span>
                <Calendar className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold text-[#292D29] font-mono tabular-nums">
                {summary.seatsFilled}
              </p>
              <p className="mt-1 text-xs text-[#5F665F]">Students matched as driver</p>
            </div>

            <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
              <div className="flex items-center justify-between text-xs font-medium text-[#5F665F]">
                <span>Total Fare Shared</span>
                <IndianRupee className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-semibold text-[#244B3B] font-mono tabular-nums">
                {formatCurrency(summary.totalFareShared)}
              </p>
              <p className="mt-1 text-xs text-[#5F665F]">Fuel cost-sharing total</p>
            </div>
          </section>

          {/* Main 2-column content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Upcoming Rides */}
            <section className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#292D29]">Upcoming Rides</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('my-rides')}
                  className="text-xs font-medium text-[#244B3B] hover:underline inline-flex items-center gap-1"
                >
                  <span>Manage rides</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {summary.upcomingDriverRides.length === 0 &&
              summary.upcomingJoinedRides.length === 0 ? (
                <EmptyState
                  icon={Car}
                  title="No upcoming rides scheduled"
                  description="Search available student routes heading to campus or publish your own departure time to share fuel costs."
                  actionLabel="Browse Available Rides"
                  onAction={() => onNavigate('find-ride')}
                />
              ) : (
                <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 divide-y divide-[#244B3B]/10 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
                  {summary.upcomingDriverRides.map((ride) => (
                    <div key={ride.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-[#244B3B] font-medium">
                          Driving · {formatDateLabel(ride.date)} · {formatTimeLabel(ride.time)}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#292D29]">
                          {ride.source} → {ride.destination}
                        </h3>
                        <p className="mt-1 text-xs text-[#5F665F] tabular-nums">
                          {ride.availableSeats} of {ride.totalSeats} seats open · {formatCurrency(ride.farePerSeat)} per seat
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('my-rides')}
                        className="inline-flex items-center justify-center rounded-lg border border-[#244B3B]/20 px-3.5 py-2 text-xs font-medium text-[#244B3B] hover:bg-[#DCE7DC]/50 transition-colors whitespace-nowrap shrink-0"
                      >
                        View Requests
                      </button>
                    </div>
                  ))}

                  {summary.upcomingJoinedRides.map((req) => (
                    <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs text-[#5F665F] font-medium">
                          Passenger ({req.seatsRequested} seat{req.seatsRequested > 1 ? 's' : ''}) ·{' '}
                          {formatDateLabel(req.ride.date)} · {formatTimeLabel(req.ride.time)}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#292D29]">
                          {req.ride.source} → {req.ride.destination}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5F665F]">
                          <span>Driver: {req.ride.driverName}</span>
                          {req.driverPhone ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[#244B3B]">
                              <Phone className="h-3 w-3" aria-hidden="true" />
                              {req.driverPhone}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigate('my-requests')}
                        className="inline-flex items-center justify-center rounded-lg border border-[#244B3B]/20 px-3.5 py-2 text-xs font-medium text-[#244B3B] hover:bg-[#DCE7DC]/50 transition-colors whitespace-nowrap shrink-0"
                      >
                        Trip Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#292D29]">Recent Activity</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('notifications')}
                  className="text-xs font-medium text-[#244B3B] hover:underline inline-flex items-center gap-1"
                >
                  <span>All alerts</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {summary.recentActivity.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No recent activity yet"
                  description="When you offer a ride or request seats, updates and confirmations will appear here."
                  actionLabel="Open RideMate Assistant"
                  onAction={() => onNavigate('assistant')}
                />
              ) : (
                <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 divide-y divide-[#244B3B]/10 shadow-[0_1px_3px_rgba(36,75,59,0.04)]">
                  {summary.recentActivity.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.targetPage)}
                      className="w-full text-left p-4 hover:bg-[#DCE7DC]/25 transition-colors block"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-[#292D29]">{item.label}</span>
                        <span className="text-xs font-mono text-[#5F665F] tabular-nums shrink-0">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#5F665F] leading-relaxed">{item.detail}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
