import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useTasksStore = create(
  persist(
    (set, get) => ({
      user: null,
      tasks: [],
      isLoading: false,

      setUser: async (user) => {
        set({ user, isLoading: true });
        
        if (user) {
          await get().fetchTasks();
          get().changeStorageKey(`tasks-storage-${user.id || user.uid}`);
        } else {
          set({ tasks: [] });
          get().changeStorageKey("tasks-storage-guest");
        }
        
        set({ isLoading: false });
      },

      changeStorageKey: (newKey) => {
        const state = get();
        const data = JSON.stringify({ 
          state: { 
            tasks: state.tasks 
          } 
        });
        localStorage.setItem(newKey, data);
      },

      fetchTasks: async () => {
        try {
          // Add filters if needed, but assuming a user only sees their own or we just fetch everything Strapi returns for this token.
          // Fetch all including drafts if Draft & Publish is disabled or not handled
          const res = await fetch('/api/strapi/tasks?publicationState=preview');
          if (res.ok) {
            const json = await res.json();
            // Strapi wraps array in `data`. Handle v4 vs v5.
            const tasks = json.data || [];
            // Map Strapi structure to our local structure if needed (documentId vs id).
            const mappedTasks = tasks.map(t => ({
              id: t.documentId || t.id,
              actualId: t.id,
              title: t.title,
              dateISO: t.data?.split('T')[0] || t.date?.split('T')[0] || t.dateISO?.split('T')[0],
              done: t.isCompleted ?? t.done,
            }));
            set({ tasks: mappedTasks });
          }
        } catch (error) {
          console.error("Failed to fetch tasks from API:", error);
        }
      },

      addTask: async (task) => {
        const egyptDate = new Date().toLocaleString("en-US", { timeZone: "Africa/Cairo" });
        const today = new Date(egyptDate).toLocaleDateString("en-CA");

        if (task.dateISO < today) {
          console.warn("Cannot add tasks to past days");
          return;
        }

        // Optimistic UI update
        const tempId = Date.now().toString();
        const newTask = {
          id: tempId,
          title: task.title,
          dateISO: task.dateISO,
          done: false,
        };

        set((state) => ({ tasks: [...state.tasks, newTask] }));

        const { user } = get();
        if (user) {
          try {
            const res = await fetch('/api/strapi/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: { title: task.title, data: task.dateISO, isCompleted: false, publishedAt: new Date().toISOString() } })
            });
            const json = await res.json();
            
            if (res.ok) {
              const createdTask = json.data;
              // replace optimistic task with real task
              set((state) => ({
                tasks: state.tasks.map(t => t.id === tempId ? {
                  id: createdTask.documentId || createdTask.id,
                  actualId: createdTask.id,
                  title: createdTask.title,
                  dateISO: createdTask.data?.split('T')[0] || createdTask.date?.split('T')[0] || createdTask.dateISO?.split('T')[0] || task.dateISO,
                  done: createdTask.isCompleted ?? createdTask.done
                } : t)
              }));
            } else {
              const errorMsg = json.error?.message || "Failed to save to server";
              console.error("Strapi Validation Error:", json.error);
              throw new Error(errorMsg);
            }
          } catch (error) {
            console.error("Failed to sync task to Strapi:", error.message);
            import("react-hot-toast").then((toast) => toast.default.error("Strapi Error: " + error.message));
            // Revert on failure
            set((state) => ({
              tasks: state.tasks.filter((t) => t.id !== tempId),
            }));
          }
        }
      },

      toggleTask: async (id) => {
        const oldTasks = get().tasks;
        const taskToToggle = oldTasks.find(t => t.id === id);
        if (!taskToToggle) return;
        
        // Optimistic UI update
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, done: !task.done } : task
          ),
        }));

        const { user } = get();
        if (user && taskToToggle.id && !taskToToggle.id.toString().startsWith('temp_')) {
          try {
            // DocumentId is used in Strapi v5 for PUT/DELETE
            const documentId = taskToToggle.id;
            const res = await fetch(`/api/strapi/tasks/${documentId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: { isCompleted: !taskToToggle.done } })
            });
            
            if (!res.ok) throw new Error("Failed to toggle on server");
          } catch (error) {
            console.error("Failed to sync toggle to Strapi:", error);
            // Revert
            set({ tasks: oldTasks });
          }
        }
      },

      removeTask: async (id) => {
        const oldTasks = get().tasks;
        const taskToRemove = oldTasks.find(t => t.id === id);
        
        // Optimistic UI update
        set({
          tasks: get().tasks.filter((task) => task.id !== id),
        });

        const { user } = get();
        if (user && taskToRemove && taskToRemove.id) {
          try {
            const documentId = taskToRemove.id;
            const res = await fetch(`/api/strapi/tasks/${documentId}`, {
              method: 'DELETE'
            });
            
            if (!res.ok) throw new Error("Failed to delete on server");
          } catch (error) {
            console.error("Failed to sync removal to Strapi:", error);
            set({ tasks: oldTasks });
          }
        }
      },
    }),
    {
      name: "tasks-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);