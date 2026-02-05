import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_BUSINESSES } from '@/data/mockData';
import { useBooking } from '@/contexts/BookingContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectBusiness, selectService } = useBooking();
  const tint = useThemeColor({}, 'tint');
  const business = MOCK_BUSINESSES.find((b) => b.id === id);

  if (!business) {
    return (
      <View style={styles.error}>
        <Text>עסק לא נמצא</Text>
      </View>
    );
  }

  const handleBook = (serviceId: string) => {
    const service = business.services.find((s) => s.id === serviceId);
    if (service) {
      selectBusiness(business);
      selectService(service);
      router.push('/booking/datetime');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <IconSymbol name="arrow.backward" size={24} color="#111" />
        <Text style={styles.backText}>חזרה</Text>
      </Pressable>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.name}>{business.name}</Text>
          <Text style={styles.category}>{business.category}</Text>
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: tint }]}
              onPress={() => Linking.openURL('https://maps.google.com')}>
              <IconSymbol name="mappin.circle.fill" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>ניווט</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => Linking.openURL('tel:0501234567')}>
              <IconSymbol name="phone.fill" size={20} color={tint} />
              <Text style={[styles.actionBtnText, { color: tint }]}>התקשר</Text>
            </Pressable>
          </View>
          <Text style={styles.address}>{business.address}</Text>
        </View>

        <Text style={styles.sectionTitle}>שירותים</Text>
        {business.services.map((service) => (
          <Pressable
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleBook(service.id)}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceMeta}>
                {service.duration} דקות • {service.price > 0 ? `₪${service.price}` : 'חינם'}
              </Text>
            </View>
            <View style={[styles.bookBtn, { backgroundColor: tint }]}>
              <Text style={styles.bookBtnText}>קבע</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  scroll: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#eee',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  address: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    margin: 16,
    marginBottom: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  serviceInfo: {},
  serviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  serviceMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bookBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
