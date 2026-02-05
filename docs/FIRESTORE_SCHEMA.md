# סכימת Firestore והנחיות Backend – Mikodem

מסמך זה מיועד למפתח שמקים את השרת (Backend) ב-**Firebase Firestore**. הוא מגדיר אילו אוספים (Collections) ליצור, את מבנה המסמכים, לוגיקת Cloud Functions, שאילתות קריטיות וכלי עזר.

---

## 1. מבנה מסד הנתונים (Firestore Schema)

### אוסף: `Users` (משתמשים)

כל מסמך מייצג לקוח או בעל עסק.

| שדה | סוג | תיאור |
|-----|-----|--------|
| `uid` | `string` | מזהה ייחודי (לרוב מ-Firebase Auth) |
| `displayName` | `string` | שם מלא |
| `role` | `string` | `client` \| `business` |
| `lastLocation` | `object` | `{ lat: number, lng: number, timestamp: serverTimestamp }` |
| `reliabilityScore` | `number` | דירוג דייקנות 1–5 |
| `fcmToken` | `string` | מפתח לשליחת התראות Push למכשיר |

**מזהה מסמך:** מומלץ להשתמש ב-`uid` של Firebase Auth כ-Document ID.

---

### אוסף: `Businesses` (עסקים)

| שדה | סוג | תיאור |
|-----|-----|--------|
| `businessId` | `string` | מזהה ייחודי |
| `ownerUid` | `string` | קישור ל-User (משתמש עם role: business) |
| `name` | `string` | שם העסק |
| `category` | `string` | קטגוריה (מספרה, ייעוץ וכו') |
| `address` | `string` | כתובת טקסטואלית |
| `geoPoint` | `GeoPoint` | מיקום מדויק לחישוב מרחק (Firestore GeoPoint) |
| `settings` | `object` | `{ bufferTime: number, autoSwap: boolean }` – bufferTime בדקות, autoSwap להחלפת תורים אוטומטית |

**מזהה מסמך:** `businessId` או ID אוטומטי – חשוב לעקביות.

---

### אוסף: `Appointments` (תורים) – הלב של המערכת

| שדה | סוג | תיאור |
|-----|-----|--------|
| `appointmentId` | `string` | מזהה ייחודי |
| `businessId` | `string` | קישור לעסק |
| `clientId` | `string` | קישור ללקוח (uid) |
| `startTime` | `Timestamp` | זמן התחלה מתוכנן |
| `duration` | `number` | משך הטיפול בדקות |
| `status` | `string` | `scheduled` \| `delayed` \| `swapped` \| `completed` |
| `currentETA` | `Timestamp` \| `null` | זמן הגעה משוער עדכני (מתעדכן כל 5–10 דקות) |
| `isLate` | `boolean` | האם המערכת זיהתה איחור |

**מזהה מסמך:** `appointmentId` או ID אוטומטי.

---

## 2. לוגיקת Cloud Functions (ה"מוח")

### 2.1 `updateETA`

- **הפעלה:** בכל פעם ש-`lastLocation` של משתמש ב-`Users` משתנה (onUpdate של המסמך או של תת-אוסף).
- **לוגיקה:**
  1. לשלוף את התור הפעיל של הלקוח (היום, status = scheduled/delayed).
  2. לחשב מרחק/זמן מ-`lastLocation` לכתובת העסק (Google Maps Directions/Distance Matrix API).
  3. לעדכן את השדה `currentETA` במסמך התור ב-`Appointments`.

### 2.2 `checkDelay`

- **הפעלה:** יזום (scheduled function כל X דקות) או אחרי עדכון `currentETA`.
- **לוגיקה:**
  1. אם `currentETA` מאוחר מ-`startTime` ב-10 דקות ויותר → להגדיר `isLate: true`.
  2. לעדכן `status` ל-`delayed` אם רלוונטי.
  3. לשלוח התראה Push (FCM) ללקוח ו/או לעסק עם `fcmToken`.

### 2.3 `findSwapCandidate`

- **הפעלה:** כאשר תור מסומן כ-`isLate: true` (או `status: delayed`) והעסק מפעיל `autoSwap`.
- **לוגיקה:**
  1. למצוא תור אחר באותו `businessId` שמתחיל **מאוחר יותר** ואינו delayed.
  2. לבדוק את ה-`clientId` של התור המאוחר – האם ה-`lastLocation` שלו **קרוב לעסק** (למשל רדיוס 2 ק"מ).
  3. אם כן – להציע החלפה (או לבצע אוטומטית לפי `settings.autoSwap`): עדכון `startTime` בין שני התורים והודעות ללקוחות.

---

*מסמך זה משלים את אפיון המוצר, רשימת המסכים ותוכנית הספרינטים – ומאפשר למפתח להקים את השרת ב-Firestore בהתאם.*
