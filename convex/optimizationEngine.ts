import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server';

// אלגוריתם Swap - זיהוי הזדמנויות החלפה בין תורים
export const checkForSwapOpportunity = internalAction({
  args: {
    appointmentId: v.id('appointments'),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    hasOpportunity: boolean;
    type?: 'delay_only' | 'swap';
    appointmentId?: string;
    swapProposalId?: any;
    originalAppointmentId?: any;
    targetAppointmentId?: any;
    expectedDelayMinutes?: number;
  }> => {
    const appointment = await ctx.runQuery(
      internal.optimizationEngine.getAppointment,
      {
        appointmentId: args.appointmentId,
      }
    );

    if (!appointment) {
      return { hasOpportunity: false };
    }

    // בדיקה אם יש איחור צפוי מעל 10 דקות
    const now = Date.now();
    const timeUntilAppointment = appointment.startTime - now;
    const DELAY_THRESHOLD = 10 * 60 * 1000; // 10 דקות במילישניות

    if (!appointment.currentETA || !appointment.clientLocation) {
      return { hasOpportunity: false };
    }

    const estimatedArrival: number = appointment.currentETA * 60 * 1000; // המרה למילישניות
    const expectedDelay: number = estimatedArrival - timeUntilAppointment;

    // אם אין איחור צפוי מעל 10 דקות - אין הזדמנות
    if (expectedDelay <= DELAY_THRESHOLD) {
      return { hasOpportunity: false };
    }

    // חיפוש התור הבא
    const nextAppointment = await ctx.runQuery(
      internal.optimizationEngine.getNextAppointment,
      {
        businessId: appointment.businessId,
        currentStartTime: appointment.startTime,
      }
    );

    if (!nextAppointment) {
      // אין תור הבא - רק אפשרות לדחות
      return {
        hasOpportunity: true,
        type: 'delay_only',
        appointmentId: args.appointmentId,
        expectedDelayMinutes: Math.ceil(expectedDelay / (60 * 1000)),
      };
    }

    // בדיקה אם התור הבא קרוב יותר (פחות מ-5 דקות מהיעד)
    const business = await ctx.runQuery(
      internal.optimizationEngine.getBusiness,
      {
        businessId: appointment.businessId,
      }
    );

    if (!business?.businessLocation) {
      return { hasOpportunity: false };
    }

    // חישוב ETA של התור הבא
    if (!nextAppointment.clientLocation || !nextAppointment.currentETA) {
      // אין מיקום או ETA לתור הבא - רק אפשרות לדחות
      return {
        hasOpportunity: true,
        type: 'delay_only',
        appointmentId: args.appointmentId,
        expectedDelayMinutes: Math.ceil(expectedDelay / (60 * 1000)),
      };
    }

    const nextAppointmentETA = nextAppointment.currentETA * 60 * 1000;
    const timeUntilNextAppointment = nextAppointment.startTime - now;
    const nextAppointmentExpectedArrival =
      timeUntilNextAppointment - nextAppointmentETA;

    // אם התור הבא קרוב יותר (פחות מ-5 דקות מהיעד) - יש הזדמנות להחלפה
    const CLOSE_THRESHOLD = 5 * 60 * 1000; // 5 דקות
    if (nextAppointmentExpectedArrival < CLOSE_THRESHOLD) {
      // יצירת הצעת החלפה
      const swapProposalId = await ctx.runMutation(
        internal.optimizationEngine.createSwapProposal,
        {
          originalAppointmentId: args.appointmentId,
          targetAppointmentId: nextAppointment._id,
        }
      );

      return {
        hasOpportunity: true,
        type: 'swap',
        swapProposalId,
        originalAppointmentId: args.appointmentId,
        targetAppointmentId: nextAppointment._id,
        expectedDelayMinutes: Math.ceil(expectedDelay / (60 * 1000)),
      };
    }

    // התור הבא לא קרוב מספיק - רק אפשרות לדחות
    return {
      hasOpportunity: true,
      type: 'delay_only',
      appointmentId: args.appointmentId,
      expectedDelayMinutes: Math.ceil(expectedDelay / (60 * 1000)),
    };
  },
});

