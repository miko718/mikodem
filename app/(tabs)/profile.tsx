import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const tint = useThemeColor({}, 'tint');

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'התנתק', style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>הפרופיל שלי</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={48} color="#999" />
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'משתמש'}</Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}

        <View style={styles.menu}>
          <Pressable style={styles.menuItem}>
            <IconSymbol name="person.circle.fill" size={24} color={tint} />
            <Text style={styles.menuText}>ערוך פרטים</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <IconSymbol name="clock.fill" size={24} color={tint} />
            <Text style={styles.menuText}>התראות</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.logoutButton, { borderColor: '#e74c3c' }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>התנתק</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  menu: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
});
