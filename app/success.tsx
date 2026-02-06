import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tint = useThemeColor({}, 'tint');
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.iconWrap, { backgroundColor: tint + '25' }, animatedStyle]}>
        <IconSymbol name="checkmark.circle.fill" size={80} color={tint} />
      </Animated.View>
      <Text style={styles.title}>התור נקבע בהצלחה!</Text>
      <Text style={styles.subtitle}>קיבלת תזכורת לפני התור</Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: tint }]}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryBtnText}>חזרה לדף הבית</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/explore')}>
          <Text style={[styles.secondaryBtnText, { color: tint }]}>קבע תור נוסף</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 48,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
