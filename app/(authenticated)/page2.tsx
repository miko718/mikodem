import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'; // רכיבי UI בסיסיים
import { SafeAreaView } from 'react-native-safe-area-context'; // רכיב לשמירה על אזור בטוח (Safe Area)
import { api } from '@/convex/_generated/api';
import { rtl, tw } from '@/lib/rtl'; // כלי עזר ל-RTL

// מסך פרופיל
export default function Page2() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const updateMyProfile = useMutation(api.users.updateMyProfile);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const displayName = useMemo((): string => {
    const emailName = user?.email?.split('@')[0];
    return user?.fullName || emailName || 'משתמש';
  }, [user?.email, user?.fullName]);

  const email = user?.email ?? 'לא זמין';

  const handleEditName = () => {
    setEditedName(user?.fullName || '');
    setIsEditModalVisible(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('שגיאה', 'אנא הזן שם תקין');
      return;
    }

    setIsSaving(true);
    try {
      await updateMyProfile({ fullName: editedName.trim() });
      setIsEditModalVisible(false);
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן את השם. אנא נסה שוב.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="max-w-3xl w-full mx-auto px-8 pb-12 pt-8">
          <Text
            className={`text-[#ededed] text-4xl font-bold mb-5 ${tw.textStart}`}
          >
            פרופיל
          </Text>

          <View className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
            <View className={`${tw.flexRow} items-center justify-between mb-3`}>
              <View className="w-12 h-12 rounded-full bg-sky-400 items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  {displayName.slice(0, 1)}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <Text
                  className={`text-white text-xl font-bold mb-1 ${tw.textStart}`}
                >
                  {displayName}
                </Text>
                <Text className={`text-zinc-400 text-sm ${tw.textStart}`}>
                  {email}
                </Text>
              </View>
            </View>

            <View className={`${tw.flexRow} items-center justify-between`}>
              <View className="px-3 py-1 rounded-full bg-zinc-800">
                <Text className="text-zinc-300 text-xs">חשבון</Text>
              </View>
              <Text className={`text-zinc-500 text-xs ${tw.textStart}`}>
                פרטים אישיים והגדרות
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="ערוך שם"
              accessibilityHint="פותח חלון לעריכת השם"
              onPress={handleEditName}
              hitSlop={10}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[56px]"
            >
              <View className={`${tw.flexRow} items-center justify-between`}>
                <Text className="text-zinc-400 text-sm">›</Text>
                <Text
                  className={`text-white text-base font-semibold ${tw.textStart}`}
                >
                  ערוך שם
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="פתח הגדרות"
              accessibilityHint="מעביר למסך ההגדרות"
              onPress={() => router.push('/(authenticated)/settings')}
              hitSlop={10}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[56px]"
            >
              <View className={`${tw.flexRow} items-center justify-between`}>
                <Text className="text-zinc-400 text-sm">›</Text>
                <Text
                  className={`text-white text-base font-semibold ${tw.textStart}`}
                >
                  הגדרות
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="התנתקות"
              accessibilityHint="מתנתק מהחשבון ומחזיר למסך ההתחברות"
              onPress={() => {
                Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
                  { text: 'ביטול', style: 'cancel' },
                  {
                    text: 'התנתק',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await signOut();
                      } catch {
                        Alert.alert('שגיאה', 'אירעה שגיאה בהתנתקות');
                      }
                    },
                  },
                ]);
              }}
              hitSlop={10}
              className="p-4 rounded-xl bg-red-950/30 border border-red-900 min-h-[56px]"
            >
              <View className={`${tw.flexRow} items-center justify-between`}>
                <Text className="text-red-400 text-sm">›</Text>
                <Text
                  className={`text-red-400 text-base font-semibold ${tw.textStart}`}
                >
                  התנתקות
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* מודאל עריכת שם */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <Text
              className={`text-white text-2xl font-bold mb-4 ${tw.textStart}`}
            >
              ערוך שם
            </Text>

            <Text className={`text-zinc-400 text-sm mb-3 ${tw.textStart}`}>
              שם מלא
            </Text>
            <TextInput
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-base mb-6"
              style={{ textAlign: rtl.textAlign }}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="הזן שם מלא"
              placeholderTextColor="#52525b"
              editable={!isSaving}
              autoFocus={true}
            />

            <View className={`${tw.flexRow} gap-3`}>
              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="ביטול"
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSaving}
                hitSlop={10}
                className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 min-h-[48px] items-center justify-center"
              >
                <Text className="text-white text-base font-semibold">
                  ביטול
                </Text>
              </Pressable>

              <Pressable
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="שמור שינויים"
                onPress={handleSaveName}
                disabled={isSaving || !editedName.trim()}
                hitSlop={10}
                className={`flex-1 p-3 rounded-xl min-h-[48px] items-center justify-center ${
                  isSaving || !editedName.trim()
                    ? 'bg-zinc-800 border border-zinc-700 opacity-50'
                    : 'bg-sky-400'
                }`}
              >
                {isSaving ? (
                  <Text className="text-white text-base font-semibold">
                    שומר...
                  </Text>
                ) : (
                  <Text className="text-white text-base font-semibold">
                    שמור
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
