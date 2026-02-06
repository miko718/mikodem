import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const tint = useThemeColor({}, 'tint');

  const handleGoogleLogin = () => {
    login();
    router.replace('/(tabs)');
  };

  const handlePhoneLogin = () => {
    login();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>ברוך הבא ל-Mikodem</Text>
        <Text style={styles.subtitle}>התחבר כדי לקבוע תורים</Text>
      </View>

      <View style={styles.buttons}>
        <Pressable style={[styles.button, styles.primaryButton, { backgroundColor: tint }]} onPress={handleGoogleLogin}>
          <IconSymbol name="person.circle.fill" size={24} color="#fff" />
          <Text style={styles.primaryButtonText}>המשך עם Google</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.secondaryButton]} onPress={handlePhoneLogin}>
          <IconSymbol name="phone.fill" size={24} color={tint} />
          <Text style={[styles.secondaryButtonText, { color: tint }]}>המשך עם מספר טלפון</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>לחיצה על כפתור תתחבר במצב הדמיה</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 80,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  buttons: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 12,
    color: '#666',
  },
});
