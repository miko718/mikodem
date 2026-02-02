import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Navigation, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tw } from '@/lib/rtl';

const ONBOARDING_STEPS = [
  {
    icon: MapPin,
    title: 'ניהול תורים חכם',
    description:
      'מערכת ניהול תורים דינמית שמתאימה את עצמה למיקום הלקוחות בזמן אמת. לא עוד המתנות מיותרות או איחורים.',
  },
  {
    icon: Navigation,
    title: 'חישוב ETA מדויק',
    description:
      'חישוב זמן הגעה משוער (ETA) כל 5 דקות עם Google Maps, תוך התחשבות בעומסי תנועה בזמן אמת.',
  },
  {
    icon: Zap,
    title: 'אופטימיזציה אוטומטית',
    description:
      'המערכת מזהה הזדמנויות להחלפת תורים ומציעה פתרונות חכמים כדי למנוע "חורים" ביומן ולצמצם לחץ.',
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
      {/* Skip Button */}
      <View className={`${tw.flexRow} justify-end px-6 pt-4`}>
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="דלג"
          onPress={handleSkip}
          hitSlop={10}
        >
          <Text className="text-zinc-400 text-base">דלג</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 justify-center items-center px-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View className="mb-8">
          <View className="w-24 h-24 rounded-full bg-sky-500/20 items-center justify-center">
            <Icon size={48} color="#0ea5e9" />
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
