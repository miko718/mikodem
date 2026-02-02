import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';

// פונקציה פנימית לחישוב ETA עם Google Maps Directions API
export const calculateETA = internalAction({
  args: {
    originLat: v.number(),
    originLng: v.number(),
    destinationLat: v.number(),
    destinationLng: v.number(),
    mode: v.optional(
      v.union(v.literal('walking'), v.literal('driving'), v.literal('transit'))
    ),
  },
  handler: async (ctx, args) => {
    const mode = args.mode || 'driving';
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY not configured');
    }

    // המרת mode ל-Google Maps format
    const googleMode =
      mode === 'walking'
        ? 'walking'
        : mode === 'transit'
          ? 'transit'
          : 'driving';

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${args.originLat},${args.originLng}&destination=${args.destinationLat},${args.destinationLng}&mode=${googleMode}&key=${apiKey}&language=he&traffic_model=best_guess&departure_time=now`;

    try {
      const response = await fetch(url);
      const data = (await response.json()) as {
        routes?: Array<{
          legs?: Array<{
            duration?: { value: number }; // בשניות
            distance?: { value: number }; // במטרים
          }>;
        }>;
        status?: string;
        error_message?: string;
      };

      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        console.error(
          'Google Maps API error:',
          data.error_message || data.status
        );
        // Fallback: חישוב מרחק ישר (Haversine)
        return calculateHaversineDistance(
          args.originLat,
          args.originLng,
          args.destinationLat,
          args.destinationLng,
          mode
        );
      }

      const route = data.routes[0];
      const leg = route.legs?.[0];

      if (!leg || !leg.duration) {
        return calculateHaversineDistance(
          args.originLat,
          args.originLng,
          args.destinationLat,
          args.destinationLng,
          mode
        );
      }

      const durationSeconds = leg.duration.value;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      const distanceMeters = leg.distance?.value || 0;
      const distanceKm = distanceMeters / 1000;

      return {
        etaMinutes: durationMinutes,
        distanceKm,
      };
    } catch (error) {
      console.error('Error calculating ETA:', error);
      // Fallback: חישוב מרחק ישר
      return calculateHaversineDistance(
        args.originLat,
        args.originLng,
        args.destinationLat,
        args.destinationLng,
        mode
      );
    }
  },
});

// פונקציה עזר לחישוב מרחק ישר (Haversine) - Fallback
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  mode: 'walking' | 'driving' | 'transit'
): { etaMinutes: number; distanceKm: number } {
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
  const distanceKm = R * c;

  // חישוב זמן משוער לפי אמצעי תחבורה
  let speedKmh = 50; // ברירת מחדל: רכב
  if (mode === 'walking') {
    speedKmh = 5; // הליכה: 5 קמ"ש
  } else if (mode === 'transit') {
    speedKmh = 30; // תחבורה ציבורית: 30 קמ"ש
  }

  const etaMinutes = Math.ceil((distanceKm / speedKmh) * 60);

  return { etaMinutes, distanceKm };
}

// פונקציה פנימית לעדכון ETA של פגישה
export const updateAppointmentETA = internalMutation({
  args: {
    appointmentId: v.id('appointments'),
    etaMinutes: v.number(),
    distanceKm: v.number(),
    clientLatitude: v.number(),
    clientLongitude: v.number(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const now = Date.now();

    // עדכון הפגישה
    await ctx.db.patch(args.appointmentId, {
      currentETA: args.etaMinutes,
      distanceFromBusiness: args.distanceKm,
      estimatedArrivalTime: args.etaMinutes,
      lastETACalculation: now,
      updatedAt: now,
    });

    // שמירת היסטוריית ETA
    await ctx.db.insert('etaHistory', {
      appointmentId: args.appointmentId,
      etaMinutes: args.etaMinutes,
      distanceKm: args.distanceKm,
      clientLatitude: args.clientLatitude,
      clientLongitude: args.clientLongitude,
      calculatedAt: now,
      createdAt: now,
    });

    return { success: true };
  },
});
