import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image } from 'expo-image';

function StatCard({
  label,
  value,
  icon,
  delay = 0,
  tint,
}: {
  label: string;
  value: string | number;
  icon: string;
  delay?: number;
  tint: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[styles.statCard, { borderColor: tint + '30' }]}>
      <IconSymbol name={icon as any} size={24} color={tint} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function ActionItem({
  icon,
  label,
  onPress,
  destructive,
  delay,
  tint,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  delay?: number;
  tint: string;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(delay ?? 0).springify()} style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.actionItem,
          destructive && styles.actionItemDestructive,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}>
        <IconSymbol
          name={icon as any}
          size={22}
          color={destructive ? '#e74c3c' : tint}
        />
        <Text style={[styles.actionLabel, destructive && styles.actionLabelDestructive]}>
          {label}
        </Text>
        {!destructive && <IconSymbol name="chevron.right" size={20} color="#666" />}
      </Pressable>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const tint = useThemeColor({}, 'tint');

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleLongPressAvatar = () => {
    Alert.alert('עריכת תמונה', 'בגרסה הבאה תוכל לערוך את תמונת הפרופיל');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => Alert.alert('הגדרות', 'מסך הגדרות ייפתח בגרסה הבאה')}>
          <IconSymbol name="gearshape.fill" size={24} color="#a0a0a0" />
        </Pressable>
        <Text style={styles.headerTitle}>פרופיל</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.hero}>
          <Pressable onLongPress={handleLongPressAvatar} style={styles.avatarWrapper}>
            <View style={[styles.avatarGlow, { shadowColor: tint }]}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <IconSymbol name="person.fill" size={48} color={tint} />
                </View>
              )}
            </View>
          </Pressable>
          <Text style={styles.displayName}>{user?.displayName ?? 'משתמש'}</Text>
          {user?.rank && (
            <View style={[styles.rankBadge, { backgroundColor: tint + '25', borderColor: tint + '50' }]}>
              <Text style={[styles.rankText, { color: tint }]}>{user.rank}</Text>
            </View>
          )}
          {user?.stats && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { backgroundColor: tint, width: `${(user.stats.xp % 1000) / 10}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                רמה {user.stats.level} • {(user.stats.xp % 1000) / 10}% לרמה הבאה
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Stats Grid */}
        {user?.stats && (
          <View style={styles.statsGrid}>
            <StatCard
              label="רצף ימים"
              value={user.stats.streakDays}
              icon="clock.fill"
              delay={200}
              tint={tint}
            />
            <StatCard
              label="תורים הושלמו"
              value={user.stats.completedAppointments}
              icon="checkmark.circle.fill"
              delay={250}
              tint={tint}
            />
            <StatCard
              label="רמה"
              value={user.stats.level}
              icon="calendar.today"
              delay={300}
              tint={tint}
            />
            <StatCard
              label="נקודות XP"
              value={user.stats.xp}
              icon="person.circle.fill"
              delay={350}
              tint={tint}
            />
          </View>
        )}

        {/* Action List */}
        <View style={styles.actionList}>
          <ActionItem
            icon="square.and.pencil"
            label="ערוך פרטים"
            onPress={() => Alert.alert('עריכה', 'מסך עריכת פרטים ייפתח בגרסה הבאה')}
            delay={400}
            tint={tint}
          />
          <ActionItem
            icon="history"
            label="היסטוריית פעולות"
            onPress={() => router.push('/(tabs)')}
            delay={450}
            tint={tint}
          />
          <ActionItem
            icon="bell.fill"
            label="התראות"
            onPress={() => Alert.alert('התראות', 'ניהול התראות ייפתח בגרסה הבאה')}
            delay={500}
            tint={tint}
          />
          <ActionItem
            icon="person.fill"
            label="התנתק"
            onPress={handleLogout}
            destructive
            delay={550}
            tint={tint}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsBtn: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  avatarGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  rankBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressSection: {
    width: '100%',
    maxWidth: 280,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
  },
  actionList: {
    backgroundColor: '#15151f',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  actionItemDestructive: {
    borderBottomWidth: 0,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  actionLabelDestructive: {
    color: '#e74c3c',
  },
});
