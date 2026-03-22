"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/AuthStore";
import { useTasksStore } from "../../stores/useTasksStore";
import { useNotesStore } from "../../stores/useNotesStore";
import { useAnalyticsStore } from "../../stores/AnaliticsStore";
import { useTimeManagerStore } from "../../stores/TimeManagerStore";
import { useCalenderStore } from "../../stores/CalenderStore";

export default function AuthProvider({ children }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (mounted) {
      useTasksStore.getState().setUser(user);
      useNotesStore.getState().setUser(user);
      useAnalyticsStore.getState().setUser(user);
      useTimeManagerStore.getState().setUser(user);
      useCalenderStore.getState().setUser(user);
    }
  }, [user, mounted]);

  // Don't render until we know the initial auth state on the client
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-10 h-10 border-4 border-[#1d4ed8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
