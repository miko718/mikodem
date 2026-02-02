import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

// רשימת שירותים נפוצים (ניתן להעביר ל-DB בעתיד)
const SERVICES = [
  { id: 'consultation', name: 'ייעוץ', category: 'ייעוץ' },
  { id: 'haircut', name: 'תספורת', category: 'יופי' },
  { id: 'checkup', name: 'בדיקה', category: 'רפואה' },
  { id: 'treatment', name: 'טיפול', category: 'רפואה' },
  { id: 'design', name: 'עיצוב', category: 'עיצוב' },
  { id: 'legal', name: 'ייעוץ משפטי', category: 'משפטים' },
  { id: 'accounting', name: 'ייעוץ חשבונאי', category: 'חשבונאות' },
  { id: 'coaching', name: 'אימון', category: 'אימון' },
];

const CATEGORIES = [
  'הכל',
  'ייעוץ',
  'יופי',
  'רפואה',
  'עיצוב',
  'משפטים',
  'חשבונאות',
  'אימון',
];

export default function SelectServiceScreen() {
  const router = useRouter();
  const business = useQuery(api.businesses.getMyBusiness);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('הכל');

  // סינון שירותים לפי חיפוש וקטגוריה
  const filteredServices = SERVICES.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'הכל' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectService = (serviceId: string, serviceName: string) => {
    router.push({
      pathname: '/(authenticated)/select-datetime',
      params: { serviceId, serviceName },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      {/* Header */}
      <View
        className={`${tw.flexRow} items-center justify-between px-6 pt-4 pb-2`}
      >
        <Pressable
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="חזור"
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Text className="text-sky-400 text-base">ביטול</Text>
        </Pressable>
        <Text className={`text-white text-lg font-semibold ${tw.textStart}`}>
          בחר שירות
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Search Bar */}
          <View className="mb-6">
            <View className="flex-row items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
              <Search size={20} color="#71717a" />
              <TextInput
                className="flex-1 text-white text-base"
                style={{ textAlign: 'right' }}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="חפש שירות..."
                placeholderTextColor="#52525b"
              />
            </View>
          </View>

          {/* Categories Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((category) => (
              <Pressable
                key={category}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`סינון לפי ${category}`}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-sky-400'
                    : 'bg-zinc-900 border border-zinc-800'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'text-zinc-400'
                  }`}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Services List */}
          <View className="gap-3">
            {filteredServices.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-zinc-400 text-base">
                  לא נמצאו שירותים
                </Text>
                <Text className="text-zinc-500 text-sm mt-2">
                  נסה לשנות את החיפוש או הקטגוריה
                </Text>
              </View>
            ) : (
              filteredServices.map((service) => (
                <Pressable
                  key={service.id}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`בחר ${service.name}`}
                  onPress={() => handleSelectService(service.id, service.name)}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`text-white text-lg font-semibold mb-1 ${tw.textStart}`}
                      >
                        {service.name}
                      </Text>
                      <Text className={`text-zinc-400 text-sm ${tw.textStart}`}>
                        {service.category}
                      </Text>
                    </View>
                    <View className="w-2 h-2 rounded-full bg-sky-400" />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
