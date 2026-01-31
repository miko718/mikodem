import {
  Building2,
  Check,
  Scale,
  Users,
  X,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WebViewModal } from '@/components/WebViewModal';
import { IS_DEV_MODE, PRIVACY_URL, TERMS_URL } from '@/config/appConfig';
import {
  PREMIUM_ADDITIONAL_BENEFITS,
  SUBSCRIPTION_PLANS,
  WHY_JOIN_ITEMS,
  type SubscriptionPlan,
} from '@/config/subscriptionConfig';
import { useRevenueCat } from '@/contexts/RevenueCatContext';
import { tw } from '@/lib/rtl';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { packages, isLoading, purchasePackage, isExpoGo } = useRevenueCat();

  const [selectedPlanType, setSelectedPlanType] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('premium');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  // חישוב מחירים
  const getPrice = (planId: SubscriptionPlan): number => {
    const plan = SUBSCRIPTION_PLANS[planId];
    return selectedPlanType === 'monthly'
      ? plan.monthlyPrice
      : plan.annualPrice;
  };

  const handleClose = (): void => {
    router.back();
  };

  const handleStartTrial = async (): Promise<void> => {
    // מציאת החבילה המתאימה ב-RevenueCat
    const packageType = selectedPlanType === 'monthly' ? 'monthly' : 'annual';
    const revenueCatPackage = packages.find(
      (p) => p.packageType === packageType
    );

    if (!revenueCatPackage) {
      Alert.alert(
        'שגיאה',
        'החבילה לא זמינה כרגע. אנא נסה שוב מאוחר יותר.'
      );
      return;
    }

    setIsPurchasing(true);
    try {
      const success = await purchasePackage(revenueCatPackage.identifier);
      if (success) {
        router.replace('/(authenticated)');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בתהליך הרכישה. אנא נסה שוב.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleContactSupport = (): void => {
    // TODO: הוסף קישור לתמיכה או טלפון
    Linking.openURL('tel:+972501234567').catch(() => {
      Alert.alert('שגיאה', 'לא ניתן לפתוח את הטלפון');
    });
  };

  const IconComponent = ({
    iconName,
  }: {
    iconName: string;
  }): React.ReactElement | null => {
    switch (iconName) {
      case 'Building2':
        return <Building2 size={32} color="#4fc3f7" />;
      case 'Scale':
        return <Scale size={32} color="#4fc3f7" />;
      case 'Users':
        return <Users size={32} color="#4fc3f7" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#4fc3f7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <WebViewModal
        visible={termsModalVisible}
        url={TERMS_URL}
        title="תנאי השימוש"
        onClose={() => setTermsModalVisible(false)}
      />

      <WebViewModal
        visible={privacyModalVisible}
        url={PRIVACY_URL}
        title="מדיניות הפרטיות"
        onClose={() => setPrivacyModalVisible(false)}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className={`${tw.flexRow} items-center justify-between px-6 pt-4`}>
          <View className={`${tw.flexRow} items-center gap-3`}>
            <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center">
              <Text className="text-2xl font-bold text-zinc-400">A</Text>
            </View>
            <Text className="text-white text-sm font-semibold">
              PREMIUM EXPERIENCE
            </Text>
          </View>
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="סגור"
            onPress={handleClose}
            hitSlop={10}
          >
            <X size={24} color="#71717a" />
          </Pressable>
        </View>

        {/* Title Section */}
        <View className="px-6 pt-6 pb-4">
          <Text
            className={`text-white text-4xl font-bold mb-3 ${tw.textStart} text-center`}
          >
            בחרו את המסלול שלכם
          </Text>
          <Text
            className={`text-white text-base mb-6 ${tw.textStart} text-center`}
          >
            הצטרפו לקהילת העצמאיים והחזקה בישראל
          </Text>

          {/* Toggle Monthly/Annual */}
          <View className="bg-zinc-900 rounded-xl p-1 flex-row">
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="מסלול חודשי"
              onPress={() => setSelectedPlanType('monthly')}
              className={`flex-1 py-3 rounded-lg ${
                selectedPlanType === 'monthly'
                  ? 'bg-zinc-700'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedPlanType === 'monthly'
                    ? 'text-white'
                    : 'text-zinc-400'
                }`}
              >
                חודשי
              </Text>
            </Pressable>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="מסלול שנתי עם הנחה"
              onPress={() => setSelectedPlanType('annual')}
              className={`flex-1 py-3 rounded-lg ${
                selectedPlanType === 'annual'
                  ? 'bg-zinc-700'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  selectedPlanType === 'annual'
                    ? 'text-white'
                    : 'text-zinc-400'
                }`}
              >
                שנתי -{SUBSCRIPTION_PLANS.premium.annualDiscount}%
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Subscription Plans */}
        <View className="px-6 gap-4">
          {/* Basic Plan */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${SUBSCRIPTION_PLANS.basic.name} - ${getPrice('basic')} ש״ח`}
            onPress={() => setSelectedPlan('basic')}
            className={`border-2 rounded-xl p-5 ${
              selectedPlan === 'basic'
                ? 'border-sky-400 bg-zinc-900'
                : 'border-zinc-700 bg-zinc-900'
            }`}
          >
            <View className={`${tw.flexRow} items-center gap-3 mb-3`}>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlan === 'basic'
                    ? 'border-sky-400 bg-sky-400'
                    : 'border-zinc-600'
                }`}
              >
                {selectedPlan === 'basic' && (
                  <Check size={14} color="#0a0a0a" strokeWidth={3} />
                )}
              </View>
              <Text className="text-white text-xl font-bold">
                {SUBSCRIPTION_PLANS.basic.name}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-4">
              ₪{getPrice('basic')} /{' '}
              {selectedPlanType === 'monthly' ? 'חודש' : 'שנה'}
            </Text>
            <View className="gap-3">
              {SUBSCRIPTION_PLANS.basic.features.map((feature, index) => (
                <View key={index} className={`${tw.flexRow} items-center gap-3`}>
                  <Check size={20} color="#4fc3f7" />
                  <Text className="text-zinc-300 text-base">{feature.title}</Text>
                </View>
              ))}
            </View>
          </Pressable>

          {/* Premium Plan */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${SUBSCRIPTION_PLANS.premium.name} - ${getPrice('premium')} ש״ח - מומלץ`}
            onPress={() => setSelectedPlan('premium')}
            className={`border-2 rounded-xl p-5 relative ${
              selectedPlan === 'premium'
                ? 'border-sky-400 bg-zinc-900'
                : 'border-sky-400/50 bg-zinc-900'
            }`}
          >
            {SUBSCRIPTION_PLANS.premium.recommended && (
              <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-400 px-4 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">מומלץ</Text>
              </View>
            )}
            <View className={`${tw.flexRow} items-center gap-3 mb-3`}>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPlan === 'premium'
                    ? 'border-sky-400 bg-sky-400'
                    : 'border-zinc-600'
                }`}
              >
                {selectedPlan === 'premium' && (
                  <Check size={14} color="#0a0a0a" strokeWidth={3} />
                )}
              </View>
              <View className={`${tw.flexRow} items-center gap-2 flex-1`}>
                <Text className="text-white text-xl font-bold">
                  {SUBSCRIPTION_PLANS.premium.name}
                </Text>
                <Check size={20} color="#4fc3f7" />
              </View>
            </View>
            <Text className="text-white text-2xl font-bold mb-4">
              ₪{getPrice('premium')} /{' '}
              {selectedPlanType === 'monthly' ? 'חודש' : 'שנה'}
            </Text>
            <View className="gap-3">
              {SUBSCRIPTION_PLANS.premium.features.map((feature, index) => (
                <View key={index} className="gap-1">
                  <View className={`${tw.flexRow} items-center gap-3`}>
                    <Check size={20} color="#4fc3f7" />
                    <Text className="text-zinc-300 text-base font-semibold">
                      {feature.title}
                    </Text>
                  </View>
                  {feature.description && (
                    <Text className="text-zinc-500 text-sm mr-8">
                      {feature.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Pressable>
        </View>

        {/* Start Trial Button */}
        <View className="px-6 mt-6">
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="התחל תקופת ניסיון"
            onPress={handleStartTrial}
            disabled={isPurchasing || isExpoGo}
            className={`bg-sky-400 rounded-xl py-4 items-center min-h-[56px] ${
              isPurchasing || isExpoGo ? 'opacity-60' : ''
            }`}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-bold">
                התחל תקופת ניסיון
              </Text>
            )}
          </TouchableOpacity>

          <Pressable
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="דברו עם נציג שירות"
            onPress={handleContactSupport}
            className="mt-3"
          >
            <Text className="text-sky-400 text-center text-sm underline">
              דברו עם נציג שירות
            </Text>
          </Pressable>
        </View>

        {/* Additional Premium Benefits */}
        <View className="px-6 mt-6">
          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <View className="gap-3">
              {PREMIUM_ADDITIONAL_BENEFITS.map((benefit, index) => (
                <View key={index} className={`${tw.flexRow} items-center gap-3`}>
                  <Check size={20} color="#4fc3f7" />
                  <Text className="text-zinc-300 text-base">{benefit.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Why Join Section */}
        <View className="px-6 mt-8 mb-6">
          <Text
            className={`text-white text-2xl font-bold mb-6 ${tw.textStart} text-center`}
          >
            למה כדאי להצטרף?
          </Text>
          <View className={`${tw.flexRow} justify-around`}>
            {WHY_JOIN_ITEMS.map((item, index) => (
              <View key={index} className="items-center gap-2">
                <View className="w-16 h-16 rounded-full bg-zinc-900 items-center justify-center">
                  <IconComponent iconName={item.icon} />
                </View>
                <Text className="text-zinc-300 text-sm text-center max-w-[80px]">
                  {item.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="px-6 pb-8">
          <Text className="text-zinc-500 text-xs text-center">
            המינוי מתחדש אוטומטית. ניתן לבטל בכל עת.
          </Text>
          <View className={`${tw.flexRow} justify-center gap-4 mt-4`}>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              onPress={() => setTermsModalVisible(true)}
            >
              <Text className="text-zinc-500 text-xs">תנאי שימוש</Text>
            </Pressable>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              onPress={() => setPrivacyModalVisible(true)}
            >
              <Text className="text-zinc-500 text-xs">פרטיות</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
