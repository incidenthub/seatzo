import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// ─── Protect ──────────────────────────────────────────────────────────────────
// Validates the access token from the Authorization header.
// Attaches req.user for downstream handlers.

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password -otp -otpExpiresAt');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Require Role ─────────────────────────────────────────────────────────────
// Usage: requireRole('admin') or requireRole('admin', 'organiser')

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};

// ─── Optional Auth ────────────────────────────────────────────────────────────
// For routes that work for both guests and logged-in users.
// Attaches req.user if a valid token is present, but never blocks.

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password -otp -otpExpiresAt');
  } catch {
    // silently ignore invalid/expired tokens
  }
  next();
};