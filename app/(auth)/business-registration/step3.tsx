import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';

import { rtl, tw } from '@/lib/rtl';

export default function BusinessRegistrationStep3() {
  const router = useRouter();
  const saveStep3 = useMutation(api.businesses.saveStep3);
  const [benefitDescription, setBenefitDescription] = useState('');
  const [benefitDiscount, setBenefitDiscount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!benefitDescription) {
      Alert.alert('שגיאה', 'אנא הזן תיאור של ההטבה שאתה מציע');
      return;
    }

    setIsSubmitting(true);

    try {
      await saveStep3({
        benefitDescription,
        benefitDiscount: benefitDiscount || undefined,
      });

      Alert.alert('הצלחה!', 'הרישום הושלם בהצלחה', [
        {
          text: 'אישור',
          onPress: () => {
            // מעבר למסך בחירת מסלול מנוי
            router.replace('/(auth)/subscription');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה ברישום. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className={`${tw.flexRow} items-center justify-between px-6 pt-4 pb-2`}
        >
          <View className={`${tw.flexRow} items-center gap-2`}>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="חזור"
              hitSlop={10}
              onPress={() => router.back()}
            >
              <ChevronRight size={24} color="#71717a" />
            </Pressable>
            <Text
              className={`text-white text-lg font-semibold ${tw.textStart}`}
            >
              רישום בעל עסק
            </Text>
          </View>
          <Text className="text-zinc-400 text-sm">שלב 3 מתוך 3</Text>
        </View>

        {/* Progress Bar */}
        <View className="px-6 mb-6">
          <View className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <View className="h-full bg-sky-400" style={{ width: '100%' }} />
          </View>
          <Text className={`text-zinc-500 text-xs mt-1 ${tw.textStart}`}>
            100%
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-8">
            {/* Title */}
            <Text
              className={`text-3xl font-bold text-white mb-2 ${tw.textStart}`}
            >
              ההטבה שלך
            </Text>
            <Text
              className={`text-zinc-400 text-base mb-8 leading-6 ${tw.textStart}`}
            >
              מה ההטבה או הנחה שאתה מציע לקהילת העצמאים? זה יעזור לאחרים להכיר
              את העסק שלך
            </Text>

            {/* Form Fields */}
            <View className="gap-5">
              {/* Benefit Description */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  תיאור ההטבה
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base min-h-[120px]"
                  style={{ textAlign: rtl.textAlign, textAlignVertical: 'top' }}
                  value={benefitDescription}
                  onChangeText={setBenefitDescription}
                  placeholder="לדוגמה: 20% הנחה על כל השירותים, או הנחה של 100 ש״ח על רכישה ראשונה..."
                  placeholderTextColor="#52525b"
                  multiline={true}
                  numberOfLines={5}
                  editable={true}
                />
              </View>

              {/* Benefit Discount (Optional) */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  אחוז הנחה (אופציונלי)
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={benefitDiscount}
                  onChangeText={setBenefitDiscount}
                  placeholder="20"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  editable={true}
                />
              </View>
            </View>

            {/* Summary Card */}
            <View className="mt-8 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <Text
                className={`text-white text-lg font-semibold mb-3 ${tw.textStart}`}
              >
                סיכום
              </Text>
              <View className="gap-2">
                <View className={`${tw.flexRow} items-center gap-2`}>
                  <Check size={16} color="#4fc3f7" />
                  <Text className="text-zinc-300 text-sm">פרטי העסק נשמרו</Text>
                </View>
                <View className={`${tw.flexRow} items-center gap-2`}>
                  <Check size={16} color="#4fc3f7" />
                  <Text className="text-zinc-300 text-sm">
                    פרטי הקשר עודכנו
                  </Text>
                </View>
                <View className={`${tw.flexRow} items-center gap-2`}>
                  <Check size={16} color="#4fc3f7" />
                  <Text className="text-zinc-300 text-sm">
                    ההטבה שלך מוכנה לפרסום
                  </Text>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="סיים רישום"
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`bg-sky-400 rounded-xl py-4 items-center mt-8 min-h-[56px] ${
                isSubmitting ? 'opacity-60' : ''
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View className={`${tw.flexRow} items-center gap-2`}>
                  <Text className="text-white text-lg font-bold">
                    סיים רישום
                  </Text>
                  <Check size={20} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
