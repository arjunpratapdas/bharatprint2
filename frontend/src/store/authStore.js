import { create } from 'zustand';
import { getUser, setUser as saveUser, removeUser, getToken, setToken as saveToken, removeToken } from '../lib/auth';

const useAuthStore = create((set) => ({
  user: getUser(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  
  setAuth: (token, user) => {
    saveToken(token);
    saveUser(user);
    set({ token, user, isAuthenticated: true });
  },
  
  updateUser: (userData) => {
    const currentUser = getUser();
    const updatedUser = { ...currentUser, ...userData };
    saveUser(updatedUser);
    set({ user: updatedUser });
  },
  
  logout: () => {
    removeToken();
    removeUser();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;