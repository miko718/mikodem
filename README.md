# Mikodem 991 – אפליקציית תורים חכמה

אפליקציית React Native (Expo) לניהול תורים עם מעקב ETA והחלפת תורים אוטומטית.

## התחלה מהירה

```bash
npm install
npx expo start
```

סרוק את קוד ה-QR עם **Expo Go** או לחץ `w` ל-Web.

## מבנה הפרויקט

- `app/` – מסכים (expo-router)
- `contexts/` – AuthContext, BookingContext
- `components/` – רכיבי UI
- `data/` – נתונים לדוגמה
- `docs/` – אפיון: User Stories, Sprint Plan, Firestore Schema

## מסכים

- **Onboarding** – 3 סליידים
- **Login** – Google / OTP (הדמיה)
- **Dashboard** – התור הקרוב, היסטוריה, FAB
- **חיפוש** – רשימת עסקים
- **פרטי עסק** – שירותים, ניווט, קבע
- **קביעת תור** – תאריך, שעה, סיכום
- **Success** – מסך הצלחה
- **פרופיל** – פרטי משתמש, התנתקות

## תיעוד

| מסמך | תיאור |
|------|--------|
| [docs/USER_STORIES.md](docs/USER_STORIES.md) | User Stories מפורטים |
| [docs/SPRINT_PLAN.md](docs/SPRINT_PLAN.md) | תוכנית ספרינטים |
| [docs/FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md) | סכימת Firestore ו-Cloud Functions |
| [docs/GIT_CONNECT.md](docs/GIT_CONNECT.md) | חיבור ל-GitHub |

## GitHub

Repository: https://github.com/miko718/mikodem-991
