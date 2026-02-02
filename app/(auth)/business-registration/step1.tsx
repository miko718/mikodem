import { useMutation } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { WebViewModal } from '@/components/WebViewModal';
import { PRIVACY_URL, TERMS_URL } from '@/config/appConfig';
import { api } from '@/convex/_generated/api';
import { rtl, tw } from '@/lib/rtl';

// רשימת תחומי עיסוק (TODO: להעביר ל-constants או DB)
const BUSINESS_FIELDS = [
  'ייעוץ עסקי',
  'שיווק דיגיטלי',
  'עיצוב גרפי',
  'פיתוח תוכנה',
  'חשבונאות',
  'משפטים',
  'רפואה',
  'חינוך',
  'אחר',
];

export default function BusinessRegistrationStep1() {
  const router = useRouter();
  const saveStep1 = useMutation(api.businesses.saveStep1);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessField, setBusinessField] = useState('');
  const [businessSeniority, setBusinessSeniority] = useState('');
  const [businessIdNumber, setBusinessIdNumber] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogoUpload = async () => {
    // בקש הרשאות גישה לתמונות
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('הרשאות נדרשות', 'אנא אפשר גישה לתמונות בהגדרות המכשיר');
      return;
    }

    // פתח את בוחר התמונות
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (
      !fullName ||
      !businessName ||
      !businessField ||
      !businessSeniority ||
      !businessIdNumber
    ) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים');
      return;
    }

    setIsSaving(true);
    try {
      await saveStep1({
        fullName,
        businessName,
        businessField,
        businessSeniority,
        businessIdNumber,
        logoUri: logoUri || undefined,
      });
      router.push('/(auth)/business-registration/step2');
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לשמור את הנתונים. אנא נסה שוב.');
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
          <Text className="text-zinc-400 text-sm">שלב 1 מתוך 3</Text>
        </View>

        {/* Progress Bar */}
        <View className="px-6 mb-6">
          <View className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <View className="h-full bg-sky-400" style={{ width: '33%' }} />
          </View>
          <Text className={`text-zinc-500 text-xs mt-1 ${tw.textStart}`}>
            33%
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-8">
            {/* Welcome Text */}
            <Text
              className={`text-3xl font-bold text-white mb-2 ${tw.textStart}`}
            >
              נעים להכיר!
            </Text>
            <Text
              className={`text-zinc-400 text-base mb-8 leading-6 ${tw.textStart}`}
            >
              מלא את הפרטים הבאים כדי להצטרף לקהילת בעלי העסקים ולהתחיל להשפיע
            </Text>

            {/* Logo Upload */}
            <View className="items-center mb-8">
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="העלאת לוגו עסק"
                onPress={handleLogoUpload}
                className="relative"
              >
                <View className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-700 items-center justify-center bg-zinc-900 overflow-hidden">
                  {logoUri ? (
                    <Image
                      source={{ uri: logoUri }}
                      className="w-full h-full"
                      accessibilityLabel="לוגו עסק"
                    />
                  ) : (
                    <Text className="text-4xl font-bold text-zinc-600">A</Text>
                  )}
                </View>
                <View className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-sky-400 items-center justify-center border-4 border-black">
                  <Plus size={20} color="#ffffff" />
                </View>
              </Pressable>
              <Text className="text-sky-400 text-sm mt-3">העלאת לוגו עסק</Text>
            </View>

            {/* Form Fields */}
            <View className="gap-5">
              {/* Full Name */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  שם מלא
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="ישראל ישראלי"
                  placeholderTextColor="#52525b"
                  editable={true}
                />
              </View>

              {/* Business Name */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  שם העסק
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="העסק שלי בע״מ"
                  placeholderTextColor="#52525b"
                  editable={true}
                />
              </View>

              {/* Business Field - Dropdown */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  תחום עיסוק
                </Text>
                <Pressable
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="בחר תחום עיסוק"
                  onPress={() => setShowFieldPicker(!showFieldPicker)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4"
                >
                  <View
                    className={`${tw.flexRow} items-center justify-between`}
                  >
                    <Text
                      className={`${
                        businessField ? 'text-white' : 'text-zinc-500'
                      } text-base ${tw.textStart}`}
                    >
                      {businessField || 'בחר תחום עיסוק'}
                    </Text>
                    <ChevronLeft
                      size={20}
                      color="#71717a"
                      style={{
                        transform: [
                          { rotate: showFieldPicker ? '90deg' : '0deg' },
                        ],
                      }}
                    />
                  </View>
                </Pressable>

                {/* Dropdown Options */}
                {showFieldPicker && (
                  <View className="mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    {BUSINESS_FIELDS.map((field) => (
                      <Pressable
                        key={field}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`בחר ${field}`}
                        onPress={() => {
                          setBusinessField(field);
                          setShowFieldPicker(false);
                        }}
                        className={`px-4 py-3 border-b border-zinc-800 ${
                          businessField === field ? 'bg-zinc-800' : ''
                        }`}
                      >
                        <Text
                          className={`text-white text-base ${tw.textStart} ${
                            businessField === field ? 'font-semibold' : ''
                          }`}
                        >
                          {field}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Business Seniority */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  ותק בעסק
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={businessSeniority}
                  onChangeText={setBusinessSeniority}
                  placeholder="כמה שנים העסק קיים?"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
                  editable={true}
                />
              </View>

              {/* Business ID Number */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  מספר עוסק
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                  style={{ textAlign: rtl.textAlign }}
                  value={businessIdNumber}
                  onChangeText={setBusinessIdNumber}
                  placeholder="ח.פ / עוסק מורשה"
                  placeholderTextColor="#52525b"
                  keyboardType="numeric"
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
                  <Text className="text-white text-lg font-bold">
                    המשך לשלב הבא
                  </Text>
                  <ChevronLeft size={20} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Legal Disclaimer */}
            <View className="mt-4">
              <Text
                className={`text-zinc-500 text-xs text-center leading-5 ${tw.textStart}`}
              >
                בלחיצה על המשך, הינך מסכים ל{' '}
                <Text
                  className="text-sky-400"
                  onPress={() => setTermsModalVisible(true)}
                >
                  תנאי השימוש
                </Text>{' '}
                ול{' '}
                <Text
                  className="text-sky-400"
                  onPress={() => setPrivacyModalVisible(true)}
                >
                  מדיניות הפרטיות
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <WebViewModal
        visible={termsModalVisible}
        url={TERMS_URL}
        onClose={() => setTermsModalVisible(false)}
        title="תנאי שימוש"
      />

      {/* Privacy Modal */}
      <WebViewModal
        visible={privacyModalVisible}
        url={PRIVACY_URL}
        onClose={() => setPrivacyModalVisible(false)}
        title="מדיניות פרטיות"
      />
    </SafeAreaView>
  );
}
