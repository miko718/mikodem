import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server';

// Scheduled Function שרץ כל 5 דקות
// בודק פגישות שמתקרבות (שעה לפני) ומחשב ETA
export const calculateETAsForUpcomingAppointments = internalAction({
  args: {},
  handler: async (ctx): Promise<{ processed: number }> => {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    const ONE_HOUR_BEFORE = now + ONE_HOUR;

    // שליפת כל הפגישות שמתקרבות (בטווח של שעה)
    const upcomingAppointments = await ctx.runQuery(
      internal.scheduled.getAppointmentsInRange,
      {
        startTime: now,
        endTime: ONE_HOUR_BEFORE,
      }
    );

    console.log(
      `Found ${upcomingAppointments.length} appointments to calculate ETA for`
    );

    // חישוב ETA לכל פגישה עם מיקום שותף
    for (const appointment of upcomingAppointments) {
      // בדיקה אם יש מיקום שותף
      if (!appointment.clientLocation) {
        continue;
      }

      // בדיקה אם צריך לחשב ETA מחדש (כל 5 דקות)
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (
        appointment.lastETACalculation &&
        now - appointment.lastETACalculation < FIVE_MINUTES
      ) {
        // כבר חושב לאחרונה - דילוג
        continue;
      }

      // שליפת פרטי העסק
      const business = await ctx.runQuery(internal.scheduled.getBusiness, {
        businessId: appointment.businessId,
      });

      if (!business?.businessLocation) {
        continue;
      }

      // חישוב ETA
      try {
        const transportMode = appointment.clientTransportMode || 'driving';
        const etaResult = await ctx.runAction(
          internal.locationEngine.calculateETA,
          {
            originLat: appointment.clientLocation.latitude,
            originLng: appointment.clientLocation.longitude,
            destinationLat: business.businessLocation.latitude,
            destinationLng: business.businessLocation.longitude,
            mode: transportMode,
          }
        );

        // עדכון ETA בפגישה
        await ctx.runMutation(internal.locationEngine.updateAppointmentETA, {
          appointmentId: appointment._id,
          etaMinutes: etaResult.etaMinutes,
          distanceKm: etaResult.distanceKm,
          clientLatitude: appointment.clientLocation.latitude,
          clientLongitude: appointment.clientLocation.longitude,
        });

        // בדיקת הזדמנויות Swap
        const swapOpportunity = await ctx.runAction(
          internal.optimizationEngine.checkForSwapOpportunity,
          {
            appointmentId: appointment._id,
          }
        );

        if (swapOpportunity.hasOpportunity) {
          // TODO: שליחת Push Notification
          console.log(
            `Swap opportunity found for appointment ${appointment._id}:`,
            swapOpportunity
          );
        }
      } catch (error) {
        console.error(
          `Error calculating ETA for appointment ${appointment._id}:`,
          error
        );
      }
    }

    return { processed: upcomingAppointments.length };
  },
});

// Query פנימי לשליפת פגישות בטווח זמן
export const getAppointmentsInRange = internalQuery({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('appointments')
      .withIndex('by_startTime')
      .filter((q) => q.gte(q.field('startTime'), args.startTime))
      .filter((q) => q.lte(q.field('startTime'), args.endTime))
      .filter((q) => q.neq(q.field('status'), 'cancelled'))
      .collect();
  },
});

// Query פנימי לשליפת עסק
export const getBusiness = internalQuery({
  args: {
    businessId: v.id('businesses'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.businessId);
  },
});

// Scheduled Function לבדיקת הצעות Swap שפגו
export const expireOldSwapProposals = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredProposals = await ctx.db
      .query('swapProposals')
      .withIndex('by_status')
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'pending_original'),
          q.eq(q.field('status'), 'pending_target')
        )
      )
      .collect();

    let expiredCount = 0;
    for (const proposal of expiredProposals) {
      if (now > proposal.expiresAt) {
        await ctx.db.patch(proposal._id, {
          status: 'expired',
          updatedAt: now,
        });
        expiredCount++;
      }
    }

    return { expired: expiredCount };
  },
});
