import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// שמירת נתוני שלב 1 (פרטי עסק בסיסיים)
export const saveStep1 = mutation({
  args: {
    fullName: v.string(),
    businessName: v.string(),
    businessField: v.string(),
    businessSeniority: v.string(),
    businessIdNumber: v.string(),
    logoUri: v.optional(v.string()),
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

    const now = Date.now();

    // בדיקה אם יש כבר עסק למשתמש הזה
    const existingBusiness = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (existingBusiness) {
      // עדכון עסק קיים
      await ctx.db.patch(existingBusiness._id, {
        fullName: args.fullName,
        businessName: args.businessName,
        businessField: args.businessField,
        businessSeniority: args.businessSeniority,
        businessIdNumber: args.businessIdNumber,
        logoUri: args.logoUri,
        registrationStep: 'step2',
        updatedAt: now,
      });
      return existingBusiness._id;
    }

    // יצירת עסק חדש
    return await ctx.db.insert('businesses', {
      userId: user._id,
      fullName: args.fullName,
      businessName: args.businessName,
      businessField: args.businessField,
      businessSeniority: args.businessSeniority,
      businessIdNumber: args.businessIdNumber,
      logoUri: args.logoUri,
      registrationStep: 'step2',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// שמירת נתוני שלב 2 (פרטי קשר + מיקום)
export const saveStep2 = mutation({
  args: {
    businessAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    businessLink: v.optional(v.string()),
    businessLocation: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        address: v.optional(v.string()),
      })
    ),
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

    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (!business) {
      throw new Error('Business not found. Please complete step 1 first.');
    }

    await ctx.db.patch(business._id, {
      businessAddress: args.businessAddress,
      city: args.city,
      phone: args.phone,
      website: args.website,
      businessLink: args.businessLink,
      businessLocation: args.businessLocation,
      registrationStep: 'step3',
      updatedAt: Date.now(),
    });

    return business._id;
  },
});

// שמירת נתוני שלב 3 (הטבה) והשלמת הרישום
export const saveStep3 = mutation({
  args: {
    benefitDescription: v.optional(v.string()),
    benefitDiscount: v.optional(v.string()),
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

    const business = await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();

    if (!business) {
      throw new Error(
        'Business not found. Please complete previous steps first.'
      );
    }

    await ctx.db.patch(business._id, {
      benefitDescription: args.benefitDescription,
      benefitDiscount: args.benefitDiscount,
      registrationStep: 'completed',
      updatedAt: Date.now(),
    });

    return business._id;
  },
});

// שליפת העסק של המשתמש הנוכחי
export const getMyBusiness = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user) {
      return null;
    }

    return await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .first();
  },
});

// שליפת עסק לפי ID
export const getById = query({
  args: { businessId: v.id('businesses') },
  handler: async (ctx, { businessId }) => {
    return await ctx.db.get(businessId);
  },
});

// שליפת כל העסקים הפעילים
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('businesses')
      .filter((q) => q.eq(q.field('isActive'), true))
      .filter((q) => q.eq(q.field('registrationStep'), 'completed'))
      .collect();
  },
});
