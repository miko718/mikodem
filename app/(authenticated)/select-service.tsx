import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import {
  Key,
  Scissors,
  Search,
  Sparkles,
  Wind,
  Wrench,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/convex/_generated/api';
import { tw } from '@/lib/rtl';

// רשימת שירותים נפוצים (ניתן להעביר ל-DB בעתיד)
const SERVICES = [
  {
    id: 'dentist',
    name: 'רופא שיניים',
    category: 'רפואה',
    icon: Sparkles,
    color: '#10b981',
  },
  {
    id: 'plumber',
    name: 'שרברב',
    category: 'בית',
    icon: Wrench,
    color: '#f59e0b',
  },
  {
    id: 'hairdryer',
    name: 'ייבוש שיער',
    category: 'יופי',
    icon: Wind,
    color: '#8b5cf6',
  },
  {
    id: 'haircut',
    name: 'תספורת',
    category: 'יופי',
    icon: Scissors,
    color: '#0ea5e9',
  },
  {
    id: 'consultation',
    name: 'ייעוץ',
    category: 'ייעוץ',
    icon: Key,
    color: '#ec4899',
  },
  {
    id: 'checkup',
    name: 'בדיקה',
    category: 'רפואה',
    icon: Sparkles,
    color: '#10b981',
  },
  {
    id: 'treatment',
    name: 'טיפול',
    category: 'רפואה',
    icon: Sparkles,
    color: '#10b981',
  },
  {
    id: 'design',
    name: 'עיצוב',
    category: 'עיצוב',
    icon: Key,
    color: '#ec4899',
  },
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

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

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
          בחירת שירות
        </Text>
        <Text className="text-zinc-400 text-sm">1/3</Text>
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

          {/* Services Grid */}
          <View className="gap-4">
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
              <View className="flex-row flex-wrap gap-4">
                {filteredServices.slice(0, 4).map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <Pressable
                      key={service.id}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`בחר ${service.name}`}
                      onPress={() => {
                        setSelectedServiceId(service.id);
                        handleSelectService(service.id, service.name);
                      }}
                      className={`w-[calc(50%-8px)] aspect-square bg-zinc-900/50 border rounded-2xl p-4 items-center justify-center ${
                        isSelected
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-zinc-800'
                      }`}
                    >
                      <View
                        className="w-16 h-16 rounded-xl items-center justify-center mb-3"
                        style={{
                          backgroundColor: `${service.color}20`,
                        }}
                      >
                        <Icon size={32} color={service.color} />
                      </View>
                      <Text
                        className={`text-sm font-semibold text-center ${
                          isSelected ? 'text-green-400' : 'text-white'
                        } ${tw.textStart}`}
                      >
                        {service.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
