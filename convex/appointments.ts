import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// פונקציה עזר לחישוב מרחק בין שתי נקודות (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // רדיוס כדור הארץ בק"מ
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // מרחק בק"מ
}

// יצירת פגישה חדשה
export const create = mutation({
  args: {
    businessId: v.id('businesses'),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.number(),
    clientName: v.string(),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    googleCalendarEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // בדיקה שהעסק שייך למשתמש
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user || business.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    const now = Date.now();
    const appointmentId = await ctx.db.insert('appointments', {
      businessId: args.businessId,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      clientName: args.clientName,
      clientPhone: args.clientPhone,
      clientEmail: args.clientEmail,
      status: 'scheduled',
      googleCalendarEventId: args.googleCalendarEventId,
      createdAt: now,
      updatedAt: now,
      shareLocationLink: '', // יעודכן מיד
    });

    // יצירת קישור ייחודי לשיתוף מיקום עם ה-ID האמיתי
    const shareLocationLink = `mikodem://share-location/${appointmentId}`;
    await ctx.db.patch(appointmentId, {
      shareLocationLink,
    });

    return appointmentId;
  },
});

// עדכון פגישה
export const update = mutation({
  args: {
    appointmentId: v.id('appointments'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    clientName: v.optional(v.string()),
    clientPhone: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('scheduled'),
        v.literal('location_shared'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // בדיקה שהעסק שייך למשתמש
    const business = await ctx.db.get(appointment.businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user || business.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    const updateData: {
      title?: string;
      description?: string;
      startTime?: number;
      endTime?: number;
      clientName?: string;
      clientPhone?: string;
      clientEmail?: string;
      status?:
        | 'scheduled'
        | 'location_shared'
        | 'in_progress'
        | 'completed'
        | 'cancelled';
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined)
      updateData.description = args.description;
    if (args.startTime !== undefined) updateData.startTime = args.startTime;
    if (args.endTime !== undefined) updateData.endTime = args.endTime;
    if (args.clientName !== undefined) updateData.clientName = args.clientName;
    if (args.clientPhone !== undefined)
      updateData.clientPhone = args.clientPhone;
    if (args.clientEmail !== undefined)
      updateData.clientEmail = args.clientEmail;
    if (args.status !== undefined) updateData.status = args.status;

    await ctx.db.patch(args.appointmentId, updateData);
    return args.appointmentId;
  },
});

// עדכון מיקום לקוח
export const updateClientLocation = mutation({
  args: {
    appointmentId: v.id('appointments'),
    latitude: v.number(),
    longitude: v.number(),
    accuracy: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const business = await ctx.db.get(appointment.businessId);
    if (!business || !business.businessLocation) {
      throw new Error('Business location not set');
    }

    // חישוב מרחק מהעסק
    const distance = calculateDistance(
      args.latitude,
      args.longitude,
      business.businessLocation.latitude,
      business.businessLocation.longitude
    );

    // חישוב זמן הגעה משוער (מניחים מהירות ממוצעת של 50 קמ"ש)
    const estimatedArrivalMinutes = Math.round((distance / 50) * 60);

    const now = Date.now();

    // עדכון מיקום הלקוח בפגישה
    await ctx.db.patch(args.appointmentId, {
      clientLocation: {
        latitude: args.latitude,
        longitude: args.longitude,
        timestamp: now,
        accuracy: args.accuracy,
      },
      distanceFromBusiness: distance,
      estimatedArrivalTime: estimatedArrivalMinutes,
      status: 'location_shared',
      updatedAt: now,
    });

    // שמירת היסטוריית מיקום
    await ctx.db.insert('sharedLocations', {
      appointmentId: args.appointmentId,
      latitude: args.latitude,
      longitude: args.longitude,
      accuracy: args.accuracy,
      timestamp: now,
      createdAt: now,
    });

    return {
      distance,
      estimatedArrivalMinutes,
    };
  },
});

// שליפת פגישות לפי עסק
export const getByBusiness = query({
  args: {
    businessId: v.id('businesses'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // בדיקה שהעסק שייך למשתמש
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      return [];
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user || business.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query('appointments')
      .withIndex('by_businessId_startTime', (q) =>
        q.eq('businessId', args.businessId)
      )
      .order('desc')
      .collect();
  },
});

// שליפת פגישות קרובות (30 דקות לפני)
export const getUpcoming = query({
  args: {
    businessId: v.id('businesses'),
    minutesBefore: v.optional(v.number()), // ברירת מחדל: 30 דקות
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // בדיקה שהעסק שייך למשתמש
    const business = await ctx.db.get(args.businessId);
    if (!business) {
      return [];
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user || business.userId !== user._id) {
      return [];
    }

    const minutesBefore = args.minutesBefore ?? 30;
    const now = Date.now();
    const timeWindow = minutesBefore * 60 * 1000; // המרה למילישניות
    const startTime = now;
    const endTime = now + timeWindow;

    // שליפת פגישות בטווח הזמן
    const appointments = await ctx.db
      .query('appointments')
      .withIndex('by_businessId_startTime', (q) =>
        q.eq('businessId', args.businessId)
      )
      .filter((q) => q.gte(q.field('startTime'), startTime))
      .filter((q) => q.lte(q.field('startTime'), endTime))
      .filter((q) => q.neq(q.field('status'), 'cancelled'))
      .collect();

    return appointments;
  },
});

// שליפת פגישה לפי ID
export const getById = query({
  args: {
    appointmentId: v.id('appointments'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appointmentId);
  },
});

// שליפת פגישה לפי קישור שיתוף מיקום
export const getByShareLink = query({
  args: {
    shareLink: v.string(),
  },
  handler: async (ctx, args) => {
    // חילוץ ID מהקישור
    const match = args.shareLink.match(/share-location\/([^/]+)/);
    if (!match) {
      return null;
    }

    try {
      const appointmentId = match[1] as any;
      return await ctx.db.get(appointmentId);
    } catch {
      return null;
    }
  },
});

// מחיקת פגישה
export const deleteAppointment = mutation({
  args: {
    appointmentId: v.id('appointments'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // בדיקה שהעסק שייך למשתמש
    const business = await ctx.db.get(appointment.businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const email = identity.email ?? '';
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();

    if (!user || business.userId !== user._id) {
      throw new Error('Unauthorized');
    }

    await ctx.db.delete(args.appointmentId);
    return args.appointmentId;
  },
});
