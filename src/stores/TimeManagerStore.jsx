import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useTimeManagerStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      timers: [],

      setUser: (user) => {
        set({ user });
        if (user) {
          get().changeStorageKey(`time-manager-storage-${user.id || user.uid}`);
        } else {
          set({ timers: [] });
          get().changeStorageKey("time-manager-storage-guest");
        }
      },

      changeStorageKey: (newKey) => {
        const state = get();
        const data = JSON.stringify({
          state: {
            timers: state.timers,
          }
        });
        localStorage.setItem(newKey, data);
      },

      addTimer: (timer) => {
        const currentTimers = get().timers;
        if (currentTimers.length > 0) {
          return false;
        }

        set((state) => ({
          timers: [
            ...state.timers,
            {
              id: Date.now(),
              isRunning: false,
              remaining: timer.duration || 0,
              duration: timer.duration || 0,
              status: 'running',
              ...timer,
            },
          ],
        }));

        return true;
      },

      removeTimer: (id) => {
        set((state) => ({
          timers: state.timers.filter((t) => t.id !== id),
        }));
      },

      stopTimer: (id, status) => {
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, isRunning: status === 'running', status } : t
          ),
        }));
      },

      resetTimer: (id) => {
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === id ? { ...t, remaining: t.duration, isRunning: false, status: 'stopped' } : t
          ),
        }));
      },

      tickTimers: () => {
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.isRunning && t.remaining > 0) {
              return { ...t, remaining: t.remaining - 1 };
            }
            return t;
          }),
        }));
      },
    }),
    {
      name: "time-manager-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timers: state.timers,
      }),
    }
  )
);