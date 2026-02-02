import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Navigation, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

// פונקציה עזר למיפוי סטטוס לעברית
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    scheduled: 'מתוזמנת',
    location_shared: 'מיקום שותף',
    in_progress: 'בתהליך',
    completed: 'הושלמה',
    cancelled: 'בוטלה',
  };
  return statusMap[status] || status;
}

// פונקציה עזר למיפוי סטטוס לצבע
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    scheduled: 'bg-blue-500/20 text-blue-400',
    location_shared: 'bg-green-500/20 text-green-400',
    in_progress: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-gray-500/20 text-gray-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return colorMap[status] || 'bg-gray-500/20 text-gray-400';
}

// פונקציה עזר לפורמט תאריך
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// פונקציה עזר לחישוב זמן עד הפגישה
function getTimeUntil(startTime: number): string {
  const now = Date.now();
  const diff = startTime - now;
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 0) {
    return 'עבר';
  }
  if (minutes < 60) {
    return `בעוד ${minutes} דקות`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `בעוד ${hours} שעות`;
  }
  return `בעוד ${hours} שעות ו-${remainingMinutes} דקות`;
}

export default function HomePage() {
  const router = useRouter();
  const business = useQuery(api.businesses.getMyBusiness);
  const upcomingAppointments = useQuery(
    api.appointments.getUpcoming,
    business ? { businessId: business._id } : 'skip'
  );

  const [refreshing, setRefreshing] = useState(false);

  // בדיקת איחורים והצעות
  useEffect(() => {
    if (!upcomingAppointments || !business?.businessLocation) return;

    const now = Date.now();
    const DELAY_THRESHOLD = 10 * 60 * 1000; // 10 דקות במילישניות

    // בדיקה רק לפגישה הראשונה (כדי לא להציף בהודעות)
    const firstAppointment = upcomingAppointments[0];
    if (!firstAppointment) return;

    const checkDelay = async () => {
      const appointment = firstAppointment;
      if (!appointment.clientLocation || appointment.status === 'cancelled') {
        return;
      }

      const timeUntilAppointment = appointment.startTime - now;
      const estimatedArrival = appointment.estimatedArrivalTime
        ? appointment.estimatedArrivalTime * 60 * 1000
        : 0;

      // אם יש איחור צפוי מעל 10 דקות
      if (
        timeUntilAppointment > 0 &&
        timeUntilAppointment < estimatedArrival &&
        estimatedArrival - timeUntilAppointment > DELAY_THRESHOLD
      ) {
        // מציאת התור הבא
        const nextAppointment = upcomingAppointments.find(
          (apt: typeof appointment) =>
            apt.startTime > appointment.startTime && apt.status !== 'cancelled'
        );

        if (nextAppointment) {
          // בדיקה אם הלקוח הבא קרוב יותר
          if (
            nextAppointment.clientLocation &&
            business.businessLocation &&
            appointment.distanceFromBusiness &&
            nextAppointment.distanceFromBusiness
          ) {
            if (
              nextAppointment.distanceFromBusiness <
              appointment.distanceFromBusiness
            ) {
              // הלקוח הבא קרוב יותר - אפשר להציע להקדים
              Alert.alert(
                'הצעה להקדמת תור',
                `הלקוח ${nextAppointment.clientName} קרוב יותר. האם תרצה להציע לו להקדים את התור?`,
                [
                  {
                    text: 'לא',
                    style: 'cancel',
                  },
                  {
                    text: 'כן, הצע',
                    onPress: async () => {
                      // TODO: שליחת הודעה ללקוח הבא
                      // TODO: עדכון זמני התורים
                    },
                  },
                ]
              );
            }
          }

          // הצעה לדחות או להזיז את התור הנוכחי
          Alert.alert(
            'איחור צפוי',
            `הלקוח ${appointment.clientName} צפוי לאחר. מה תרצה לעשות?`,
            [
              {
                text: 'ביטול',
                style: 'cancel',
              },
              {
                text: 'לדחות את התור',
                onPress: async () => {
                  // TODO: חישוב זמן חדש
                },
              },
              {
                text: 'להזיז לתור הבא',
                onPress: async () => {
                  if (nextAppointment) {
                    // TODO: החלפת זמני התורים
                  }
                },
              },
            ]
          );
        } else {
          // אין תור הבא - רק אפשרות לדחות
          Alert.alert(
            'איחור צפוי',
            `הלקוח ${appointment.clientName} צפוי לאחר. האם תרצה לדחות את התור?`,
            [
              {
                text: 'לא',
                style: 'cancel',
              },
              {
                text: 'כן, דחה',
                onPress: async () => {
                  // TODO: חישוב זמן חדש
                },
              },
            ]
          );
        }
      }
    };

    checkDelay();
  }, [upcomingAppointments, business]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Convex ירענן אוטומטית
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!business) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text className="text-zinc-400 text-base mt-4">טוען...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-6 pb-12">
          {/* כותרת */}
          <View className="mb-6">
            <Text
              className={`text-3xl font-bold text-white mb-2 ${tw.textStart}`}
            >
              Mikodem
            </Text>
            <Text className={`text-zinc-400 text-base ${tw.textStart}`}>
              {business.businessName}
            </Text>
          </View>

          {/* CTA מרכזי - קביעת תור חדש */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="קביעת תור חדש"
            onPress={() => router.push('/(authenticated)/select-service')}
            className="bg-sky-400 rounded-xl p-6 mb-6 items-center shadow-lg"
            style={{
              shadowColor: '#0ea5e9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row items-center gap-3">
              <Calendar size={28} color="#ffffff" />
              <View>
                <Text className="text-white text-xl font-bold">
                  קביעת תור חדש
                </Text>
                <Text className="text-sky-100 text-sm">בחר שירות וקבע תור</Text>
              </View>
            </View>
          </Pressable>

          {/* כפתור למפה */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="פתח מפה"
            onPress={() => router.push('/(authenticated)/map')}
            className="bg-sky-500/20 border border-sky-500/50 rounded-xl p-4 mb-6 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <MapPin size={24} color="#0ea5e9" />
              <View>
                <Text className="text-white text-lg font-semibold">מפה</Text>
                <Text className="text-zinc-400 text-sm">
                  צפה במיקום העסק והלקוחות
                </Text>
              </View>
            </View>
            <Navigation size={20} color="#0ea5e9" />
          </Pressable>

          {/* רשימת פגישות קרובות */}
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-4">
              <Calendar size={20} color="#4fc3f7" />
              <Text className={`text-xl font-bold text-white ${tw.textStart}`}>
                פגישות קרובות
              </Text>
            </View>

            {!upcomingAppointments ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#4fc3f7" />
                <Text className="text-zinc-400 text-sm mt-2">
                  טוען פגישות...
                </Text>
              </View>
            ) : upcomingAppointments.length === 0 ? (
              <View className="bg-zinc-900/50 rounded-xl p-6 items-center">
                <Calendar size={48} color="#52525b" />
                <Text className="text-zinc-400 text-base mt-4 text-center">
                  אין פגישות קרובות
                </Text>
                <Text className="text-zinc-500 text-sm mt-2 text-center">
                  פגישות שיופיעו כאן יוצגו 30 דקות לפני הזמן
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {upcomingAppointments.map(
                  (appointment: (typeof upcomingAppointments)[0]) => (
                    <Pressable
                      key={appointment._id}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`פגישה עם ${appointment.clientName}`}
                      onPress={() =>
                        router.push({
                          pathname: '/(authenticated)/appointment/[id]',
                          params: { id: appointment._id },
                        })
                      }
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1">
                          <Text
                            className={`text-white text-lg font-semibold mb-1 ${tw.textStart}`}
                          >
                            {appointment.title}
                          </Text>
                          <View className="flex-row items-center gap-2 mb-1">
                            <User size={16} color="#71717a" />
                            <Text className="text-zinc-400 text-sm">
                              {appointment.clientName}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Clock size={16} color="#71717a" />
                            <Text className="text-zinc-400 text-sm">
                              {formatTime(appointment.startTime)} -{' '}
                              {formatTime(appointment.endTime)}
                            </Text>
                          </View>
                        </View>
                        <View
                          className={`px-3 py-1 rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          <Text className="text-xs font-medium">
                            {getStatusText(appointment.status)}
                          </Text>
                        </View>
                      </View>

                      {/* מיקום ומרחק */}
                      {appointment.clientLocation && (
                        <View className="mt-3 pt-3 border-t border-zinc-800">
                          <View className="flex-row items-center gap-2 mb-1">
                            <MapPin size={16} color="#4fc3f7" />
                            <Text className="text-sky-400 text-sm">
                              מיקום שותף
                            </Text>
                          </View>
                          {appointment.distanceFromBusiness !== undefined && (
                            <Text className="text-zinc-400 text-sm">
                              מרחק:{' '}
                              {appointment.distanceFromBusiness.toFixed(1)} ק"מ
                            </Text>
                          )}
                          {appointment.estimatedArrivalTime !== undefined && (
                            <Text className="text-zinc-400 text-sm">
                              זמן הגעה משוער: {appointment.estimatedArrivalTime}{' '}
                              דקות
                            </Text>
                          )}
                          <Text className="text-zinc-500 text-xs mt-1">
                            {getTimeUntil(appointment.startTime)}
                          </Text>
                        </View>
                      )}

                      {/* הודעה אם אין מיקום */}
                      {!appointment.clientLocation && (
                        <View className="mt-3 pt-3 border-t border-zinc-800">
                          <Text className="text-zinc-500 text-sm">
                            מיקום הלקוח עדיין לא שותף
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  )
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
