import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  Car,
  ClipboardList,
  Bell,
  User as UserIcon,
  MessageSquareText,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AppPage, User } from '../types/ridemate';
import { getInitials } from '../utils/formatters';

interface LayoutProps {
  user: Omit<User, 'password'>;
  currentPage: AppPage;
  unreadCount: number;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'find-ride', label: 'Find a Ride', icon: Search },
  { id: 'offer-ride', label: 'Offer a Ride', icon: PlusCircle },
  { id: 'my-rides', label: 'My Rides', icon: Car },
  { id: 'my-requests', label: 'My Requests', icon: ClipboardList },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'assistant', label: 'RideMate Assistant', icon: MessageSquareText },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'admin', label: 'Admin Console', icon: Shield, adminOnly: true },
];

export function Layout({
  user,
  currentPage,
  unreadCount,
  onNavigate,
  onLogout,
  children,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user.role === 'admin');
  const activeItem = visibleItems.find((i) => i.id === currentPage) ?? visibleItems[0];

  const handleSelectPage = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#292D29] flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#FCFBF8] border-r border-[#244B3B]/10">
        <div className="px-6 py-5 border-b border-[#244B3B]/10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#244B3B] text-[#F7F5EF] shrink-0">
            <Car className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-[#244B3B] whitespace-nowrap">
            RideMate
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPage(item.id)}
                className={`w-full flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#244B3B] ${
                  isActive
                    ? 'bg-[#244B3B] text-[#F7F5EF]'
                    : 'text-[#5F665F] hover:bg-[#DCE7DC]/50 hover:text-[#244B3B]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'notifications' && unreadCount > 0 ? (
                  <span
                    className={`font-mono text-xs tabular-nums px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#DCE7DC] text-[#244B3B]'
                    }`}
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#244B3B]/10 p-4 space-y-3">
          <button
            type="button"
            onClick={() => handleSelectPage('profile')}
            className="w-full flex items-center gap-3 rounded-lg p-2 text-left hover:bg-[#DCE7DC]/40 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCE7DC] text-xs font-semibold text-[#244B3B] shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#292D29] truncate">{user.name}</p>
              <p className="text-xs font-mono text-[#5F665F] truncate">{user.enrollmentNumber}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#244B3B]/15 px-3 py-2 text-xs font-medium text-[#5F665F] hover:bg-[#EFEAE1] hover:text-[#292D29] transition-colors whitespace-nowrap"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar (Single Row) */}
        <header className="sticky top-0 z-30 bg-[#FCFBF8]/95 backdrop-blur-xs border-b border-[#244B3B]/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[#244B3B]/15 text-[#244B3B] hover:bg-[#DCE7DC]/40"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-sm min-w-0">
                <span className="font-display font-semibold text-[#244B3B] lg:hidden whitespace-nowrap">
                  RideMate
                </span>
                <span className="text-[#B8A58A] lg:hidden" aria-hidden="true">
                  /
                </span>
                <span className="text-[#5F665F] hidden lg:inline whitespace-nowrap">Campus</span>
                <span className="text-[#B8A58A] hidden lg:inline" aria-hidden="true">
                  /
                </span>
                <span className="font-medium text-[#292D29] truncate">{activeItem.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectPage('notifications')}
                aria-label={`Notifications (${unreadCount} unread)`}
                className="relative flex h-9 items-center gap-1.5 rounded-lg border border-[#244B3B]/15 bg-[#FCFBF8] px-3 text-xs font-medium text-[#292D29] hover:bg-[#DCE7DC]/40 transition-colors whitespace-nowrap"
              >
                <Bell className="h-3.5 w-3.5 text-[#244B3B]" aria-hidden="true" />
                <span className="hidden sm:inline">Alerts</span>
                {unreadCount > 0 ? (
                  <span className="font-mono tabular-nums text-[#244B3B] font-semibold">
                    ({unreadCount})
                  </span>
                ) : null}
              </button>

              {currentPage !== 'offer-ride' ? (
                <button
                  type="button"
                  onClick={() => handleSelectPage('offer-ride')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#244B3B] px-3.5 text-xs font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap shrink-0"
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Offer a Ride</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelectPage('find-ride')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#244B3B] px-3.5 text-xs font-medium text-white hover:bg-[#1C3B2E] transition-colors whitespace-nowrap shrink-0"
                >
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Find a Ride</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-[#292D29]/40"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-72 max-w-[85vw] bg-[#FCFBF8] h-full flex flex-col border-r border-[#244B3B]/15 shadow-xl">
              <div className="px-5 py-4 border-b border-[#244B3B]/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#244B3B] text-white">
                    <Car className="h-4 w-4" />
                  </div>
                  <span className="font-display text-base font-bold text-[#244B3B]">RideMate</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-[#5F665F] hover:bg-[#DCE7DC]/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPage(item.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#244B3B] text-white'
                          : 'text-[#5F665F] hover:bg-[#DCE7DC]/50 hover:text-[#244B3B]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {item.id === 'notifications' && unreadCount > 0 ? (
                        <span className="font-mono text-xs tabular-nums">{unreadCount}</span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-[#244B3B]/10 p-4 space-y-3">
                <div className="text-xs">
                  <p className="font-medium text-[#292D29]">{user.name}</p>
                  <p className="font-mono text-[#5F665F]">{user.enrollmentNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#244B3B]/20 py-2 text-xs font-medium text-[#292D29] hover:bg-[#EFEAE1]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Viewport Container */}
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-8 pb-20 lg:pb-10">
          {children}
        </main>

        {/* Mobile Bottom Quick Bar (Compact <= 54px) */}
        <nav
          aria-label="Quick mobile navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-[54px] bg-[#FCFBF8] border-t border-[#244B3B]/15 grid grid-cols-5"
        >
          {(
            [
              { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
              { id: 'find-ride', label: 'Find', icon: Search },
              { id: 'offer-ride', label: 'Offer', icon: PlusCircle },
              { id: 'my-rides', label: 'Rides', icon: Car },
              { id: 'my-requests', label: 'Requests', icon: ClipboardList },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectPage(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-[#244B3B]' : 'text-[#5F665F]'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
