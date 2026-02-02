import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Calendar, Clock, User } from 'lucide-react-native';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const business = useQuery(api.businesses.getMyBusiness);
  const createAppointment = useMutation(api.appointments.create);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // שעה אחרי
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title || !clientName || !business) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות הנדרשים');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('שגיאה', 'זמן הסיום חייב להיות אחרי זמן ההתחלה');
      return;
    }

    setIsCreating(true);
    try {
      const appointmentId = await createAppointment({
        businessId: business._id,
        title,
        description: description || undefined,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        clientName,
        clientPhone: clientPhone || undefined,
        clientEmail: clientEmail || undefined,
      });

      // מעבר למסך Success
      router.push({
        pathname: '/(authenticated)/appointment-success',
        params: { id: appointmentId },
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('שגיאה', 'לא הצלחנו ליצור את הפגישה. נסה שוב.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!business) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text className="text-zinc-400 text-base mt-4">טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className={`${tw.flexRow} items-center justify-between px-6 pt-4 pb-2`}
        >
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="חזור"
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Text className="text-sky-400 text-base">ביטול</Text>
          </Pressable>
          <Text className={`text-white text-lg font-semibold ${tw.textStart}`}>
            צור פגישה חדשה
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Title */}
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                כותרת הפגישה *
              </Text>
              <TextInput
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                style={{ textAlign: 'right' }}
                value={title}
                onChangeText={setTitle}
                placeholder="לדוגמה: תור לקליניקה"
                placeholderTextColor="#52525b"
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                תיאור (אופציונלי)
              </Text>
              <TextInput
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base min-h-[100px]"
                style={{ textAlign: 'right', textAlignVertical: 'top' }}
                value={description}
                onChangeText={setDescription}
                placeholder="פרטים נוספים על הפגישה..."
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Client Name */}
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                שם הלקוח *
              </Text>
              <View className="flex-row items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4">
                <User size={20} color="#71717a" />
                <TextInput
                  className="flex-1 text-white text-base"
                  style={{ textAlign: 'right' }}
                  value={clientName}
                  onChangeText={setClientName}
                  placeholder="שם מלא"
                  placeholderTextColor="#52525b"
                />
              </View>
            </View>

            {/* Client Phone */}
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                טלפון (אופציונלי)
              </Text>
              <TextInput
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                style={{ textAlign: 'right' }}
                value={clientPhone}
                onChangeText={setClientPhone}
                placeholder="050-1234567"
                placeholderTextColor="#52525b"
                keyboardType="phone-pad"
              />
            </View>

            {/* Client Email */}
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                אימייל (אופציונלי)
              </Text>
              <TextInput
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base"
                style={{ textAlign: 'right' }}
                value={clientEmail}
                onChangeText={setClientEmail}
                placeholder="client@example.com"
                placeholderTextColor="#52525b"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Start Time */}
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                זמן התחלה *
              </Text>
              <Pressable
                accessible={true}
                accessibilityRole="button"
                onPress={() => setShowStartPicker(true)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <Clock size={20} color="#71717a" />
                  <Text className="text-white text-base">
                    {formatDateTime(startDate)}
                  </Text>
                </View>
                <Calendar size={20} color="#71717a" />
              </Pressable>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowStartPicker(false);
                    }
                    if (selectedDate) {
                      setStartDate(selectedDate);
                      // עדכון זמן סיום אוטומטית (שעה אחרי)
                      setEndDate(
                        new Date(selectedDate.getTime() + 60 * 60 * 1000)
                      );
                    }
                    if (Platform.OS === 'ios' && event.type === 'dismissed') {
                      setShowStartPicker(false);
                    }
                  }}
                />
              )}
            </View>

            {/* End Time */}
            <View className="mb-8">
              <Text
                className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
              >
                זמן סיום *
              </Text>
              <Pressable
                accessible={true}
                accessibilityRole="button"
                onPress={() => setShowEndPicker(true)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <Clock size={20} color="#71717a" />
                  <Text className="text-white text-base">
                    {formatDateTime(endDate)}
                  </Text>
                </View>
                <Calendar size={20} color="#71717a" />
              </Pressable>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  is24Hour={true}
                  minimumDate={startDate}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setShowEndPicker(false);
                    }
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                    if (Platform.OS === 'ios' && event.type === 'dismissed') {
                      setShowEndPicker(false);
                    }
                  }}
                />
              )}
            </View>

            {/* Create Button */}
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="צור פגישה"
              onPress={handleCreate}
              disabled={isCreating}
              className={`bg-sky-400 rounded-xl py-4 items-center min-h-[56px] ${
                isCreating ? 'opacity-60' : ''
              }`}
            >
              {isCreating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-bold">צור פגישה</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
