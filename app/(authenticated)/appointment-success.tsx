import { useQuery } from 'convex/react';
import * as Calendar from 'expo-calendar';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Copy,
  Share2,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

export default function AppointmentSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const appointment = useQuery(api.appointments.getById, {
    appointmentId: id as any,
  });

  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!appointment?.shareLocationLink) return;

    await Clipboard.setStringAsync(appointment.shareLocationLink);
    setCopied(true);
    Alert.alert('הצלחה', 'הקישור הועתק ללוח');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!appointment?.shareLocationLink) return;

    // TODO: שימוש ב-expo-sharing לשליחה
    Alert.alert('שיתוף', 'פונקציית השיתוף תתווסף בקרוב');
  };

  const handleAddToCalendar = async () => {
    if (!appointment) return;

    try {
      // בקשת הרשאות
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'הרשאה נדרשת',
          'האפליקציה זקוקה לגישה ליומן כדי להוסיף את התור'
        );
        return;
      }

      // קבלת יומנים זמינים
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      if (calendars.length === 0) {
        Alert.alert('שגיאה', 'לא נמצאו יומנים במכשיר');
        return;
      }

      // בחירת היומן הראשון (או יומן ברירת מחדל)
      const defaultCalendar =
        calendars.find((cal) => cal.allowsModifications) || calendars[0];

      // יצירת אירוע
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: appointment.title,
        startDate: new Date(appointment.startTime),
        endDate: new Date(appointment.endTime),
        notes: appointment.description || `לקוח: ${appointment.clientName}`,
        location: appointment.shareLocationLink || undefined,
      });

      Alert.alert('הצלחה', 'התור נוסף ליומן בהצלחה!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      // Fallback: פתיחת קישור ל-Google Calendar
      const startDate = new Date(appointment.startTime);
      const endDate = new Date(appointment.endTime);
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        appointment.title
      )}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}&details=${encodeURIComponent(
        appointment.description || `לקוח: ${appointment.clientName}`
      )}`;

      Linking.openURL(googleCalendarUrl).catch(() => {
        Alert.alert('שגיאה', 'לא ניתן להוסיף ליומן. נסה שוב מאוחר יותר.');
      });
    }
  };

  const formatDateTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 justify-center px-6"
      >
        <View className="items-center">
          {/* Success Icon */}
          <View className="mb-8">
            <View className="w-32 h-32 rounded-full bg-sky-500/20 items-center justify-center border-4 border-sky-400">
              <CheckCircle size={80} color="#0ea5e9" />
            </View>
          </View>

          {/* Title */}
          <Text
            className={`text-3xl font-bold text-white mb-6 text-center ${tw.textStart}`}
          >
            התור נקבע בהצלחה!
          </Text>

          {/* Summary */}
          {appointment && (
            <View className="w-full max-w-md bg-zinc-900/50 rounded-xl p-6 mb-8">
              <View className="mb-4">
                <Text className={`text-zinc-400 text-sm mb-1 ${tw.textStart}`}>
                  כותרת
                </Text>
                <Text
                  className={`text-white text-lg font-semibold ${tw.textStart}`}
                >
                  {appointment.title}
                </Text>
              </View>

              <View className="mb-4">
                <Text className={`text-zinc-400 text-sm mb-1 ${tw.textStart}`}>
                  לקוח
                </Text>
                <Text className={`text-white text-base ${tw.textStart}`}>
                  {appointment.clientName}
                </Text>
              </View>

              <View className="mb-4">
                <Text className={`text-zinc-400 text-sm mb-1 ${tw.textStart}`}>
                  זמן
                </Text>
                <Text className={`text-white text-base ${tw.textStart}`}>
                  {formatDateTime(appointment.startTime)} -{' '}
                  {formatDateTime(appointment.endTime)}
                </Text>
              </View>

              {/* Share Location Link */}
              {appointment.shareLocationLink && (
                <View className="mt-4 pt-4 border-t border-zinc-800">
                  <Text
                    className={`text-zinc-400 text-sm mb-3 ${tw.textStart}`}
                  >
                    קישור לשיתוף מיקום עם הלקוח:
                  </Text>
                  <View className="bg-zinc-800 rounded-lg p-3 mb-3">
                    <Text
                      className={`text-sky-400 text-xs ${tw.textStart}`}
                      numberOfLines={2}
                    >
                      {appointment.shareLocationLink}
                    </Text>
                  </View>
                  <View className="flex-row gap-3">
                    <Pressable
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="העתק קישור"
                      onPress={handleCopyLink}
                      className="flex-1 bg-sky-500/20 border border-sky-500/50 rounded-lg py-3 items-center"
                    >
                      <View className="flex-row items-center gap-2">
                        <Copy size={18} color="#0ea5e9" />
                        <Text className="text-sky-400 text-sm font-medium">
                          {copied ? 'הועתק!' : 'העתק'}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="שתף קישור"
                      onPress={handleShare}
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg py-3 items-center"
                    >
                      <View className="flex-row items-center gap-2">
                        <Share2 size={18} color="#71717a" />
                        <Text className="text-zinc-400 text-sm font-medium">
                          שתף
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="w-full max-w-md gap-3">
            {/* Add to Calendar Button */}
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="הוסף ליומן"
              onPress={handleAddToCalendar}
              className="bg-green-500/20 border border-green-500/50 rounded-xl py-4 items-center min-h-[56px]"
            >
              <View className="flex-row items-center gap-2">
                <CalendarIcon size={20} color="#10b981" />
                <Text className="text-green-400 text-lg font-bold">
                  הוסף ליומן
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="חזור למסך הראשי"
              onPress={() => router.replace('/(authenticated)')}
              className="bg-sky-400 rounded-xl py-4 items-center min-h-[56px]"
            >
              <Text className="text-white text-lg font-bold">
                חזור למסך הראשי
              </Text>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="צור תור נוסף"
              onPress={() => router.push('/(authenticated)/select-service')}
              className="bg-zinc-800 border border-zinc-700 rounded-xl py-4 items-center min-h-[56px]"
            >
              <Text className="text-white text-lg font-bold">צור תור נוסף</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
