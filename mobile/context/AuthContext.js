import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Alert } from 'react-native';
import API_BASE_URL from '../config/API';
import { getToken, setToken } from '../utils/authStorage.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken();
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/auth/me`, { headers });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        await setToken(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      await setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeepLink = useCallback((event) => {
    const { url } = event;
    if (url.startsWith('mikodem://auth/callback')) {
      const match = url.match(/token=([^&]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;
      if (token) {
        setToken(token).then(() => checkAuth());
      }
    }
    if (url.startsWith('mikodem://login')) {
      checkAuth();
    }
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription?.remove();
  }, [checkAuth, handleDeepLink]);

  // Handle initial URL (app opened via deep link)
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url?.startsWith('mikodem://auth/callback')) {
        const match = url.match(/token=([^&]+)/);
        const token = match ? decodeURIComponent(match[1]) : null;
        if (token) {
          setToken(token).then(() => checkAuth());
        }
      }
    });
  }, [checkAuth]);

  const login = async () => {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const authUrl = `${baseUrl}/api/auth/google?client=expo`;
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'mikodem://auth/callback'
      );
      if (result.type === 'success' && result.url?.includes('token=')) {
        const match = result.url.match(/token=([^&]+)/);
        const token = match ? decodeURIComponent(match[1]) : null;
        if (token) {
          await setToken(token);
          await checkAuth();
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('שגיאה', 'לא הצלחנו להתחבר. נסה שוב.');
    }
  };

  const logout = async () => {
    try {
      const token = await getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
    await setToken(null);
    setUser(null);
  };

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = await getToken();
    const headers = { ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
