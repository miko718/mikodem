import type { Business } from '@/contexts/BookingContext';

export const MOCK_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'מספרת השישי',
    category: 'מספרה לגברים',
    address: 'רחוב הרצל 45, תל אביב',
    services: [
      { id: 's1', name: 'תספורת גברית', duration: 30, price: 80 },
      { id: 's2', name: 'תספורת + זקן', duration: 45, price: 120 },
      { id: 's3', name: 'גילוח', duration: 20, price: 50 },
    ],
  },
  {
    id: '2',
    name: 'ספא יופי',
    category: 'יופי וטיפוח',
    address: 'שדרות רוטשילד 12, תל אביב',
    services: [
      { id: 's4', name: 'עיסוי שוודי', duration: 60, price: 250 },
      { id: 's5', name: 'עיסוי רקמות עמוקות', duration: 90, price: 350 },
    ],
  },
  {
    id: '3',
    name: 'מרפאת ד"ר כהן',
    category: 'רפואה',
    address: 'הנביאים 8, ירושלים',
    services: [
      { id: 's6', name: 'ביקור כללי', duration: 30, price: 0 },
      { id: 's7', name: 'ייעוץ תזונה', duration: 45, price: 180 },
    ],
  },
];
