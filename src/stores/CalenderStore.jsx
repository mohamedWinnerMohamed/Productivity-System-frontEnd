import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCalenderStore = create(
  persist(
    (set, get) => ({
      user: null,
      plans: [],
      isLoading: false,

      setUser: (user) => {
        set({ user });
        if (user) {
          get().changeStorageKey(`calendar-storage-${user.id || user.uid}`);
        } else {
          set({ plans: [] });
          get().changeStorageKey("calendar-storage-guest");
        }
      },

      changeStorageKey: (newKey) => {
        const state = get();
        const data = JSON.stringify({ 
          state: { 
            plans: state.plans 
          } 
        });
        localStorage.setItem(newKey, data);
      },

      addPlan: (plan) => {
        const { selectedDate } = get(); 
        const newPlan = {
          id: crypto.randomUUID(),
          title: plan.title,
          time: plan.time,
          priority: plan.priority,
          type: plan.type,
          completed: false,
          dateISO: selectedDate, 
        };

        set((state) => ({
          plans: [...state.plans, newPlan],
        }));
      },

      togglePlan: (id) => {
        const currentPlans = get().plans;
        if (!Array.isArray(currentPlans)) return;

        set({
          plans: currentPlans.map(plan =>
            plan.id === id
              ? { ...plan, completed: !plan.completed }
              : plan
          ),
        });
      },

      removePlan: (id) => {
        const currentPlans = get().plans;
        if (!Array.isArray(currentPlans)) {
          set({ plans: [] });
          return;
        }

        set({
          plans: currentPlans.filter(plan => plan.id !== id),
        });
      },

      getPlannedToday: (dateISO) => {
        const plans = get().plans[dateISO] || [];
        return plans;
      },

      getPlansByDate: (dateISO) => {
        return get().plans.filter(
          (plan) => plan.dateISO === dateISO
        );
      },

      getDatesWithPlans: () => {
        return [...new Set(get().plans.map(p => p.dateISO))];
      },

      setSelectedDate: (dateISO) => {
        set({ selectedDate: dateISO });
      },
    }),
    {
      name: "calendar-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        plans: state.plans,
      }),
    }
  )
);