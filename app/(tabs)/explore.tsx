import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_BUSINESSES } from '@/data/mockData';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Business } from '@/contexts/BookingContext';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const tint = useThemeColor({}, 'tint');

  const filtered = MOCK_BUSINESSES.filter(
    (b) =>
      b.name.includes(search) ||
      b.category.includes(search) ||
      b.address.includes(search)
  );

  const renderItem = ({ item }: { item: Business }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/business/${item.id}`)}>
      <View style={[styles.iconWrap, { backgroundColor: tint + '25' }]}>
        <Text style={styles.iconEmoji}>🏪</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
      </View>
      <IconSymbol name="chevron.right" size={20} color="#666" />
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>חיפוש עסקים</Text>
        <View style={styles.searchBox}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="חפש לפי שם, קטגוריה או מיקום..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>לא נמצאו תוצאות</Text>
          </View>
        }
      />
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
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15151f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  cardCategory: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 2,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
