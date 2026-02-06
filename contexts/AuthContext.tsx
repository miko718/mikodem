import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserStats = {
  level: number;
  xp: number;
  streakDays: number;
  completedAppointments: number;
};

export type User = {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  rank?: string;
  stats?: UserStats;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const login = useCallback(() => {
    setUser({
      id: 'usr_992834',
      displayName: 'NeoCoder',
      email: 'user@example.com',
      rank: 'Cyber Elite',
      stats: {
        level: 12,
        xp: 4500,
        streakDays: 5,
        completedAppointments: 47,
      },
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hasSeenOnboarding,
        login,
        logout,
        completeOnboarding,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
