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

- ✅ התחברות עם Google OAuth (מותאם ל-Expo עם JWT)
- ✅ הצגת פגישות מ-Google Calendar
- ✅ מיקומים וקישורים ל-Google Maps
- ✅ שיתוף מיקום אוטומטי (כל 30 שניות)
- ✅ Deep linking: `mikodem://share/:eventId`, `mikodem://auth/callback`

## חיבור ל-Expo

השרת תומך באפליקציית Expo עם התחברות Google:
1. באפליקציה לוחצים "התחבר עם Google" – נפתח דפדפן
2. אחרי האימות השרת מחזיר אתכם לאפליקציה עם token (JWT)
3. ה-token נשמר ומשולח בכל קריאות ה-API

## הגדרות

ערוך את `config/API.js` לפי הסביבה:

- **iOS Simulator**: `http://localhost:3001/api`
- **Android Emulator**: `http://10.0.2.2:3001/api`
- **מכשיר פיזי**: `http://כתובת-ה-IP-של-המחשב:3001/api` (אותו רשת)

דוגמה למכשיר פיזי: `http://192.168.1.130:3001/api`

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
