import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import calendarRoutes from './routes/calendar.js';
import locationRoutes from './routes/locations.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Session for Google OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'mikodem-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/api/auth/google/callback`,
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
}, (accessToken, refreshToken, profile, done) => {
  done(null, { profile, accessToken, refreshToken });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/locations', locationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 mikodem server running on http://localhost:${PORT}`);
});
