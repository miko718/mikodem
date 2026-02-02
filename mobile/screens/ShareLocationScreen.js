import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import API_BASE_URL from '../config/API';

export default function ShareLocationScreen() {
  const route = useRoute();
  const { eventId } = route.params || {};
  const [status, setStatus] = useState('ready'); // ready | sharing | done | error
  const [error, setError] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(false);

  const shareLocation = useCallback(
    async (isAutoUpdate = false) => {
      if (!isAutoUpdate) {
        setStatus('sharing');
      }
      setError('');

      try {
        const { status: permissionStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (permissionStatus !== 'granted') {
          throw new Error('הדפדפן לא תומך במיקום');
        }

        const location = await Location.getCurrentPositionAsync({
          enableHighAccuracy: true,
        });

        const res = await fetch(`${API_BASE_URL}/locations/share/${eventId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          }),
        });

        if (!res.ok) throw new Error('שגיאה בשמירה');

        if (!isAutoUpdate) {
          setStatus('done');
          setAutoUpdate(true);
        }
      } catch (e) {
        if (!isAutoUpdate) {
          setError(e.message || 'שגיאה');
          setStatus('error');
        }
      }
    },
    [eventId]
  );

  // עדכון אוטומטי כל 30 שניות אחרי שמיקום נשלח
  useEffect(() => {
    if (!autoUpdate) return;
    const interval = setInterval(() => {
      shareLocation(true);
    }, 30000); // 30 שניות
    return () => clearInterval(interval);
  }, [autoUpdate, shareLocation]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>mikodem</Text>
        {status === 'ready' && (
          <>
            <Text style={styles.title}>שיתוף מיקום לפגישה</Text>
            <Text style={styles.description}>
              בעל העסק מבקש לדעת את המיקום שלך כדי לאמוד הגעה
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => shareLocation(false)}
            >
              <Text style={styles.buttonText}>שתף את המיקום שלי</Text>
            </TouchableOpacity>
          </>
        )}
        {status === 'sharing' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.statusText}>מקבלים מיקום...</Text>
          </View>
        )}
        {status === 'done' && (
          <>
            <Text style={styles.successText}>המיקום נשלח בהצלחה</Text>
            <Text style={styles.hintText}>
              המיקום מתעדכן אוטומטית כל 30 שניות
            </Text>
          </>
        )}
        {status === 'error' && (
          <>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStatus('ready')}
            >
              <Text style={styles.buttonText}>נסה שוב</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  successText: {
    fontSize: 18,
    color: '#34A853',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EA4335',
    marginBottom: 16,
    textAlign: 'center',
  },
});
