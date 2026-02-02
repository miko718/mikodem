import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// שליפת המשתמש הנוכחי המחובר
// מחזיר null אם המשתמש לא מחובר
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // חיפוש המשתמש ב-Database לפי כתובת האימייל מה-Identity
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email ?? ''))
      .unique();

    return user;
  },
});

// שליפת משתמש לפי מזהה (ID)
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

// שליפת רשימת כל המשתמשים הפעילים
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

// יצירה או עדכון של משתמש (נקרא בדרך כלל מתהליך האימות)
export const createOrUpdateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const email = identity.email ?? '';
    const now = Date.now();

    // בדיקה אם המשתמש כבר קיים
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    const userData = {
      email,
      emailVerified: identity.emailVerified ?? false,
      fullName: identity.name || identity.nickname || 'User',
      role: 'user' as const,
      userType: 'free' as const, // ברירת מחדל - משתמש חינמי
      isActive: true,
      updatedAt: now,
    };

    // עדכון משתמש קיים
    if (existing) {
      await ctx.db.patch(existing._id, userData);
      return existing._id;
    }

    // יצירת משתמש חדש
    return await ctx.db.insert('users', {
      ...userData,
      createdAt: now,
    });
  },
});

// עדכון פרופיל המשתמש (למשל, שינוי שם)
export const updateProfile = mutation({
  args: {
    userId: v.id('users'),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, { userId, fullName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    await ctx.db.patch(userId, {
      fullName,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// עדכון פרופיל המשתמש הנוכחי (ללא צורך ב-userId)
export const updateMyProfile = mutation({
  args: {
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, { fullName }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(user._id, {
      fullName,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// עדכון הגדרות Mikodem (אמצעי תחבורה, safety buffer, וכו')
export const updateMikodemSettings = mutation({
  args: {
    preferredTransportMode: v.optional(
      v.union(v.literal('walking'), v.literal('driving'), v.literal('transit'))
    ),
    safetyBufferMinutes: v.optional(v.number()),
    locationTrackingEnabled: v.optional(v.boolean()),
    pushNotificationsEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const updateData: {
      preferredTransportMode?: 'walking' | 'driving' | 'transit';
      safetyBufferMinutes?: number;
      locationTrackingEnabled?: boolean;
      pushNotificationsEnabled?: boolean;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.preferredTransportMode !== undefined) {
      updateData.preferredTransportMode = args.preferredTransportMode;
    }
    if (args.safetyBufferMinutes !== undefined) {
      updateData.safetyBufferMinutes = args.safetyBufferMinutes;
    }
    if (args.locationTrackingEnabled !== undefined) {
      updateData.locationTrackingEnabled = args.locationTrackingEnabled;
    }
    if (args.pushNotificationsEnabled !== undefined) {
      updateData.pushNotificationsEnabled = args.pushNotificationsEnabled;
    }

    await ctx.db.patch(user._id, updateData);
    return user._id;
  },
});

// עדכון סוג המשתמש (חינמי/בתשלום)
export const updateUserType = mutation({
  args: {
    userType: v.union(v.literal('free'), v.literal('paid')),
  },
  handler: async (ctx, { userType }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('לא מחובר למערכת');
    }

    // חיפוש המשתמש לפי אימייל
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email ?? ''))
      .unique();

    if (!user) {
      throw new Error('משתמש לא נמצא');
    }

    await ctx.db.patch(user._id, {
      userType,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

// מחיקת משתמש (פעולה למנהלים או למשתמש עצמו - כאן מיושם כמחיקה פיזית)
export const remove = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    await ctx.db.delete(userId);
  },
});

// מחיקת חשבון המשתמש הנוכחי וכל הנתונים המשויכים אליו
// ⚠️ אזהרה: פעולה זו בלתי הפיכה ותמחק את כל הנתונים לצמיתות!
export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('לא מחובר למערכת');
    }

    // קבלת מזהה המשתמש מה-identity
    const userId = identity.subject;
    let deletedCount = 0;

    // כאן תוכל להוסיף מחיקה של טבלאות נוספות שקשורות למשתמש
    // לדוגמה:
    // const userPosts = await ctx.db
    //   .query('posts')
    //   .withIndex('by_user', (q) => q.eq('userId', userId))
    //   .collect();
    // for (const post of userPosts) {
    //   await ctx.db.delete(post._id);
    //   deletedCount += 1;
    // }

    // מחיקת המשתמש מטבלת המשתמשים
    // הערה: Convex Auth מנהל את טבלת המשתמשים, אך אנחנו יכולים למחוק את הרשומה
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('_id'), userId))
      .first();

    if (user) {
      await ctx.db.delete(user._id);
      deletedCount += 1;
    }

    return {
      success: true,
      message: `נמחקו ${deletedCount} רשומות עבור משתמש ${userId}`,
      deletedCount,
    };
  },
});
