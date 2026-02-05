import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isLoggedIn, hasSeenOnboarding } = useAuth();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }
  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return <Redirect href="/(tabs)" />;
}
