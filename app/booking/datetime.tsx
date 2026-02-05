import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooking } from '@/contexts/BookingContext';
import { useThemeColor } from '@/hooks/use-theme-color';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const getNextDays = (count: number) => {
  const days: { date: Date; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      label: d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return days;
};

export default function DateTimeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedBusiness, selectedService, selectDate, selectTime, selectedDate, selectedTime } = useBooking();
  const tint = useThemeColor({}, 'tint');
  const [days] = useState(() => getNextDays(14));

  if (!selectedBusiness || !selectedService) {
    router.replace('/(tabs)/explore');
    return null;
  }

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      router.push('/booking/summary');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="arrow.backward" size={24} color="#111" />
        <Text style={styles.backText}>חזרה</Text>
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.title}>בחר תאריך ושעה</Text>
        <Text style={styles.subtitle}>{selectedService.name} • {selectedBusiness.name}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionLabel}>תאריך</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {days.map((day) => (
            <Pressable
              key={day.date.toISOString()}
              style={[
                styles.dayChip,
                selectedDate?.toDateString() === day.date.toDateString() && { backgroundColor: tint },
              ]}
              onPress={() => selectDate(day.date)}>
              <Text
                style={[
                  styles.dayLabel,
                  selectedDate?.toDateString() === day.date.toDateString() && styles.dayLabelSelected,
                ]}>
                {day.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>שעה</Text>
        <View style={styles.timesGrid}>
          {TIME_SLOTS.map((time) => (
            <Pressable
              key={time}
              style={[
                styles.timeChip,
                selectedTime === time && { backgroundColor: tint },
              ]}
              onPress={() => selectTime(time)}>
              <Text
                style={[
                  styles.timeLabel,
                  selectedTime === time && styles.timeLabelSelected,
                ]}>
                {time}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        style={[
          styles.nextBtn,
          { backgroundColor: selectedDate && selectedTime ? tint : '#ccc', bottom: insets.bottom + 20 },
        ]}
        onPress={handleNext}
        disabled={!selectedDate || !selectedTime}>
        <Text style={styles.nextBtnText}>המשך</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 16,
    backgroundColor: '#fff',
  },
  backText: {
    fontSize: 16,
    color: '#111',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    margin: 16,
    marginBottom: 8,
  },
  daysScroll: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  dayChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  dayLabel: {
    fontSize: 15,
    color: '#333',
  },
  dayLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  timeChip: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 15,
    color: '#333',
  },
  timeLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  nextBtn: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
