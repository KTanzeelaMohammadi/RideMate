import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { LocationCombobox } from '../components/ui/LocationCombobox';
import { AppPage, User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { formatCurrency, formatDateLabel, formatTimeLabel } from '../utils/formatters';

interface OfferRidePageProps {
  user: Omit<User, 'password'>;
  onNavigate: (page: AppPage) => void;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
}

function getDefaultDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function OfferRidePage({ user, onNavigate, onNotify }: OfferRidePageProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [time, setTime] = useState('08:30');
  const [totalSeats, setTotalSeats] = useState('3');
  const [farePerSeat, setFarePerSeat] = useState('45');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayMinDate = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedSeats = Number(totalSeats);
    const parsedFare = Number(farePerSeat);

    if (source.trim().length < 3 || destination.trim().length < 3) {
      setError('Both source and destination must be at least 3 characters.');
      return;
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError('Source and destination cannot be identical.');
      return;
    }
    if (!date || !time) {
      setError('Please specify both departure date and time.');
      return;
    }
    const departureTs = new Date(`${date}T${time}:00`).getTime();
    if (Number.isNaN(departureTs) || departureTs <= Date.now()) {
      setError('Past dates or times are not allowed. Choose a future departure.');
      return;
    }
    if (!Number.isInteger(parsedSeats) || parsedSeats < 1 || parsedSeats > 6) {
      setError('Available seats must be a whole number between 1 and 6.');
      return;
    }
    if (Number.isNaN(parsedFare) || parsedFare < 0) {
      setError('Fare per seat cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const result = dataService.createRide(user.id, {
        source,
        destination,
        date,
        time,
        totalSeats: parsedSeats,
        farePerSeat: parsedFare,
        notes,
      });
      setIsSubmitting(false);

      if (!result.ok) {
        setError(result.error ?? 'Could not publish ride.');
        return;
      }

      onNotify('Your ride is now live for campus partners to request!', 'success');
      onNavigate('my-rides');
    }, 180);
  };

  return (
    <div>
      <PageHeader
        title="Offer a Ride"
        subtitle="Share empty seats on your daily campus commute and split fuel costs fairly with verified students."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-6 sm:p-7 space-y-5 shadow-[0_1px_3px_rgba(36,75,59,0.04)]"
        >
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-[#9B2C2C]/20 bg-[#F9E6E6] px-4 py-3 text-sm text-[#9B2C2C]"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="offer-source" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Pickup Source
              </label>
              <LocationCombobox
                id="offer-source"
                required
                value={source}
                onChange={setSource}
                placeholder="Search hostel, residency, or custom spot"
                iconTone="muted"
              />
            </div>

            <div>
              <label htmlFor="offer-dest" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Destination
              </label>
              <LocationCombobox
                id="offer-dest"
                required
                value={destination}
                onChange={setDestination}
                placeholder="Search campus gate, station, or custom"
                iconTone="forest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="offer-date" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Departure Date
              </label>
              <input
                id="offer-date"
                type="date"
                required
                min={todayMinDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
              />
            </div>

            <div>
              <label htmlFor="offer-time" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Departure Time
              </label>
              <input
                id="offer-time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="offer-seats" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Available Seats (1–6)
              </label>
              <input
                id="offer-seats"
                type="number"
                required
                min={1}
                max={6}
                step={1}
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
              />
            </div>

            <div>
              <label htmlFor="offer-fare" className="block text-sm font-medium text-[#292D29] mb-1.5">
                Cost-Sharing Fare per Seat (₹)
              </label>
              <input
                id="offer-fare"
                type="number"
                required
                min={0}
                step={1}
                value={farePerSeat}
                onChange={(e) => setFarePerSeat(e.target.value)}
                className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="offer-notes" className="block text-sm font-medium text-[#292D29] mb-1.5">
              Route or Luggage Notes (Optional)
            </label>
            <textarea
              id="offer-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Passing Ring Road junction; space for 2 backpacks."
              className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-[#244B3B]/10">
            <p className="text-xs text-[#5F665F] flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-[#244B3B] shrink-0" aria-hidden="true" />
              <span>Cost-sharing only. No online payment processing occurs in RideMate.</span>
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244B3B] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#1C3B2E] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              <Car className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Ride'}</span>
            </button>
          </div>
        </form>

        {/* Live Preview & Vehicle Info */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#292D29]">Listing Preview</h2>
            <div className="space-y-2 border-t border-[#244B3B]/10 pt-3">
              <p className="text-xs font-medium text-[#244B3B] tabular-nums">
                {date ? formatDateLabel(date) : 'Select date'} ·{' '}
                {time ? formatTimeLabel(time) : 'Select time'}
              </p>
              <p className="text-base font-semibold text-[#292D29]">
                {source.trim() || 'Pickup Source'} → {destination.trim() || 'Destination'}
              </p>
              <p className="text-xs text-[#5F665F] tabular-nums">
                {totalSeats || '0'} seats · {formatCurrency(Math.max(0, Number(farePerSeat) || 0))} per seat
              </p>
            </div>

            <div className="border-t border-[#244B3B]/10 pt-3 text-xs text-[#5F665F] space-y-1.5">
              <p className="font-medium text-[#292D29]">Driver & Vehicle</p>
              <p>{user.name} · {user.enrollmentNumber}</p>
              {user.vehicle ? (
                <p>
                  {user.vehicle.color} {user.vehicle.makeModel} ({user.vehicle.plateNumber})
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="text-[#244B3B] hover:underline font-medium"
                >
                  + Add vehicle details in Profile
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#DCE7DC]/45 border border-[#244B3B]/10 p-5 space-y-2">
            <h3 className="text-xs font-semibold text-[#244B3B] flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Publishing Guidelines</span>
            </h3>
            <ul className="text-xs text-[#5F665F] space-y-1.5 leading-relaxed">
              <li>• Choose well-known campus gates or transit landmarks.</li>
              <li>• Your phone number stays private until you accept a rider.</li>
              <li>• You can complete or cancel a ride anytime from My Rides.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
