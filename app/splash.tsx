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
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <View className="items-center">
        {/* Logo */}
        <View className="mb-6">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-sky-400 items-center justify-center bg-transparent">
              <Text className="text-6xl font-bold text-sky-400">M</Text>
            </View>
            <View className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sky-400" />
          </View>
        </View>

        {/* App Name */}
        {showContent && (
          <View className="items-center">
            <Text
              className={`text-4xl font-bold text-white mb-2 ${tw.textStart}`}
            >
              Mikodem
            </Text>
            <Text
              className={`text-zinc-400 text-base mb-8 ${tw.textStart} text-center`}
            >
              ניהול תורים מבוסס מיקום
            </Text>
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
