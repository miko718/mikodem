import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Location from 'expo-location';
import CustomMapView from '../components/MapView';
import API_BASE_URL from '../config/API';

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState({});
  const [businessLocation, setBusinessLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessSet, setBusinessSet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBusinessLocation = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/locations/business`);
      if (res.ok) {
        const data = await res.json();
        if (data?.lat) {
          setBusinessLocation(data);
          setBusinessSet(true);
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to load business location:', error);
    }
    return null;
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/calendar/events`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data);
      if (data?.length) {
        const ids = data.map((e) => e.id).join(',');
        const [locRes, lateRes] = await Promise.all([
          fetch(`${API_BASE_URL}/locations/for-events?ids=${ids}`),
          fetch(`${API_BASE_URL}/locations/late-responses?ids=${ids}`),
        ]);
        if (locRes.ok) {
          const locs = await locRes.json();
          setLocations(locs);
        }
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadBusinessLocation(), loadEvents()]);
      setLoading(false);
    })();
  }, [loadBusinessLocation, loadEvents]);

  useEffect(() => {
    if (!events.some((e) => e.inLocationWindow)) return;
    const interval = setInterval(loadEvents, 30000);
    return () => clearInterval(interval);
  }, [events, loadEvents]);

  const setMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('הרשאה נדרשת', 'נדרשת הרשאה למיקום כדי להגדיר את מיקום העסק');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const res = await fetch(`${API_BASE_URL}/locations/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBusinessLocation(data);
        setBusinessSet(true);
        Alert.alert('הצלחה', 'מיקום העסק נשמר בהצלחה');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לקבל את המיקום');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBusinessLocation(), loadEvents()]);
    setRefreshing(false);
  };

  const eventsWithDistances = events.map((e) => {
    const loc = locations[e.id];
    let distanceKm = null;
    if (businessLocation && loc) {
      distanceKm = parseFloat(
        calcDistance(
          businessLocation.lat,
          businessLocation.lng,
          loc.lat,
          loc.lng
        ).toFixed(1)
      );
    }
    const shareUrl = `mikodem://share/${e.id}`;
    return { ...e, location: loc, distanceKm, shareUrl };
  });

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>טוען פגישות...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>mikodem</Text>
        <View style={styles.headerActions}>
          {!businessSet && (
            <TouchableOpacity
              style={styles.setLocationButton}
              onPress={setMyLocation}
            >
              <Text style={styles.setLocationText}>הגדר מיקום</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>יציאה</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <ScrollView
          style={styles.meetingsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>פגישות קרובות</Text>
          {eventsWithDistances.map((event) => (
            <View
              key={event.id}
              style={[
                styles.meetingCard,
                event.inLocationWindow && styles.inWindowCard,
              ]}
            >
              <Text style={styles.meetingTime}>{formatTime(event.start)}</Text>
              <Text style={styles.meetingSummary}>{event.summary}</Text>
              {event.location ? (
                <Text style={styles.locationText}>
                  מיקום: מעודכן
                  {event.distanceKm != null && (
                    <Text style={styles.distanceText}>
                      {' '}
                      • {event.distanceKm} ק״מ
                    </Text>
                  )}
                </Text>
              ) : event.inLocationWindow ? (
                <Text style={styles.noLocationText}>
                  הלקוח עדיין לא שיתף מיקום
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
        <View style={styles.mapContainer}>
          <CustomMapView events={eventsWithDistances} businessLocation={businessLocation} />
        </View>
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
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  setLocationButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  setLocationText: {
    color: '#fff',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#EA4335',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  meetingsList: {
    width: '40%',
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  meetingCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inWindowCard: {
    borderColor: '#4285F4',
    borderWidth: 2,
  },
  meetingTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meetingSummary: {
    fontSize: 14,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  distanceText: {
    fontWeight: '600',
    color: '#4285F4',
  },
  noLocationText: {
    fontSize: 12,
    color: '#EA4335',
  },
  mapContainer: {
    flex: 1,
  },
});
