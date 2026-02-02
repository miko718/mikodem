import { useConvexAuth } from 'convex/react';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tw } from '@/lib/rtl';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // אנימציה קצרה של הלוגו
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && showContent) {
      // בדיקה אם המשתמש כבר מחובר
      if (isAuthenticated) {
        // מעבר ישר למסך הראשי
        setTimeout(() => {
          router.replace('/(authenticated)');
        }, 1000);
      } else {
        // מעבר למסך Onboarding
        setTimeout(() => {
          router.replace('/onboarding');
        }, 1000);
      }
    }
  }, [isLoading, isAuthenticated, showContent, router]);

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: '#0ea5e9' }}
    >
      <View className="items-center">
        {/* Logo */}
        <View className="mb-8">
          <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center">
            <Text className="text-6xl font-bold text-white">M</Text>
          </View>
        </View>

        {/* App Name */}
        {showContent && (
          <View className="items-center">
            <Text
              className={`text-4xl font-bold text-white mb-4 ${tw.textStart}`}
            >
              Mikodem
            </Text>
            <Text
              className={`text-white/90 text-lg mb-12 ${tw.textStart} text-center`}
            >
              Simplify Your Schedule
            </Text>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
