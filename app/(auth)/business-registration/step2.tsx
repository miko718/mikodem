import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SafeAreaView } from 'react-native-safe-area-context';

import { rtl, tw } from '@/lib/rtl';

export default function BusinessRegistrationStep2() {
  const router = useRouter();
  const saveStep2 = useMutation(api.businesses.saveStep2);
  const [businessAddress, setBusinessAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [businessLink, setBusinessLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (!businessAddress || !city || !phone) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים');
      return;
    }

    setIsSaving(true);
    try {
      await saveStep2({
        businessAddress,
        city,
        phone,
        website: website || undefined,
        businessLink: businessLink || undefined,
      });
      router.push('/(auth)/business-registration/step3');
    } catch (error) {
      Alert.alert(
        'שגיאה',
        'לא הצלחנו לשמור את הנתונים. אנא נסה שוב.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className={`${tw.flexRow} items-center justify-between px-6 pt-4 pb-2`}>
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
            <Text className={`text-white text-lg font-semibold ${tw.textStart}`}>
              רישום בעל עסק
            </Text>
          </View>
          <Text className="text-zinc-400 text-sm">שלב 2 מתוך 3</Text>
        </View>

        {/* Progress Bar */}
        <View className="px-6 mb-6">
          <View className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <View className="h-full bg-sky-400" style={{ width: '66%' }} />
          </View>
          <Text className={`text-zinc-500 text-xs mt-1 ${tw.textStart}`}>
            66%
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-8">
            {/* Title */}
            <Text
              className={`text-3xl font-bold text-white mb-2 ${tw.textStart}`}
            >
              פרטי קשר
            </Text>
            <Text
              className={`text-zinc-400 text-base mb-8 leading-6 ${tw.textStart}`}
            >
              מלא את פרטי הקשר והכתובת של העסק שלך
            </Text>

            {/* Form Fields */}
            <View className="gap-5">
              {/* Business Address */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  כתובת העסק
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={businessAddress}
                  onChangeText={setBusinessAddress}
                  placeholder="רחוב ושם מספר"
                  placeholderTextColor="#52525b"
                  editable={true}
                />
              </View>

              {/* City */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  עיר
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={city}
                  onChangeText={setCity}
                  placeholder="תל אביב"
                  placeholderTextColor="#52525b"
                  editable={true}
                />
              </View>

              {/* Phone */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  טלפון
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="050-1234567"
                  placeholderTextColor="#52525b"
                  keyboardType="phone-pad"
                  editable={true}
                />
              </View>

              {/* Website (Optional) */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  אתר אינטרנט (אופציונלי)
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://example.com"
                  placeholderTextColor="#52525b"
                  keyboardType="url"
                  autoCapitalize="none"
                  editable={true}
                />
              </View>

              {/* Business Link (Optional) */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  קישור לדף עסקי (אופציונלי)
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={businessLink}
                  onChangeText={setBusinessLink}
                  placeholder="https://facebook.com/mybusiness"
                  placeholderTextColor="#52525b"
                  keyboardType="url"
                  autoCapitalize="none"
                  editable={true}
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="המשך לשלב הבא"
              onPress={handleContinue}
              disabled={isSaving}
              className={`bg-sky-400 rounded-xl py-4 items-center mt-8 min-h-[56px] ${
                isSaving ? 'opacity-60' : ''
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View className={`${tw.flexRow} items-center gap-2`}>
                  <Text className="text-white text-lg font-bold">המשך לשלב הבא</Text>
                  <ChevronLeft size={20} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
