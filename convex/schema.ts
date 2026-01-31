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
});
