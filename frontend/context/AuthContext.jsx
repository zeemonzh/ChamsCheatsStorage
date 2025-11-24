import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {}
});

const TOKEN_KEY = 'ccs_token';
const USER_KEY = 'ccs_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse saved user profile', error);
        window.localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return () => {
      delete apiClient.defaults.headers.common.Authorization;
    };
  }, [token]);

  const persistSession = (sessionToken, profile) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, sessionToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(profile));
  };

  const clearSession = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  };

  const enhanceProfile = (data) => ({ ...data.user, isInviteAdmin: data.isInviteAdmin });

  const login = async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    const profile = enhanceProfile(data);
    setToken(data.token);
    setUser(profile);
    persistSession(data.token, profile);
    return data;
  };

  const register = async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    const profile = enhanceProfile(data);
    setToken(data.token);
    setUser(profile);
    persistSession(data.token, profile);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearSession();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

