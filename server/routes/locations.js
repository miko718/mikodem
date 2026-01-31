import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as store from '../data/store.js';

const router = Router();

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

// Get locations for events (business dashboard - needs auth in real app)
router.get('/for-events', (req, res) => {
  const eventIds = req.query.ids?.split(',').filter(Boolean) || [];
  const locations = store.getLocationsForEvents(eventIds);
  res.json(locations);
});

// Set business location (for distance calc)
router.post('/business', (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'נדרשים קו רוחב וקו אורך' });
  }
  const loc = store.setBusinessLocation(parseFloat(lat), parseFloat(lng));
  res.json(loc);
});

router.get('/business', (req, res) => {
  const loc = store.getBusinessLocation();
  res.json(loc || {});
});

export default router;
