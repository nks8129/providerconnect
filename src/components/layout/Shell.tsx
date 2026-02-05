'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { LeftNav } from './LeftNav';
import { TopBar } from './TopBar';
import { AIBubble } from './AIBubble';
import { ModalContainer } from '@/components/modals/ModalContainer';
import { ToastContainer } from '@/components/ui/toast-container';
import { useAppStore } from '@/stores/app-store';

interface ShellProps {
  children: React.ReactNode;
}

// Custom hook to wait for zustand persist to rehydrate
function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure zustand has rehydrated
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return hasHydrated;
}

export function Shell({ children }: ShellProps) {
  const hasHydrated = useHasHydrated();
  const isInitialized = useAppStore((state) => state.isInitialized);
  const initialize = useAppStore((state) => state.initialize);
  const users = useAppStore((state) => state.users);
  const [initAttempted, setInitAttempted] = useState(false);

  // Initialize app after hydration if not already initialized
  useEffect(() => {
    if (hasHydrated && !initAttempted) {
      setInitAttempted(true);

      // Check both isInitialized flag and actual data
      if (!isInitialized || users.length === 0) {
        console.log('Shell: Initializing app...', { isInitialized, usersCount: users.length });
        initialize();
      } else {
        console.log('Shell: Already initialized with', users.length, 'users');
      }
    }
  }, [hasHydrated, isInitialized, users.length, initialize, initAttempted]);

  // Show loading state while hydrating
  if (!hasHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">PR</span>
          </div>
          <p className="text-sm text-slate-500">Loading Provider Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100">
      {/* Left Navigation */}
      <LeftNav />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Floating Bubble */}
      <AIBubble />

      {/* Modals */}
      <ModalContainer />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
