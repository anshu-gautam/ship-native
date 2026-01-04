import { mmkvStorage } from '@/lib/mmkv';
import type { User } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}

interface UserState {
  profile: User | null;
  preferences: UserPreferences;
}

interface UserActions {
  setProfile: (profile: User | null) => void;
  updateProfile: (updates: Partial<User>) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

type UserStore = UserState & UserActions;

const initialState: UserState = {
  profile: null,
  preferences: {
    language: 'en',
    theme: 'system',
    notificationsEnabled: true,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      setLanguage: (language) =>
        set((state) => ({
          preferences: { ...state.preferences, language },
        })),

      setTheme: (theme) =>
        set((state) => ({
          preferences: { ...state.preferences, theme },
        })),

      setNotificationsEnabled: (notificationsEnabled) =>
        set((state) => ({
          preferences: { ...state.preferences, notificationsEnabled },
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
