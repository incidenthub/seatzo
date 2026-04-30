import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import PendingUser from '../models/pendingUser.model.js';
import { sendOTPEmail } from '../config/email.js';
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

    // Overwrite any existing pending registration for this email
    await PendingUser.deleteMany({ email });

    await PendingUser.create({
      name,
      email,
      password,
      role: assignedRole,
      otp,
    });

    await sendOTPEmail(email, name, otp);

    res.status(201).json({
      message: 'Account pending. Check your email for the OTP to complete registration.',
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

    // Also check if they are already fully verified
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered and verified' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ error: 'Registration session expired or invalid. Please register again.' });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP matches, create the actual user
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // Pre-save hook will hash it now
      role: pendingUser.role,
      isVerified: true,
    });

    // Clean up pending user
    await PendingUser.deleteMany({ email });

    res.json({ message: 'Email verified successfully. Account created!' });
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

    // Email verification check removed as requested


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

    // Email sending removed as requested
    console.log(`[Forgot Password] OTP for ${email}: ${otp}`);


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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(404).json({ error: 'No pending registration found. Please register again.' });
    }

    // Throttle check
    const timeLeft = pendingUser.createdAt.getTime() + 15 * 60 * 1000 - Date.now();
    // Only allow resend if it's been at least 2 minutes
    if (timeLeft > 13 * 60 * 1000) {
      return res.status(429).json({
        error: 'OTP recently sent. Please wait before requesting another.',
      });
    }

    const otp = generateOTP();
    pendingUser.otp = otp;
    await pendingUser.save();

    await sendOTPEmail(email, pendingUser.name, otp);

    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};