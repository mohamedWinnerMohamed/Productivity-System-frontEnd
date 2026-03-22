import { create } from "zustand";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  // Call this when the app loads to check if they have a valid HttpOnly cookie
  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false });
        return data.user;
      } else {
        set({ user: null, loading: false });
        return null;
      }
    } catch (error) {
      console.error("Check Auth Error:", error);
      set({ user: null, loading: false });
      return null;
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null });
      toast.success("Logged out successfully!", { duration: 3000 });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  },
}));
