import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useNotesStore = create(
    persist(
        (set, get) => ({
            notes: [],
            filesOpened: [],
            user: null,

            setUser: async (user) => {
                set({ user });
                if (user) {
                    await get().fetchNotes();
                    get().changeStorageKey(`notes-storage-${user.id || user.uid}`);
                } else {
                    set({ notes: [], filesOpened: [] });
                    get().changeStorageKey("notes-storage-guest");
                }
            },

            changeStorageKey: (newKey) => {
                const data = JSON.stringify({ state: get() });
                localStorage.setItem(newKey, data);
            },

            fetchNotes: async () => {
                try {
                    const res = await fetch('/api/strapi/notes');
                    if (res.ok) {
                        const json = await res.json();
                        const notesData = json.data || [];
                        const mappedNotes = notesData.map(n => ({
                            id: n.documentId || n.id,
                            actualId: n.id,
                            text: n.text || n.content || "",
                            completed: n.completed || false,
                            dateISO: n.dateISO,
                        }));
                        set({ notes: mappedNotes });
                    }
                } catch (error) {
                    console.error("Failed to fetch notes:", error);
                }
            },

            addNote: async (note, dateISO) => {
                const tempId = Date.now().toString();
                const newNote = { id: tempId, text: note, completed: false, dateISO };
                
                // Optimistic UI
                set((state) => ({
                    notes: [...state.notes, newNote],
                }));

                const { user } = get();
                if (user) {
                    try {
                        const res = await fetch('/api/strapi/notes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: { text: note, completed: false, dateISO } })
                        });
                        const json = await res.json();
                        if (res.ok) {
                            const created = json.data;
                            set((state) => ({
                                notes: state.notes.map(n => n.id === tempId ? {
                                    id: created.documentId || created.id,
                                    actualId: created.id,
                                    text: created.text || created.content,
                                    completed: created.completed,
                                    dateISO: created.dateISO
                                } : n)
                            }));
                        } else {
                            throw new Error("Failed to save note");
                        }
                    } catch (error) {
                        console.error("Failed to sync note to Strapi:", error);
                        set((state) => ({ notes: state.notes.filter(n => n.id !== tempId) }));
                    }
                }
            },

            removeNote: async (id) => {
                const oldNotes = get().notes;
                const noteToRemove = oldNotes.find(n => n.id === id);
                
                set((state) => ({
                    notes: state.notes.filter((note) => note.id !== id),
                }));

                const { user } = get();
                if (user && noteToRemove && !noteToRemove.id.toString().startsWith('temp_')) {
                    try {
                        const res = await fetch(`/api/strapi/notes/${noteToRemove.id}`, {
                            method: 'DELETE'
                        });
                        if (!res.ok) throw new Error("Delete failed");
                    } catch (error) {
                        console.error("Failed to delete note from Strapi:", error);
                        set({ notes: oldNotes });
                    }
                }
            },

            updateNote: async (id, newText) => {
                const oldNotes = get().notes;
                const noteToUpdate = oldNotes.find(n => n.id === id);
                if (!noteToUpdate) return;

                set((state) => ({
                    notes: state.notes.map((note) =>
                        note.id === id ? { ...note, text: newText } : note
                    ),
                }));

                const { user } = get();
                if (user && !noteToUpdate.id.toString().startsWith('temp_')) {
                    try {
                        const res = await fetch(`/api/strapi/notes/${noteToUpdate.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: { text: newText } })
                        });
                        if (!res.ok) throw new Error("Update failed");
                    } catch (error) {
                        console.error("Failed to update note in Strapi:", error);
                        set({ notes: oldNotes });
                    }
                }
            },

            setFilesOpened: (files) => {
                set({ filesOpened: files });
                // We keep filesOpened purely in local persistent state, not in Strapi
            },
        }),
        {
            name: "notes-storage-guest",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                notes: state.notes,
                filesOpened: state.filesOpened,
            }),
        }
    )
);
