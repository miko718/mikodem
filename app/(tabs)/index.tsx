import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooking } from '@/contexts/BookingContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

function formatDate(d: Date) {
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointments } = useBooking();
  const tint = useThemeColor({}, 'tint');
  const upcoming = appointments.filter((a) => a.status === 'scheduled' && new Date(a.startTime) >= new Date())[0];
  const past = appointments.filter((a) => a.status === 'completed' || new Date(a.startTime) < new Date());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>התורים שלי</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
        {upcoming ? (
          <View style={[styles.card, styles.upcomingCard, { borderColor: tint + '50' }]}>
            <Text style={styles.cardLabel}>התור הקרוב</Text>
            <Text style={styles.businessName}>{upcoming.businessName}</Text>
            <Text style={styles.serviceName}>{upcoming.serviceName}</Text>
            <View style={styles.row}>
              <IconSymbol name="calendar.today" size={18} color={tint} />
              <Text style={styles.detail}>{formatDate(upcoming.startTime)}</Text>
            </View>
            <View style={styles.row}>
              <IconSymbol name="clock.fill" size={18} color={tint} />
              <Text style={styles.detail}>{formatTime(upcoming.startTime)}</Text>
            </View>
            <Pressable
              style={[styles.navButton, { backgroundColor: tint }]}
              onPress={() => Linking.openURL('https://maps.google.com')}>
              <IconSymbol name="mappin.circle.fill" size={20} color="#fff" />
              <Text style={styles.navButtonText}>ניווט</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>אין תורים קרובים</Text>
            <Text style={styles.emptySubtitle}>קבע תור חדש בלחיצה על הכפתור למטה</Text>
          </View>
        )}

        {past.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>היסטוריה</Text>
            {past.slice(0, 5).map((apt) => (
              <Pressable
                key={apt.id}
                style={styles.historyCard}
                onPress={() => router.push('/(tabs)/explore')}>
                <View>
                  <Text style={styles.historyBusiness}>{apt.businessName}</Text>
                  <Text style={styles.historyService}>{apt.serviceName} • {formatDate(apt.startTime)}</Text>
                </View>
                <Text style={[styles.rebookText, { color: tint }]}>קבע שוב</Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <Pressable
        style={[styles.fab, { backgroundColor: tint, bottom: insets.bottom + 90 }]}
        onPress={() => router.push('/(tabs)/explore')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 20,
    backgroundColor: '#15151f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  upcomingCard: {},
  cardLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detail: {
    fontSize: 15,
    color: '#a0a0a0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyCard: {
    margin: 16,
    padding: 40,
    backgroundColor: '#15151f',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#a0a0a0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#15151f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  historyBusiness: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  historyService: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 4,
  },
  rebookText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    lineHeight: 36,
  },
});
