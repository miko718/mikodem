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
        <Text style={styles.errorText}>עסק לא נמצא</Text>
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
        <IconSymbol name="arrow.backward" size={24} color="#fff" />
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
    backgroundColor: '#0a0a0f',
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
  },
  errorText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backText: {
    fontSize: 16,
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#a0a0a0',
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  address: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    backgroundColor: '#15151f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  serviceInfo: {},
  serviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  serviceMeta: {
    fontSize: 14,
    color: '#a0a0a0',
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
