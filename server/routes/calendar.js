import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

const THIRTY_MINUTES = 30 * 60 * 1000;

function ensureAuth(req, res, next) {
  const authenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : !!req.user;
  if (!authenticated || !req.user?.accessToken) {
    return res.status(401).json({ error: 'יש להתחבר עם Google' });
  }
  next();
}

router.use(ensureAuth);

router.get('/events', async (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: req.user.accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const now = new Date();
    const windowStart = new Date(now.getTime() - 15 * 60 * 1000); // 15 min ago
    const windowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours ahead

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = (data.items || []).map(event => {
      const start = new Date(event.start?.dateTime || event.start?.date);
      const end = new Date(event.end?.dateTime || event.end?.date);

      return {
        id: event.id,
        summary: event.summary || 'פגישה ללא כותרת',
        start: start.toISOString(),
        end: end.toISOString(),
        attendees: event.attendees?.map(a => a.email) || [],
        inLocationWindow: start.getTime() - now.getTime() <= THIRTY_MINUTES && start.getTime() >= now.getTime() - 60000
      };
    });

    res.json(events);
  } catch (err) {
    console.error('Calendar error:', err);
    res.status(500).json({ error: 'שגיאה בטעינת לוח השנה' });
  }
});

export default router;
