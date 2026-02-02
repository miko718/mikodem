import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, Clock, MapPin, User } from 'lucide-react-native';
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

export default function AppointmentDetailsScreen() {
  const { serviceId, serviceName, startTime, endTime } = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    startTime: string;
    endTime: string;
  }>();
  const router = useRouter();
  const business = useQuery(api.businesses.getMyBusiness);
  const createAppointment = useMutation(api.appointments.create);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const startDate = new Date(parseInt(startTime || '0', 10));
  const endDate = new Date(parseInt(endTime || '0', 10));

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('he-IL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirm = async () => {
    if (!clientName || !business) {
      Alert.alert('שגיאה', 'אנא מלא את שם הלקוח');
      return;
    }

    setIsCreating(true);
    try {
      const appointmentId = await createAppointment({
        businessId: business._id,
        title: serviceName || 'פגישה',
        description: notes || undefined,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        clientName,
        clientPhone: clientPhone || undefined,
        clientEmail: clientEmail || undefined,
      });

      router.push({
        pathname: '/(authenticated)/appointment-success',
        params: { id: appointmentId },
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('שגיאה', 'לא הצלחנו ליצור את התור. נסה שוב.');
    } finally {
      setIsCreating(false);
    }
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
            <Text className="text-sky-400 text-base">חזור</Text>
          </Pressable>
          <Text className={`text-white text-lg font-semibold ${tw.textStart}`}>
            פרטים אישיים
          </Text>
          <View className="w-12" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Summary Card */}
            <View className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800">
              <Text
                className={`text-white text-lg font-semibold mb-4 ${tw.textStart}`}
              >
                סיכום התור
              </Text>

              <View className="gap-3">
                {/* Service */}
                <View className="flex-row items-start gap-3">
                  <CheckCircle size={20} color="#4fc3f7" />
                  <View className="flex-1">
                    <Text
                      className={`text-zinc-400 text-xs mb-1 ${tw.textStart}`}
                    >
                      שירות
                    </Text>
                    <Text className={`text-white text-base ${tw.textStart}`}>
                      {serviceName}
                    </Text>
                  </View>
                </View>

                {/* Date & Time */}
                <View className="flex-row items-start gap-3">
                  <Clock size={20} color="#4fc3f7" />
                  <View className="flex-1">
                    <Text
                      className={`text-zinc-400 text-xs mb-1 ${tw.textStart}`}
                    >
                      תאריך ושעה
                    </Text>
                    <Text className={`text-white text-base ${tw.textStart}`}>
                      {formatDateTime(startDate)}
                    </Text>
                  </View>
                </View>

                {/* Location */}
                {business.businessLocation && (
                  <View className="flex-row items-start gap-3">
                    <MapPin size={20} color="#4fc3f7" />
                    <View className="flex-1">
                      <Text
                        className={`text-zinc-400 text-xs mb-1 ${tw.textStart}`}
                      >
                        מיקום
                      </Text>
                      <Text className={`text-white text-base ${tw.textStart}`}>
                        {business.businessAddress ||
                          business.city ||
                          'מיקום לא מוגדר'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Form Fields */}
            <View className="gap-5 mb-6">
              {/* Client Name */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  שם מלא *
                </Text>
                <View className="flex-row items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4">
                  <User size={20} color="#71717a" />
                  <TextInput
                    className="flex-1 text-white text-base"
                    style={{ textAlign: 'right' }}
                    value={clientName}
                    onChangeText={setClientName}
                    placeholder="שם הלקוח"
                    placeholderTextColor="#52525b"
                  />
                </View>
              </View>

              {/* Client Phone */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  טלפון
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
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  אימייל
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

              {/* Notes */}
              <View>
                <Text
                  className={`text-white text-sm font-medium mb-2 ${tw.textStart}`}
                >
                  הערות (אופציונלי)
                </Text>
                <TextInput
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white text-base min-h-[100px]"
                  style={{ textAlign: 'right', textAlignVertical: 'top' }}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="הערות נוספות..."
                  placeholderTextColor="#52525b"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            {/* Confirm Button */}
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="אשר תור"
              onPress={handleConfirm}
              disabled={isCreating || !clientName}
              className={`bg-sky-400 rounded-xl py-4 items-center min-h-[56px] ${
                isCreating || !clientName ? 'opacity-50' : ''
              }`}
            >
              {isCreating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-lg font-bold">אשר תור</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
