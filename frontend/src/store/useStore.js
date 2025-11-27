import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newMode };
      }),
      setDarkMode: (value) => set(() => {
        if (value) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: value };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), ...notification, timestamp: new Date() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

export const useFilterStore = create((set) => ({
  filters: {},
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilter: (key) =>
    set((state) => {
      const newFilters = { ...state.filters };
      delete newFilters[key];
      return { filters: newFilters };
    }),
  clearAllFilters: () => set({ filters: {} }),
}));

export const useSocketStore = create((set) => ({
  socket: null,
  connected: false,
  setSocket: (socket) => set({ socket, connected: true }),
  disconnect: () => set({ socket: null, connected: false }),
}));
