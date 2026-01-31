import { useConvexAuth } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { HelpCircle } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tw } from '@/lib/rtl';

export default function WelcomeScreen() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  const handleLoginPress = (): void => {
    router.push('/(auth)/sign-in');
  };

  const handleSignUpPress = (): void => {
    router.push('/(auth)/sign-up');
  };

  const handleGuestPress = (): void => {
    // TODO: Implement guest mode
    router.replace('/(authenticated)');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#4fc3f7" />
      </SafeAreaView>
    );
  }

  // אם המשתמש כבר מחובר, מעביר אותו ישר למסך הבית
  if (isAuthenticated) {
    return <Redirect href="/(authenticated)" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Section - Indicators and Help */}
      <View className={`${tw.flexRow} items-center justify-between px-6 pt-4`}>
        {/* Progress Indicators */}
        <View className={`${tw.flexRow} items-center gap-2`}>
          <View className="w-8 h-1 bg-sky-400 rounded-full" />
          <View className="w-2 h-2 rounded-full bg-zinc-700" />
          <View className="w-2 h-2 rounded-full bg-zinc-700" />
        </View>

        {/* Help Icon */}
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="עזרה"
          hitSlop={10}
        >
          <HelpCircle size={24} color="#71717a" />
        </Pressable>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="mb-8 items-center">
          <View className="relative">
            <View className="w-24 h-24 rounded-full border-2 border-sky-400 items-center justify-center bg-transparent">
              <Text className="text-5xl font-bold text-zinc-400">M</Text>
            </View>
            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-400" />
          </View>
        </View>

        {/* Title */}
        <Text
          className={`text-4xl font-bold text-white mb-3 ${tw.textStart} text-center`}
        >
          ברוכים הבאים
        </Text>

        {/* Subtitle */}
        <Text
          className={`text-base text-zinc-400 mb-12 text-center ${tw.textStart}`}
        >
          פלטפורמה להטבות והנחות לעצמאים בישראל
        </Text>

        {/* Action Buttons */}
        <View className="w-full max-w-sm gap-4">
          {/* Login Button - Blue Gradient */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="התחברות"
            accessibilityHint="מעביר למסך ההתחברות"
            onPress={handleLoginPress}
            hitSlop={10}
            className="bg-sky-400 rounded-xl py-4 items-center min-h-[56px] shadow-lg"
            style={{
              shadowColor: '#0ea5e9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text className="text-white text-lg font-bold">התחברות</Text>
          </Pressable>

          {/* Sign Up Button - Outline */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="הרשמה"
            accessibilityHint="מעביר למסך ההרשמה"
            onPress={handleSignUpPress}
            hitSlop={10}
            className="border-2 border-zinc-300 rounded-xl py-4 items-center min-h-[56px] bg-transparent"
          >
            <Text className="text-white text-lg font-bold">הרשמה</Text>
          </Pressable>

          {/* Guest Option */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="המשך כאורח"
            accessibilityHint="מאפשר גישה בסיסית ללא התחברות"
            onPress={handleGuestPress}
            hitSlop={10}
            className="py-3"
          >
            <Text className="text-zinc-500 text-sm text-center">
              המשך כאורח
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
