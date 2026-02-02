import { useMutation, useQuery } from 'convex/react';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

export default function ShareLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const appointment = useQuery(api.appointments.getById, {
    appointmentId: id as any,
  });
  const updateLocation = useMutation(api.appointments.updateClientLocation);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  // קבלת מיקום נוכחי
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'הרשאה נדרשת',
            'האפליקציה זקוקה לגישה למיקום כדי לשתף את המיקום'
          );
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('שגיאה', 'לא ניתן לקבל את המיקום הנוכחי');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const handleShareLocation = async () => {
    if (!location || !appointment) return;

    setSharing(true);
    try {
      await updateLocation({
        appointmentId: appointment._id,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      });

      setShared(true);
      Alert.alert('הצלחה', 'המיקום שותף בהצלחה!', [
        {
          text: 'אישור',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error sharing location:', error);
      Alert.alert('שגיאה', 'לא ניתן לשתף את המיקום. נסה שוב.');
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text className="text-zinc-400 text-base mt-4">טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white text-xl font-bold mb-4 text-center">
            פגישה לא נמצאה
          </Text>
          <Text className="text-zinc-400 text-base text-center">
            הקישור לא תקין או שהפגישה לא קיימת
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      <View className="flex-1 px-6 pt-8">
        {/* כותרת */}
        <View className="mb-8">
          <Text
            className={`text-3xl font-bold text-white mb-2 ${tw.textStart}`}
          >
            שיתוף מיקום
          </Text>
          <Text className={`text-zinc-400 text-base ${tw.textStart}`}>
            שלום {appointment.clientName}!
          </Text>
        </View>

        {/* פרטי הפגישה */}
        <View className="bg-zinc-900/50 rounded-xl p-4 mb-6">
          <Text
            className={`text-white text-lg font-semibold mb-2 ${tw.textStart}`}
          >
            {appointment.title}
          </Text>
          <Text className={`text-zinc-400 text-sm ${tw.textStart}`}>
            {new Date(appointment.startTime).toLocaleDateString('he-IL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* הסבר */}
        <View className="mb-8">
          <Text className={`text-zinc-300 text-base mb-4 ${tw.textStart}`}>
            כדי לעזור לבעל העסק לתכנן את היום, אנא שתף את המיקום הנוכחי שלך.
            המידע ישמש רק לחישוב זמן הגעה משוער.
          </Text>
          {location && (
            <View className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
              <Text className={`text-sky-400 text-sm mb-2 ${tw.textStart}`}>
                מיקום מזוהה
              </Text>
              <Text className={`text-zinc-300 text-xs ${tw.textStart}`}>
                דיוק: {location.coords.accuracy?.toFixed(0) || '?'} מטרים
              </Text>
            </View>
          )}
        </View>

        {/* כפתור שיתוף */}
        {!shared && (
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="שתף מיקום"
            onPress={handleShareLocation}
            disabled={!location || sharing}
            className={`bg-sky-400 rounded-xl py-4 items-center min-h-[56px] ${
              !location || sharing ? 'opacity-50' : ''
            }`}
          >
            {sharing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-bold">שתף מיקום</Text>
            )}
          </Pressable>
        )}

        {shared && (
          <View className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
            <Text
              className={`text-green-400 text-base text-center ${tw.textStart}`}
            >
              ✓ המיקום שותף בהצלחה!
            </Text>
          </View>
        )}

        {/* פרטיות */}
        <View className="mt-auto pb-8">
          <Text className={`text-zinc-500 text-xs text-center ${tw.textStart}`}>
            המידע נשמר בצורה מאובטחת ומשמש רק למטרת ניהול התורים
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
