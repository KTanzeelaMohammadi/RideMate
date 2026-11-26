/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { dataService } from './services/dataService';
import { AppPage, User } from './types/ridemate';
import { AuthPage } from './pages/AuthPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { FindRidePage } from './pages/FindRidePage';
import { OfferRidePage } from './pages/OfferRidePage';
import { MyRidesPage } from './pages/MyRidesPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AssistantPage } from './pages/AssistantPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

interface ToastState {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

export default function App() {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(() =>
    dataService.getSessionUser()
  );
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const refreshCounts = useCallback(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    setUnreadCount(dataService.getUnreadNotificationCount(user.id));
  }, [user]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const showToast = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleAuthenticated = (loggedInUser: Omit<User, 'password'>) => {
    setUser(loggedInUser);
    setCurrentPage(loggedInUser.role === 'admin' ? 'admin' : 'dashboard');
    setUnreadCount(dataService.getUnreadNotificationCount(loggedInUser.id));
  };

  const handleLogout = () => {
    dataService.logout();
    setUser(null);
    setCurrentPage('dashboard');
    setUnreadCount(0);
  };

  const handleNavigate = (page: AppPage) => {
    if (page === 'admin' && user?.role !== 'admin') {
      showToast('Administrator privileges are required to open the Admin Console.', 'error');
      return;
    }
    setCurrentPage(page);
    refreshCounts();
  };

  const handleResetDemo = () => {
    dataService.resetDemoDatabase();
    setUser(null);
    setCurrentPage('dashboard');
    setUnreadCount(0);
    showToast('Demonstration database restored to initial sample state.', 'success');
  };

  if (!user) {
    return (
      <>
        <AuthPage onAuthenticated={handleAuthenticated} />
        {toast ? (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-[#244B3B]/15 bg-[#FCFBF8] px-4 py-3 shadow-lg flex items-center gap-2.5 text-sm text-[#292D29]">
            <CheckCircle2 className="h-4 w-4 text-[#244B3B] shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss message"
              className="text-[#5F665F] hover:text-[#292D29]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <Layout
      user={user}
      currentPage={currentPage}
      unreadCount={unreadCount}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' ? (
        <DashboardPage user={user} onNavigate={handleNavigate} />
      ) : null}
      {currentPage === 'find-ride' ? (
        <FindRidePage
          user={user}
          onNavigate={handleNavigate}
          onNotify={showToast}
          onRefreshCounts={refreshCounts}
        />
      ) : null}
      {currentPage === 'offer-ride' ? (
        <OfferRidePage user={user} onNavigate={handleNavigate} onNotify={showToast} />
      ) : null}
      {currentPage === 'my-rides' ? (
        <MyRidesPage
          user={user}
          onNavigate={handleNavigate}
          onNotify={showToast}
          onRefreshCounts={refreshCounts}
        />
      ) : null}
      {currentPage === 'my-requests' ? (
        <MyRequestsPage
          user={user}
          onNavigate={handleNavigate}
          onNotify={showToast}
          onRefreshCounts={refreshCounts}
        />
      ) : null}
      {currentPage === 'notifications' ? (
        <NotificationsPage
          user={user}
          onNavigate={handleNavigate}
          onRefreshCounts={refreshCounts}
        />
      ) : null}
      {currentPage === 'assistant' ? <AssistantPage user={user} /> : null}
      {currentPage === 'profile' ? (
        <ProfilePage
          user={user}
          onUserUpdated={setUser}
          onNotify={showToast}
          onResetDemo={handleResetDemo}
        />
      ) : null}
      {currentPage === 'admin' ? (
        <AdminDashboardPage user={user} onNotify={showToast} />
      ) : null}

      {toast ? (
        <div
          role="status"
          className={`fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg flex items-center gap-2.5 text-sm ${
            toast.tone === 'error'
              ? 'border-[#9B2C2C]/25 bg-[#F9E6E6] text-[#9B2C2C]'
              : 'border-[#244B3B]/20 bg-[#FCFBF8] text-[#292D29]'
          }`}
        >
          {toast.tone === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-[#244B3B] shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </Layout>
  );
}