// Query פנימי לשליפת פגישה
export const getAppointment = internalQuery({
  args: {
    appointmentId: v.id('appointments'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appointmentId);
  },
});

// Query פנימי לשליפת התור הבא
export const getNextAppointment = internalQuery({
  args: {
    businessId: v.id('businesses'),
    currentStartTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('appointments')
      .withIndex('by_businessId_startTime', (q) =>
        q.eq('businessId', args.businessId)
      )
      .filter((q) => q.gt(q.field('startTime'), args.currentStartTime))
      .filter((q) => q.neq(q.field('status'), 'cancelled'))
      .order('asc')
      .first();
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

// Mutation פנימי ליצירת הצעת החלפה
export const createSwapProposal = internalMutation({
  args: {
    originalAppointmentId: v.id('appointments'),
    targetAppointmentId: v.id('appointments'),
  },
  handler: async (ctx, args) => {
    const originalAppointment = await ctx.db.get(args.originalAppointmentId);
    const targetAppointment = await ctx.db.get(args.targetAppointmentId);

    if (!originalAppointment || !targetAppointment) {
      throw new Error('Appointments not found');
    }

    const now = Date.now();
    const expiresAt = now + 2 * 60 * 1000; // 2 דקות

    // יצירת הצעת החלפה
    const swapProposalId = await ctx.db.insert('swapProposals', {
      originalAppointmentId: args.originalAppointmentId,
      targetAppointmentId: args.targetAppointmentId,
      status: 'pending_original',
      proposedOriginalTime: targetAppointment.startTime, // התור המקורי יועבר לזמן התור היעד
      proposedTargetTime: originalAppointment.startTime, // התור היעד יועבר לזמן התור המקורי
      createdAt: now,
      expiresAt,
      updatedAt: now,
    });

    return swapProposalId;
  },
});

// אישור/דחיית הצעת החלפה
export const respondToSwapProposal = internalMutation({
  args: {
    swapProposalId: v.id('swapProposals'),
    accepted: v.boolean(),
    responderType: v.union(v.literal('original'), v.literal('target')),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.swapProposalId);
    if (!proposal) {
      throw new Error('Swap proposal not found');
    }

    const now = Date.now();

    // בדיקה אם ההצעה פגה
    if (now > proposal.expiresAt) {
      await ctx.db.patch(args.swapProposalId, {
        status: 'expired',
        updatedAt: now,
      });
      throw new Error('Swap proposal expired');
    }

    if (!args.accepted) {
      // דחייה
      await ctx.db.patch(args.swapProposalId, {
        status: 'rejected',
        updatedAt: now,
      });
      return { success: false, action: 'rejected' };
    }

    // אישור
    if (args.responderType === 'original') {
      // הלקוח המקורי אישר - מעבר לשלב הבא
      if (proposal.status === 'pending_original') {
        await ctx.db.patch(args.swapProposalId, {
          status: 'pending_target',
          updatedAt: now,
        });
        return { success: true, action: 'pending_target' };
      }
    } else {
      // הלקוח היעד אישר - ביצוע החלפה
      if (proposal.status === 'pending_target') {
        // עדכון זמני התורים
        await ctx.db.patch(proposal.originalAppointmentId, {
          startTime: proposal.proposedOriginalTime,
          endTime:
            proposal.proposedOriginalTime +
            (await ctx.db.get(proposal.originalAppointmentId))!.endTime -
            (await ctx.db.get(proposal.originalAppointmentId))!.startTime,
          updatedAt: now,
        });

        await ctx.db.patch(proposal.targetAppointmentId, {
          startTime: proposal.proposedTargetTime,
          endTime:
            proposal.proposedTargetTime +
            (await ctx.db.get(proposal.targetAppointmentId))!.endTime -
            (await ctx.db.get(proposal.targetAppointmentId))!.startTime,
          updatedAt: now,
        });

        // עדכון סטטוס ההצעה
        await ctx.db.patch(args.swapProposalId, {
          status: 'accepted',
          updatedAt: now,
        });

        return { success: true, action: 'swapped' };
      }
    }

    throw new Error('Invalid proposal state');
  },
});
