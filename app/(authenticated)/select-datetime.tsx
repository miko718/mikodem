import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tw } from '@/lib/rtl';

// יצירת רשימת שעות פנויות (ניתן להחליף בלוגיקה דינמית)
const generateAvailableSlots = (selectedDate: Date): string[] => {
  const slots: string[] = [];
  const startHour = 9; // 9:00
  const endHour = 18; // 18:00
  const slotDuration = 30; // 30 דקות

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }

  return slots;
};

export default function SelectDateTimeScreen() {
  const { serviceId, serviceName } = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
  }>();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [preferredOption, setPreferredOption] = useState<
    'earliest' | 'preferred' | null
  >(null);

  const availableSlots = generateAvailableSlots(selectedDate);

  const handleContinue = () => {
    if (!selectedTime) {
      return;
    }

    // חישוב תאריך ושעה מלאים
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(appointmentDate);
    endDate.setHours(endDate.getHours() + 1); // שעה אחרי

    router.push({
      pathname: '/(authenticated)/appointment-details',
      params: {
        serviceId: serviceId || '',
        serviceName: serviceName || '',
        startTime: appointmentDate.getTime().toString(),
        endTime: endDate.getTime().toString(),
      },
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEarliestSlot = () => {
    if (availableSlots.length > 0) {
      setSelectedTime(availableSlots[0]);
      setPreferredOption('earliest');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
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
          בחר תאריך ושעה
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Service Info */}
          <View className="mb-6 bg-zinc-900/50 rounded-xl p-4">
            <Text className={`text-zinc-400 text-sm mb-1 ${tw.textStart}`}>
              שירות נבחר
            </Text>
            <Text
              className={`text-white text-lg font-semibold ${tw.textStart}`}
            >
              {serviceName}
            </Text>
          </View>

          {/* Date Selection */}
          <View className="mb-6">
            <Text
              className={`text-white text-sm font-medium mb-3 ${tw.textStart}`}
            >
              בחר תאריך
            </Text>
            <Pressable
              accessible={true}
              accessibilityRole="button"
              onPress={() => setShowDatePicker(true)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <Calendar size={20} color="#71717a" />
                <Text className="text-white text-base">
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(event, date) => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false);
                  }
                  if (date) {
                    setSelectedDate(date);
                    setSelectedTime(null); // איפוס זמן כשמשנים תאריך
                  }
                  if (Platform.OS === 'ios' && event.type === 'dismissed') {
                    setShowDatePicker(false);
                  }
                }}
              />
            )}
          </View>

          {/* Quick Options */}
          {availableSlots.length > 0 && (
            <View className="mb-6">
              <Text
                className={`text-white text-sm font-medium mb-3 ${tw.textStart}`}
              >
                אפשרויות מהירות
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="התור הקרוב ביותר"
                  onPress={handleEarliestSlot}
                  className={`flex-1 bg-zinc-900 border rounded-xl py-3 items-center ${
                    preferredOption === 'earliest'
                      ? 'border-sky-400 bg-sky-500/20'
                      : 'border-zinc-800'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      preferredOption === 'earliest'
                        ? 'text-sky-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    התור הקרוב ביותר
                  </Text>
                  {preferredOption === 'earliest' && selectedTime && (
                    <Text className="text-sky-400 text-xs mt-1">
                      {selectedTime}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Time Selection */}
          <View className="mb-8">
            <Text
              className={`text-white text-sm font-medium mb-3 ${tw.textStart}`}
            >
              בחר שעה
            </Text>
            {availableSlots.length === 0 ? (
              <View className="bg-zinc-900/50 rounded-xl p-6 items-center">
                <Text className="text-zinc-400 text-base">
                  אין זמנים פנויים בתאריך זה
                </Text>
                <Text className="text-zinc-500 text-sm mt-2">
                  נסה לבחור תאריך אחר
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {availableSlots.map((slot) => (
                  <Pressable
                    key={slot}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`בחר שעה ${slot}`}
                    onPress={() => {
                      setSelectedTime(slot);
                      setPreferredOption(null);
                    }}
                    className={`px-4 py-3 rounded-xl border ${
                      selectedTime === slot
                        ? 'bg-sky-400 border-sky-400'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Clock
                        size={16}
                        color={selectedTime === slot ? '#ffffff' : '#71717a'}
                      />
                      <Text
                        className={`text-sm font-medium ${
                          selectedTime === slot ? 'text-white' : 'text-zinc-400'
                        }`}
                      >
                        {slot}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Continue Button */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="המשך"
            onPress={handleContinue}
            disabled={!selectedTime}
            className={`bg-sky-400 rounded-xl py-4 items-center min-h-[56px] ${
              !selectedTime ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white text-lg font-bold">המשך</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
