import { httpRouter } from 'convex/server';
import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { auth } from './auth';

const http = httpRouter();

// הגדרת נתיבי HTTP עבור אימות (Convex Auth)
// זה מאפשר ביצוע פעולות אימות דרך HTTP Endpoints
auth.addHttpRoutes(http);

// HTTP Endpoint להרצת חישוב ETA (לבדיקה/ניפוי באגים)
// בפרודקשן זה צריך לרוץ דרך Convex Scheduled Functions
http.route({
  path: '/calculate-etas',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // בדיקת API key (אופציונלי - רק לפרודקשן)
    const apiKey = request.headers.get('x-api-key');
    if (
      process.env.INTERNAL_API_KEY &&
      apiKey !== process.env.INTERNAL_API_KEY
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      const result = await ctx.runAction(
        internal.scheduled.calculateETAsForUpcomingAppointments,
        {}
      );
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error calculating ETAs:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }),
});

export default http;
