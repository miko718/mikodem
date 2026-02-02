import { useQuery } from 'convex/react';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

export default function MapScreen() {
  const business = useQuery(api.businesses.getMyBusiness);
  const appointments = useQuery(
    api.appointments.getByBusiness,
    business ? { businessId: business._id } : 'skip'
  );

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // בקשת הרשאות מיקום
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'הרשאה נדרשת',
            'האפליקציה זקוקה לגישה למיקום כדי להציג את המפה'
          );
          setLocationPermission(false);
          setLoading(false);
          return;
        }

        setLocationPermission(true);

        // קבלת מיקום נוכחי
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('שגיאה', 'לא ניתן לקבל את המיקום הנוכחי');
      } finally {
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text className="text-zinc-400 text-sm mt-4">טוען מפה...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!locationPermission) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white text-xl font-bold mb-4 text-center">
            הרשאה נדרשת
          </Text>
          <Text className="text-zinc-400 text-base text-center">
            אנא הפעל הרשאות מיקום בהגדרות המכשיר
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // קביעת אזור המפה
  const businessLocation = business?.businessLocation;
  const mapRegion = businessLocation
    ? {
        latitude: businessLocation.latitude,
        longitude: businessLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : {
          latitude: 31.7683, // תל אביב
          longitude: 35.2137,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

  // סינון פגישות עם מיקום
  const appointmentsWithLocation =
    appointments?.filter(
      (apt: (typeof appointments)[0]) => apt.clientLocation
    ) || [];

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      <View className="flex-1">
        {/* כותרת */}
        <View className="px-6 pt-4 pb-2 bg-[#0a0a0a]">
          <Text
            className={`text-2xl font-bold text-white mb-2 ${tw.textStart}`}
          >
            מפה
          </Text>
          <Text className={`text-zinc-400 text-sm ${tw.textStart}`}>
            {businessLocation
              ? 'מיקום העסק והלקוחות'
              : 'הגדר מיקום עסק בהגדרות'}
          </Text>
        </View>

        {/* מפה */}
        <MapView
          style={{ flex: 1 }}
          initialRegion={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          className="flex-1"
        >
          {/* סמן מיקום העסק */}
          {businessLocation && (
            <Marker
              coordinate={{
                latitude: businessLocation.latitude,
                longitude: businessLocation.longitude,
              }}
              title={business.businessName || 'העסק שלי'}
              description={businessLocation.address || 'מיקום העסק'}
              pinColor="#0ea5e9"
            />
          )}

          {/* סמני מיקום לקוחות */}
          {appointmentsWithLocation.map(
            (appointment: (typeof appointmentsWithLocation)[0]) => (
              <Marker
                key={appointment._id}
                coordinate={{
                  latitude: appointment.clientLocation!.latitude,
                  longitude: appointment.clientLocation!.longitude,
                }}
                title={appointment.clientName}
                description={`${appointment.title} - ${appointment.distanceFromBusiness?.toFixed(1) || '?'} ק"מ`}
                pinColor="#10b981"
              />
            )
          )}
        </MapView>

        {/* לוח מידע בתחתית */}
        <View className="bg-zinc-900/95 border-t border-zinc-800 px-6 py-4">
          <View className="flex-row items-center gap-4 mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-4 h-4 rounded-full bg-sky-400" />
              <Text className="text-white text-sm">עסק</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-4 h-4 rounded-full bg-green-400" />
              <Text className="text-white text-sm">לקוחות</Text>
            </View>
          </View>

          {appointmentsWithLocation.length > 0 && (
            <Text className="text-zinc-400 text-xs">
              {appointmentsWithLocation.length} לקוחות עם מיקום שותף
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
