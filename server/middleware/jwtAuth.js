import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'mikodem-secret';

/**
 * If Authorization: Bearer <token> is present, verify JWT and set req.user.
 * Used by Expo app (no cookies).
 */
export function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.isAuthenticated = () => true;
    next();
  } catch {
    next();
  }
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
