import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Linking, Alert } from 'react-native';
import API_BASE_URL from '../config/API';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeepLink = useCallback((event) => {
    const { url } = event;
    if (url.includes('/api/auth/google/callback')) {
      checkAuth();
    }
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription?.remove();
  }, [checkAuth, handleDeepLink]);


  const login = async () => {
    // Get base URL without /api
    const baseUrl = API_BASE_URL.replace('/api', '');
    const authUrl = `${baseUrl}/api/auth/google`;
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'mikodem://'
      );
      if (result.type === 'success') {
        // Wait a bit for the session to complete
        setTimeout(() => {
          checkAuth();
        }, 1000);
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('שגיאה', 'לא הצלחנו להתחבר. נסה שוב.');
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
