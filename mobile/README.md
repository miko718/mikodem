# mikodem Mobile - Expo App

אפליקציית מובייל של mikodem בנויה עם React Native ו-Expo.

## התקנה

```bash
cd mobile
npm install
```

## הרצה

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## תכונות

- ✅ התחברות עם Google OAuth
- ✅ הצגת פגישות מ-Google Calendar
- ✅ מפה עם מיקומי לקוחות ועסק
- ✅ שיתוף מיקום אוטומטי (כל 30 שניות)
- ✅ Deep linking לקישורי שיתוף מיקום

## הגדרות

ערוך את `config/API.js` כדי להגדיר את כתובת ה-API:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api'  // Development
  : 'https://your-production-api.com/api';  // Production
```

**הערה**: ב-iOS Simulator, השתמש ב-`localhost`. ב-Android Emulator, השתמש ב-`10.0.2.2` במקום `localhost`.

## Deep Linking

האפליקציה תומכת ב-deep linking:
- `mikodem://share/:eventId` - שיתוף מיקום לפגישה

## הרשאות

האפליקציה דורשת הרשאות למיקום (Location) כדי:
- להגדיר את מיקום העסק
- לשתף את המיקום של הלקוח

## מבנה הפרויקט

```
mobile/
├── screens/          # מסכי האפליקציה
│   ├── LoginScreen.js
│   ├── DashboardScreen.js
│   └── ShareLocationScreen.js
├── components/       # קומפוננטות
│   └── MapView.js
├── context/          # Context API
│   └── AuthContext.js
├── config/           # הגדרות
│   └── API.js
└── App.js           # נקודת הכניסה
```
