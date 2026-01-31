import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/google', passport.authenticate('google', { 
  accessType: 'offline', 
  prompt: 'consent',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard');
  }
);

router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'לא מחובר' });
  }
  res.json(req.user);
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'שגיאה ביציאה' });
    res.json({ success: true });
  });
});

export default router;
