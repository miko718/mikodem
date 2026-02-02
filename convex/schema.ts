import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// הגדרת הסכמה (Schema) של מסד הנתונים
// קובץ זה מגדיר את מבנה הטבלאות והקשרים ב-Database
export default defineSchema({
  // יבוא טבלאות ברירת מחדל של ספריית האימות (users, sessions, etc.)
  ...authTables,

  // טבלת משתמשים מורחבת
  // מכילה מידע נוסף על המשתמשים מעבר לבסיס של ספריית האימות
  users: defineTable({
    email: v.string(), // כתובת אימייל
    emailVerified: v.optional(v.boolean()), // האם האימייל אומת
    fullName: v.optional(v.string()), // שם מלא
    role: v.union(v.literal('admin'), v.literal('user')), // תפקיד המשתמש (מנהל או משתמש רגיל)
    userType: v.optional(v.union(v.literal('free'), v.literal('paid'))), // סוג משתמש (חינמי או בתשלום) - אופציונלי לתאימות לאחור
    // הגדרות Mikodem
    preferredTransportMode: v.optional(
      v.union(v.literal('walking'), v.literal('driving'), v.literal('transit'))
    ), // אמצעי תחבורה מועדף לחישוב ETA
    safetyBufferMinutes: v.optional(v.number()), // מרווח ביטחון בדקות (ברירת מחדל: 5)
    locationTrackingEnabled: v.optional(v.boolean()), // האם מעקב מיקום מופעל (ברירת מחדל: true)
    pushNotificationsEnabled: v.optional(v.boolean()), // האם התראות Push מופעלות (ברירת מחדל: true)
    isActive: v.boolean(), // האם המשתמש פעיל
    createdAt: v.number(), // זמן יצירה (Timestamp)
    updatedAt: v.number(), // זמן עדכון אחרון (Timestamp)
  })
    .index('by_email', ['email']) // אינדקס לחיפוש מהיר לפי אימייל
    .index('by_role', ['role']) // אינדקס לסינון מהיר לפי תפקיד
    .index('by_userType', ['userType']), // אינדקס לסינון מהיר לפי סוג משתמש

  // טבלת עסקים - מידע על עסקים של עצמאים
  businesses: defineTable({
    userId: v.id('users'), // קישור למשתמש
    // שלב 1: פרטי עסק בסיסיים
    fullName: v.string(), // שם מלא של בעל העסק
    businessName: v.string(), // שם העסק
    businessField: v.string(), // תחום עיסוק
    businessSeniority: v.string(), // ותק בעסק
    businessIdNumber: v.string(), // מספר עוסק / ח.פ
    logoUri: v.optional(v.string()), // URI של לוגו העסק
    // שלב 2: פרטי קשר
    businessAddress: v.optional(v.string()), // כתובת העסק
    city: v.optional(v.string()), // עיר
    phone: v.optional(v.string()), // טלפון
    website: v.optional(v.string()), // אתר אינטרנט
    businessLink: v.optional(v.string()), // קישור לדף עסקי
    // מיקום העסק (לניהול תורים)
    businessLocation: v.optional(
      v.object({
        latitude: v.number(), // קו רוחב
        longitude: v.number(), // קו אורך
        address: v.optional(v.string()), // כתובת מלאה
      })
    ),
    // שלב 3: הטבה
    benefitDescription: v.optional(v.string()), // תיאור ההטבה
    benefitDiscount: v.optional(v.string()), // אחוז הנחה
    // סטטוס
    registrationStep: v.union(
      v.literal('step1'),
      v.literal('step2'),
      v.literal('step3'),
      v.literal('completed')
    ), // שלב הרישום הנוכחי
    isActive: v.boolean(), // האם העסק פעיל
    createdAt: v.number(), // זמן יצירה
    updatedAt: v.number(), // זמן עדכון אחרון
  })
    .index('by_userId', ['userId']) // אינדקס לחיפוש מהיר לפי משתמש
    .index('by_city', ['city']) // אינדקס לחיפוש לפי עיר
    .index('by_businessField', ['businessField']), // אינדקס לחיפוש לפי תחום עיסוק

  // טבלת פגישות - ניהול תורים
  appointments: defineTable({
    businessId: v.id('businesses'), // קישור לעסק
    // פרטי הפגישה
    title: v.string(), // כותרת הפגישה
    description: v.optional(v.string()), // תיאור הפגישה
    startTime: v.number(), // זמן התחלה (Timestamp)
    endTime: v.number(), // זמן סיום (Timestamp)
    // פרטי הלקוח
    clientName: v.string(), // שם הלקוח
    clientPhone: v.optional(v.string()), // טלפון הלקוח
    clientEmail: v.optional(v.string()), // אימייל הלקוח
    // מיקום הלקוח (אם שותף)
    clientLocation: v.optional(
      v.object({
        latitude: v.number(), // קו רוחב
        longitude: v.number(), // קו אורך
        timestamp: v.number(), // מתי שותף המיקום
        accuracy: v.optional(v.number()), // דיוק המיקום במטרים
      })
    ),
    // קישור לשיתוף מיקום
    shareLocationLink: v.optional(v.string()), // קישור ייחודי לשיתוף מיקום
    // סטטוס הפגישה
    status: v.union(
      v.literal('scheduled'), // מתוזמנת
      v.literal('location_shared'), // מיקום שותף
      v.literal('in_progress'), // בתהליך
      v.literal('completed'), // הושלמה
      v.literal('cancelled') // בוטלה
    ),
    // חיבור ל-Google Calendar
    googleCalendarEventId: v.optional(v.string()), // ID של האירוע ב-Google Calendar
    // חישוב מרחק (מתעדכן אוטומטית)
    distanceFromBusiness: v.optional(v.number()), // מרחק מהעסק בק"מ
    estimatedArrivalTime: v.optional(v.number()), // זמן הגעה משוער (דקות)
    // אמצעי תחבורה של הלקוח
    clientTransportMode: v.optional(
      v.union(v.literal('walking'), v.literal('driving'), v.literal('transit'))
    ), // אמצעי תחבורה לחישוב ETA
    // ETA נוכחי (מתעדכן כל 5 דקות)
    currentETA: v.optional(v.number()), // ETA נוכחי בדקות
    lastETACalculation: v.optional(v.number()), // זמן חישוב ETA אחרון
    // מטא-דאטה
    createdAt: v.number(), // זמן יצירה
    updatedAt: v.number(), // זמן עדכון אחרון
  })
    .index('by_businessId', ['businessId']) // אינדקס לחיפוש לפי עסק
    .index('by_startTime', ['startTime']) // אינדקס לחיפוש לפי זמן התחלה
    .index('by_status', ['status']) // אינדקס לחיפוש לפי סטטוס
    .index('by_businessId_startTime', ['businessId', 'startTime']), // אינדקס משולב

  // טבלת מיקומים משותפים - היסטוריית מיקומים של לקוחות
  sharedLocations: defineTable({
    appointmentId: v.id('appointments'), // קישור לפגישה
    // מיקום
    latitude: v.number(), // קו רוחב
    longitude: v.number(), // קו אורך
    accuracy: v.optional(v.number()), // דיוק המיקום במטרים
    // מטא-דאטה
    timestamp: v.number(), // מתי נשלח המיקום
    createdAt: v.number(), // זמן יצירה
  })
    .index('by_appointmentId', ['appointmentId']) // אינדקס לחיפוש לפי פגישה
    .index('by_timestamp', ['timestamp']), // אינדקס לחיפוש לפי זמן

  // טבלת הצעות החלפה (Swap Proposals)
  swapProposals: defineTable({
    originalAppointmentId: v.id('appointments'), // התור המקורי (המאחר)
    targetAppointmentId: v.id('appointments'), // התור היעד (להקדים)
    // סטטוס ההצעה
    status: v.union(
      v.literal('pending_original'), // ממתין לאישור הלקוח המקורי
      v.literal('pending_target'), // ממתין לאישור הלקוח היעד
      v.literal('accepted'), // התקבלה
      v.literal('rejected'), // נדחתה
      v.literal('expired') // פגה (לא נענה תוך 2 דקות)
    ),
    // זמנים
    proposedOriginalTime: v.number(), // הזמן המוצע לתור המקורי
    proposedTargetTime: v.number(), // הזמן המוצע לתור היעד
    // מטא-דאטה
    createdAt: v.number(), // זמן יצירה
    expiresAt: v.number(), // זמן פקיעה (2 דקות)
    updatedAt: v.number(), // זמן עדכון אחרון
  })
    .index('by_originalAppointment', ['originalAppointmentId']) // אינדקס לפי תור מקורי
    .index('by_targetAppointment', ['targetAppointmentId']) // אינדקס לפי תור יעד
    .index('by_status', ['status']), // אינדקס לפי סטטוס

  // טבלת היסטוריית ETA - מעקב אחרי חישובי ETA
  etaHistory: defineTable({
    appointmentId: v.id('appointments'), // קישור לפגישה
    // ETA
    etaMinutes: v.number(), // זמן הגעה משוער בדקות
    distanceKm: v.number(), // מרחק בק"מ
    // מיקום בזמן החישוב
    clientLatitude: v.number(), // קו רוחב של הלקוח
    clientLongitude: v.number(), // קו אורך של הלקוח
    // מטא-דאטה
    calculatedAt: v.number(), // זמן החישוב
    createdAt: v.number(), // זמן יצירה
  })
    .index('by_appointmentId', ['appointmentId']) // אינדקס לפי פגישה
    .index('by_calculatedAt', ['calculatedAt']), // אינדקס לפי זמן חישוב
});
