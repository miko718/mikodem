# mikodem – יומן פגישות מבוסס מיקום

מערכת המאפשרת לבעל עסק לראות את מיקום הלקוח **30 דקות לפני** מועד הפגישה, כדי להחליט אם להמתין ללקוח או לקבל את הבא בתור שקרוב יותר.

## תכונות

- **חיבור ל-Google Calendar** – סנכרון פגישות
- **שיתוף מיקום מלקוח** – לקוח מקבל קישור (SMS/WhatsApp) ומשתף מיקום
- **מפה** – הצגת מיקום העסק ומיקום הלקוחות
- **חישוב מרחקים** – השוואה מי קרוב יותר להגיע בזמן
- **עדכון מיקום אוטומטי** – מיקום הלקוח מתעדכן כל 30 שניות
- **התראות** – התראה כשמגיע זמן לשלוח קישור ללקוח

## התקנה

### 1. שכפל את הפרויקט והתקן תלויות

```bash
cd mikodem
npm install
```

### 2. הגדרת Google Cloud Console

1. עבור ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש
3. הפעל את **Google Calendar API**
4. תחת **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. בחר **Web application**
6. הוסף Authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. העתק את Client ID ו-Client Secret

### 3. הגדרת משתני סביבה

```bash
cp .env.example .env
# ערוך .env והוסף את ה-Client ID וה-Client Secret
# החלף SESSION_SECRET במחרוזת אקראית
```

### 4. הרצה

```bash
npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## זרימת עבודה

1. **בעל העסק** מתחבר עם Google, מגדיר את מיקום העסק
2. **30 דקות לפני פגישה** – המערכת מציגה את הפגישות בטווח ומציגה התראה
3. **שליחת קישור ללקוח** – "העתק קישור ל-SMS/WhatsApp" ושלח ללקוח
4. **הלקוח** לוחץ על הקישור, משתף מיקום (מתעדכן אוטומטית כל 30 שניות)
5. **בעל העסק** רואה על המפה מי קרוב, ומחליט

## אינטגרציית SMS/WhatsApp

כרגע יש כפתור "העתק קישור" – מעתיק את הקישור ללוח. לאינטגרציה מלאה:

- **SMS**: [Twilio](https://www.twilio.com/) – API לשליחת SMS עם הקישור
- **WhatsApp**: [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) – דורש אישור

## מבנה הפרויקט

```
mikodem/
├── server/           # Backend (Express)
│   ├── routes/       # Auth, Calendar, Locations
│   └── data/         # שמירת מיקומים (JSON)
├── src/              # Frontend (React)
│   ├── pages/        # Login, Dashboard, ShareLocation
│   └── components/   # MapView, MeetingList
└── package.json
```

## אבטחה

- כל ה-routes של בעל העסק דורשים אימות
- מיקומי לקוחות נשמרים ללא אימות (דרך קישור ייחודי)
- SESSION_SECRET צריך להיות מחרוזת אקראית חזקה
