import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'זמן תור בקלות',
    subtitle: 'קבע תור בעסקים המועדפים עליך בלחיצה אחת',
  },
  {
    id: '2',
    title: 'מעקב הגעה חכם',
    subtitle: 'המערכת עוקבת אחרי המיקום שלך ומעדכנת את העסק',
  },
  {
    id: '3',
    title: 'מעולם לא פיספסת תור',
    subtitle: 'התראות אוטומטיות והחלפת תורים כשצריך',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const tint = useThemeColor({}, 'tint');

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number }[] }) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index);
  }).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>דלג</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconCircle, { backgroundColor: tint + '30' }]}>
              <Text style={styles.iconEmoji}>{item.id === '1' ? '📅' : item.id === '2' ? '📍' : '✅'}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && { backgroundColor: tint, width: 24 },
              ]}
            />
          ))}
        </View>
        <Pressable style={[styles.nextButton, { backgroundColor: tint }]} onPress={handleNext}>
          <Text style={styles.nextText}>{currentIndex === SLIDES.length - 1 ? 'התחל' : 'הבא'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
