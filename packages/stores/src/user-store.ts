import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: Partial<User> | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set((state) => ({
    user: state.user ? { ...state.user, ...user } : (user as User)
  })),
  clearUser: () => set({ user: null }),
}));
