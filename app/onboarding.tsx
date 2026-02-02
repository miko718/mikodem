import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  Laptop,
  MapPin,
  Navigation,
  Phone,
  Zap,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tw } from '@/lib/rtl';

const ONBOARDING_STEPS = [
  {
    icon: Laptop,
    title: 'ניהול תורים חכם',
    description:
      'מערכת ניהול תורים דינמית שמתאימה את עצמה למיקום הלקוחות בזמן אמת. לא עוד המתנות מיותרות או איחורים.',
    illustration: 'laptop',
  },
  {
    icon: Phone,
    title: 'קביעת תורים פשוטה',
    description:
      'קביעת תורים מהירה ונוחה. המערכת תשלח לך התראה 5 דקות לפני התור.',
    illustration: 'phone',
  },
  {
    icon: Navigation,
    title: 'חישוב ETA מדויק',
    description:
      'חישוב זמן הגעה משוער (ETA) כל 5 דקות עם Google Maps, תוך התחשבות בעומסי תנועה בזמן אמת.',
    illustration: 'navigation',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // סיום Onboarding - מעבר למסך כניסה
      router.replace('/(auth)/sign-in');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/sign-in');
  };

  const Icon = ONBOARDING_STEPS[currentStep].icon;

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header with step indicator */}
      <View
        className={`${tw.flexRow} items-center justify-between px-6 pt-4 pb-2`}
      >
        <View className="w-12" />
        <Text className="text-zinc-400 text-sm">
          {currentStep + 1}/{ONBOARDING_STEPS.length}
        </Text>
        {currentStep === 1 && (
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="חזור"
            onPress={() => setCurrentStep(currentStep - 1)}
            hitSlop={10}
          >
            <ChevronLeft size={24} color="#71717a" />
          </Pressable>
        )}
        {currentStep === 1 && (
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="התראות"
            onPress={() => {}}
            hitSlop={10}
          >
            <Bell size={24} color="#71717a" />
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 justify-center items-center px-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View className="mb-12">
          <View className="w-48 h-48 rounded-3xl bg-sky-500/10 items-center justify-center border border-sky-500/20">
            {currentStep === 0 && (
              <View className="items-center">
                <Laptop size={80} color="#0ea5e9" />
                <View className="absolute -top-2 -right-2">
                  <View className="w-8 h-8 rounded-full bg-sky-500/20 items-center justify-center">
                    <MapPin size={16} color="#0ea5e9" />
                  </View>
                </View>
              </View>
            )}
            {currentStep === 1 && (
              <View className="items-center">
                <Phone size={80} color="#0ea5e9" />
                <View className="absolute -top-2 -right-2">
                  <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                    <Zap size={16} color="#10b981" />
                  </View>
                </View>
              </View>
            )}
            {currentStep === 2 && (
              <View className="items-center">
                <Navigation size={80} color="#0ea5e9" />
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="items-center mb-12">
          <Text
            className={`text-3xl font-bold text-white mb-4 text-center ${tw.textStart}`}
          >
            {ONBOARDING_STEPS[currentStep].title}
          </Text>
          <Text
            className={`text-zinc-400 text-base leading-7 text-center ${tw.textStart}`}
          >
            {ONBOARDING_STEPS[currentStep].description}
          </Text>
        </View>

        {/* Progress Indicators */}
        <View className={`${tw.flexRow} items-center gap-2 mb-8`}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentStep ? 'w-8 bg-sky-400' : 'w-2 bg-zinc-700'
              }`}
            />
          ))}
        </View>

        {/* Action Button */}
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            currentStep < ONBOARDING_STEPS.length - 1 ? 'המשך' : 'התחל'
          }
          onPress={handleNext}
          className="bg-sky-400 rounded-xl py-4 px-8 min-w-[200px] items-center min-h-[56px]"
        >
          <View className={`${tw.flexRow} items-center gap-2`}>
            <Text className="text-white text-lg font-bold">
              {currentStep < ONBOARDING_STEPS.length - 1 ? 'המשך' : 'התחל'}
            </Text>
            {currentStep < ONBOARDING_STEPS.length - 1 && (
              <ChevronLeft size={20} color="#ffffff" />
            )}
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
