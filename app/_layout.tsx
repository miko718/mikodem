import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { BookingProvider } from '@/contexts/BookingContext';

export default function RootLayout() {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <BookingProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="business/[id]" />
            <Stack.Screen name="booking/datetime" />
            <Stack.Screen name="booking/summary" />
            <Stack.Screen name="success" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="light" />
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
