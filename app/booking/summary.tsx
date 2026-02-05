import { View, Text, StyleSheet, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooking } from '@/contexts/BookingContext';
import { useThemeColor } from '@/hooks/use-theme-color';

function formatDate(d: Date) {
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function SummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    selectedBusiness,
    selectedService,
    selectedDate,
    selectedTime,
    confirmBooking,
  } = useBooking();
  const tint = useThemeColor({}, 'tint');

  if (!selectedBusiness || !selectedService || !selectedDate || !selectedTime) {
    router.replace('/(tabs)/explore');
    return null;
  }

  const handleConfirm = () => {
    const apt = confirmBooking();
    if (apt) {
      router.replace('/success');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="arrow.backward" size={24} color="#111" />
        <Text style={styles.backText}>חזרה</Text>
      </Pressable>
      <View style={styles.header}>
        <Text style={styles.title}>אישור התור</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.businessName}>{selectedBusiness.name}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>שירות:</Text>
          <Text style={styles.value}>{selectedService.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>תאריך:</Text>
          <Text style={styles.value}>{formatDate(selectedDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>שעה:</Text>
          <Text style={styles.value}>{selectedTime}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>משך:</Text>
          <Text style={styles.value}>{selectedService.duration} דקות</Text>
        </View>
        {selectedService.price > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>מחיר:</Text>
            <Text style={styles.value}>₪{selectedService.price}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.confirmBtn, { backgroundColor: tint }]} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>אשר תור</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>ביטול</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 16,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#111',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  actions: {
    gap: 12,
  },
  confirmBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#666',
  },
});
