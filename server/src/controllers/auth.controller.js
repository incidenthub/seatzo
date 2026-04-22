import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../config/email.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const setRefreshCookie = (res, token) =>
  res.cookie('refreshToken', token, COOKIE_OPTIONS);

const clearRefreshCookie = (res) =>
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

const normalizeEmail = (email) => email.trim().toLowerCase();

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { name, email: rawEmail, password, role } = req.body;
    const email = normalizeEmail(rawEmail || '');

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Prevent self-assigning admin
    const assignedRole = role === 'admin' ? 'customer' : (role || 'customer');

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name,
      email,
      password, // hashed by pre-save hook
      role: assignedRole,
      otp,
      otpExpiresAt,
    });

    await sendOTPEmail(email, name, otp);

    res.status(201).json({
      message: 'Account created. Check your email for the OTP.',
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req, res) => {
  try {
    const { email: rawEmail, otp } = req.body;
    const email = normalizeEmail(rawEmail || '');

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiresAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = normalizeEmail(rawEmail || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Email not verified. Check your inbox for the OTP.',
      });
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Rotate both tokens on each refresh
    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: 'Logged out successfully' });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = normalizeEmail(rawEmail || '');

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always respond the same — don't reveal whether email exists
    const genericResponse = {
      message: 'If that email is registered, an OTP has been sent.',
    };

    if (!user) return res.json(genericResponse);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, user.name, otp);

    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;
    const email = normalizeEmail(rawEmail || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiresAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    user.password = newPassword; // pre-save hook rehashes it
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Clear any active sessions by invalidating cookies
    clearRefreshCookie(res);

    res.json({ message: 'Password reset successfully. Please log in again.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export const resendOTP = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = normalizeEmail(rawEmail || '');

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Throttle: don't resend if current OTP still has more than 8 min left
    const timeLeft = user.otpExpiresAt - Date.now();
    if (timeLeft > 8 * 60 * 1000) {
      return res.status(429).json({
        error: 'OTP recently sent. Please wait before requesting another.',
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};