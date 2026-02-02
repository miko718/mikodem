import { useConvexAuth } from 'convex/react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // אם טוען - מעבר ל-Splash
  if (isLoading) {
    return <Redirect href="/splash" />;
  }

  // אם מחובר - מעבר למסך הראשי
  if (isAuthenticated) {
    return <Redirect href="/(authenticated)" />;
  }

  // אם לא מחובר - מעבר ל-Onboarding
  return <Redirect href="/onboarding" />;
}
