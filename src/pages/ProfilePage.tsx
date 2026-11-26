import React, { useState } from 'react';
import {
  User as UserIcon,
  Car,
  Save,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { User } from '../types/ridemate';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';

interface ProfilePageProps {
  user: Omit<User, 'password'>;
  onUserUpdated: (updated: Omit<User, 'password'>) => void;
  onNotify: (msg: string, tone?: 'success' | 'error') => void;
  onResetDemo: () => void;
}

export function ProfilePage({
  user,
  onUserUpdated,
  onNotify,
  onResetDemo,
}: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [department, setDepartment] = useState(user.department);
  const [makeModel, setMakeModel] = useState(user.vehicle?.makeModel ?? '');
  const [color, setColor] = useState(user.vehicle?.color ?? '');
  const [plateNumber, setPlateNumber] = useState(user.vehicle?.plateNumber ?? '');
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = dataService.updateProfile(user.id, {
      name,
      phone,
      department,
      vehicle: {
        makeModel,
        color,
        plateNumber,
      },
    });

    if (!res.ok || !res.data) {
      setError(res.error ?? 'Failed to save profile.');
      return;
    }

    onUserUpdated(res.data);
    onNotify('Profile and vehicle details saved.', 'success');
  };

  return (
    <div>
      <PageHeader
        title="Student Profile"
        subtitle="Update your contact number, academic department, and optional vehicle details shown to matched riders."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-6 sm:p-7 space-y-6 shadow-[0_1px_3px_rgba(36,75,59,0.04)]"
        >
          {error ? (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-[#9B2C2C]/20 bg-[#F9E6E6] px-4 py-3 text-sm text-[#9B2C2C]"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[#292D29] flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-name" className="block text-sm font-medium text-[#292D29] mb-1.5">
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                />
              </div>

              <div>
                <label htmlFor="prof-phone" className="block text-sm font-medium text-[#292D29] mb-1.5">
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-dept" className="block text-sm font-medium text-[#292D29] mb-1.5">
                  Department & Year
                </label>
                <input
                  id="prof-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5F665F] mb-1.5">
                  Enrollment Number (Verified)
                </label>
                <input
                  type="text"
                  readOnly
                  value={user.enrollmentNumber}
                  className="w-full rounded-lg border border-[#244B3B]/10 bg-[#EFEAE1]/70 px-3.5 py-2.5 text-sm font-mono text-[#5F665F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5F665F] mb-1.5">
                Registered Email
              </label>
              <input
                type="email"
                readOnly
                value={user.email}
                className="w-full rounded-lg border border-[#244B3B]/10 bg-[#EFEAE1]/70 px-3.5 py-2.5 text-sm text-[#5F665F]"
              />
            </div>
          </div>

          <div className="border-t border-[#244B3B]/10 pt-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-[#292D29] flex items-center gap-2">
                <Car className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
                <span>Vehicle Details (Optional)</span>
              </h2>
              <p className="text-xs text-[#5F665F] mt-1">
                Shown on rides you offer so passengers can easily identify your vehicle at pickup.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="veh-model" className="block text-sm font-medium text-[#292D29] mb-1.5">
                  Make & Model
                </label>
                <input
                  id="veh-model"
                  type="text"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  placeholder="e.g., Honda Civic"
                  className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29]"
                />
              </div>
              <div>
                <label htmlFor="veh-color" className="block text-sm font-medium text-[#292D29] mb-1.5">
                  Color
                </label>
                <input
                  id="veh-color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g., Forest Green"
                  className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29]"
                />
              </div>
              <div>
                <label htmlFor="veh-plate" className="block text-sm font-medium text-[#292D29] mb-1.5">
                  License Plate
                </label>
                <input
                  id="veh-plate"
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g., GJ-03-RM-4182"
                  className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono uppercase text-[#292D29]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#244B3B]/10">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#244B3B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1C3B2E] transition-colors"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#292D29]">
              <ShieldCheck className="h-4 w-4 text-[#244B3B]" aria-hidden="true" />
              <span>Account & Architecture</span>
            </div>
            <p className="text-xs text-[#5F665F] leading-relaxed">
              Account Role: <span className="font-medium text-[#292D29] capitalize">{user.role}</span>
            </p>
            <p className="text-xs text-[#5F665F] leading-relaxed">
              This MVP stores records in browser <code className="font-mono">localStorage</code> through a repository adapter so a Supabase backend can be connected later without rewriting UI views.
            </p>
          </div>

          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#292D29]">Demo Data Controls</h3>
            <p className="text-xs text-[#5F665F] leading-relaxed">
              Restore the initial campus rides, requests, and sample reports if you want a clean demonstration reset.
            </p>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#244B3B]/20 px-4 py-2 text-xs font-medium text-[#292D29] hover:bg-[#EFEAE1] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Sample Demo Data</span>
            </button>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={resetOpen}
        title="Reset Demonstration Data"
        onClose={() => setResetOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#5F665F] leading-relaxed">
            This will restore all sample students, rides, requests, notifications, and reports in <code className="font-mono">localStorage</code> and sign you out to the demo selector. Continue?
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="rounded-lg border border-[#244B3B]/20 px-4 py-2 text-sm font-medium text-[#5F665F] hover:bg-[#EFEAE1]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setResetOpen(false);
                onResetDemo();
              }}
              className="rounded-lg bg-[#244B3B] px-4 py-2 text-sm font-medium text-white hover:bg-[#1C3B2E]"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
