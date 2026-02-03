import { Router } from 'express';
import passport from 'passport';
import { signToken } from '../middleware/jwtAuth.js';

const router = Router();
const hasGoogleCredentials = !!process.env.GOOGLE_CLIENT_ID;

router.get('/google', (req, res, next) => {
  if (!hasGoogleCredentials) {
    const isExpo = req.query.client === 'expo';
    const redirect = isExpo ? 'mikodem://login?error=no_google_credentials' : 'http://localhost:5173/login?error=no_google_credentials';
    return res.redirect(redirect);
  }
  const isExpo = req.query.client === 'expo';
  passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
    state: isExpo ? 'expo' : undefined,
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    const state = req.query.state;
    if (state === 'expo') {
      const token = signToken(req.user);
      return res.redirect(`mikodem://auth/callback?token=${encodeURIComponent(token)}`);
    }
    res.redirect('http://localhost:5173/dashboard');
  }
);

router.get('/me', (req, res) => {
  const authenticated = typeof req.isAuthenticated === 'function' ? req.isAuthenticated() : !!req.user;
  if (!authenticated || !req.user) {
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
