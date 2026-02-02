import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as store from '../data/store.js';

const router = Router();

// Middleware לאימות משתמשים (רק לבעל העסק)
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'נדרשת התחברות' });
  }
  next();
}

// Client responds: postpone or reschedule (no auth - public endpoint)
router.post('/late-response/:eventId', (req, res) => {
  const { eventId } = req.params;
  const { choice } = req.body;
  if (!['postpone', 'reschedule'].includes(choice)) {
    return res.status(400).json({ error: 'בחירה לא תקינה' });
  }
  const resp = store.setLateResponse(eventId, choice);
  res.json({ success: true, response: resp });
});

// Client shares location (no auth - via unique link)
router.post('/share/:eventId', (req, res) => {
  const { eventId } = req.params;
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'נדרשים קו רוחב וקו אורך' });
  }

  const location = store.setClientLocation(eventId, {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    clientId: req.body.clientId || uuidv4()
  });
  res.json({ success: true, location });
});

// Get locations for events (business dashboard - requires auth)
router.get('/for-events', requireAuth, (req, res) => {
  const eventIds = req.query.ids?.split(',').filter(Boolean) || [];
  const locations = store.getLocationsForEvents(eventIds);
  res.json(locations);
});

// Set business location (for distance calc) - requires auth
router.post('/business', requireAuth, (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'נדרשים קו רוחב וקו אורך' });
  }
  const loc = store.setBusinessLocation(parseFloat(lat), parseFloat(lng));
  res.json(loc);
});

router.get('/business', requireAuth, (req, res) => {
  const loc = store.getBusinessLocation();
  res.json(loc || {});
});

// Get late responses for events (business dashboard) - requires auth
router.get('/late-responses', requireAuth, (req, res) => {
  const eventIds = req.query.ids?.split(',').filter(Boolean) || [];
  const result = {};
  eventIds.forEach(id => {
    const resp = store.getLateResponse(id);
    if (resp) result[id] = resp;
  });
  res.json(result);
});

export default router;
