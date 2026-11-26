import React, { useState } from 'react';
import {
  Car,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { User } from '../types/ridemate';

interface AuthPageProps {
  onAuthenticated: (user: Omit<User, 'password'>) => void;
}

const DEMO_ACCOUNTS = [
  {
    id: 'usr-aarav',
    name: 'Aarav Mehta',
    roleLabel: 'Student · Driver & Rider',
    email: 'aarav.mehta@campus.edu',
    enrollment: 'MU2024CS042',
    passwordHint: 'Student@123',
  },
  {
    id: 'usr-maya',
    name: 'Maya Patel',
    roleLabel: 'Student · Frequent Rider',
    email: 'maya.patel@campus.edu',
    enrollment: 'MU2024EC019',
    passwordHint: 'Student@123',
  },
  {
    id: 'usr-admin',
    name: 'Dr. Kavita Nair',
    roleLabel: 'Campus Transport Admin',
    email: 'admin@campus.edu',
    enrollment: 'ADMIN-TRANSPORT-01',
    passwordHint: 'Admin@123',
  },
];

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [imgFailed, setImgFailed] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    window.setTimeout(() => {
      const result = dataService.login(loginEmail, loginPassword);
      setIsSubmitting(false);
      if (!result.ok || !result.data) {
        setError(result.error ?? 'Unable to sign in.');
        return;
      }
      onAuthenticated(result.data);
    }, 180);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const result = dataService.register({
        name: regName,
        enrollmentNumber: regEnrollment,
        email: regEmail,
        phone: regPhone,
        department: regDepartment,
        password: regPassword,
      });
      setIsSubmitting(false);
      if (!result.ok || !result.data) {
        setError(result.error ?? 'Unable to complete registration.');
        return;
      }
      onAuthenticated(result.data);
    }, 200);
  };

  const handleDemoLogin = (userId: string) => {
    setError(null);
    const result = dataService.demoLogin(userId);
    if (!result.ok || !result.data) {
      setError(result.error ?? 'Unable to load demo account.');
      return;
    }
    onAuthenticated(result.data);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#292D29] flex flex-col">
      <header className="border-b border-[#244B3B]/10 bg-[#FCFBF8]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#244B3B] text-[#F7F5EF]">
              <Car className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-[#244B3B]">
              RideMate
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5F665F]">
            <span>Campus Carpool Partner Matching</span>
            <span aria-hidden="true">·</span>
            <span>Verified Enrollment Commutes</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Editorial Column */}
        <section className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#244B3B]">
              Student Commute Network
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#292D29] leading-[1.15] text-balance">
              Shared campus rides built on verified trust.
            </h1>
            <p className="text-[15px] text-[#5F665F] leading-relaxed">
              Match with fellow students heading along your daily university corridor, split fuel expenses fairly, and keep personal contact numbers private until a seat is accepted.
            </p>

            <div className="relative overflow-hidden rounded-xl border border-[#244B3B]/10 bg-[#DCE7DC]/40 aspect-[4/3]">
              {!imgFailed ? (
                <img
                  src="/src/assets/images/campus_carpool_editorial_1795693224718.jpg"
                  alt="University campus driveway with a parked car beside brick academic buildings"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#DCE7DC] to-[#EFEAE1]">
                  <Car className="h-10 w-10 text-[#244B3B] mb-2" />
                  <p className="text-sm font-medium text-[#244B3B]">Campus Mobility Corridor</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1C3B2E]/85 via-[#1C3B2E]/40 to-transparent px-4 py-3.5 text-[#F7F5EF]">
                <p className="text-xs font-medium">
                  North Gate · Engineering Block · City Transit Hubs
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#244B3B]/10 bg-[#FCFBF8] p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#244B3B] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-[#5F665F] leading-relaxed">
                <span className="font-semibold text-[#292D29]">Demonstration MVP Notice:</span>{' '}
                Data persists locally in your browser via <code className="font-mono">localStorage</code> for demonstration. LocalStorage auth does not provide production-level security; the service layer is structured for a Supabase backend.
              </div>
            </div>
          </div>
        </section>

        {/* Right Auth + Demo Panel */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-6 sm:p-8 shadow-[0_2px_10px_rgba(36,75,59,0.05)]">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="inline-flex rounded-lg bg-[#EFEAE1] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    mode === 'login'
                      ? 'bg-[#FCFBF8] text-[#244B3B] shadow-xs'
                      : 'text-[#5F665F] hover:text-[#292D29]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    mode === 'register'
                      ? 'bg-[#FCFBF8] text-[#244B3B] shadow-xs'
                      : 'text-[#5F665F] hover:text-[#292D29]'
                  }`}
                >
                  Student Registration
                </button>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#9B2C2C]/20 bg-[#F9E6E6] px-4 py-3 text-sm text-[#9B2C2C]"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : null}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#292D29] mb-1.5">
                    Campus Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@campus.edu"
                    className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] placeholder:text-[#5F665F]/60 focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-[#292D29] mb-1.5">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] placeholder:text-[#5F665F]/60 focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#244B3B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C3B2E] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#244B3B]"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In to RideMate'}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-name" className="block text-sm font-medium text-[#292D29] mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g., Priya Sharma"
                      className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-enrollment" className="block text-sm font-medium text-[#292D29] mb-1.5">
                      Enrollment Number
                    </label>
                    <input
                      id="reg-enrollment"
                      type="text"
                      required
                      value={regEnrollment}
                      onChange={(e) => setRegEnrollment(e.target.value)}
                      placeholder="e.g., MU2025CS104"
                      className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm font-mono uppercase text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-[#292D29] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="priya@campus.edu"
                      className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-medium text-[#292D29] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-dept" className="block text-sm font-medium text-[#292D29] mb-1.5">
                    Department & Year (Optional)
                  </label>
                  <input
                    id="reg-dept"
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    placeholder="e.g., Computer Engineering · Year 2"
                    className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-[#292D29] mb-1.5">
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-confirm" className="block text-sm font-medium text-[#292D29] mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      id="reg-confirm"
                      type="password"
                      required
                      minLength={6}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-lg border border-[#244B3B]/20 bg-white px-3.5 py-2.5 text-sm text-[#292D29] focus:border-[#244B3B] focus:outline-none focus:ring-2 focus:ring-[#244B3B]/15"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#5F665F] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#244B3B]" aria-hidden="true" />
                  <span>Your phone number stays hidden until a ride request is accepted.</span>
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#244B3B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1C3B2E] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#244B3B]"
                >
                  <span>{isSubmitting ? 'Creating account...' : 'Create Student Account'}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>

          {/* Demo Accounts Quick Access */}
          <div className="rounded-xl bg-[#FCFBF8] border border-[#244B3B]/10 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-[#292D29]">
                  Quick Demo Accounts
                </h2>
                <p className="text-xs text-[#5F665F] mt-0.5">
                  Sign in with one click to test student driver, rider, or admin workflows.
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-[#B8A58A] shrink-0" aria-hidden="true" />
            </div>

            <div className="divide-y divide-[#244B3B]/10">
              {DEMO_ACCOUNTS.map((acct) => (
                <div
                  key={acct.id}
                  className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#292D29]">
                      <span>{acct.name}</span>
                      <span aria-hidden="true" className="text-[#B8A58A]">·</span>
                      <span className="text-xs font-normal text-[#5F665F]">{acct.roleLabel}</span>
                    </div>
                    <p className="text-xs text-[#5F665F] font-mono mt-0.5 truncate">
                      {acct.email} · {acct.enrollment} · pw: {acct.passwordHint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin(acct.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#244B3B]/20 bg-[#DCE7DC]/45 px-3.5 py-2 text-xs font-medium text-[#244B3B] hover:bg-[#DCE7DC] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#244B3B]"
                  >
                    <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Demo Login</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
