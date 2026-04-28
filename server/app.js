import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// ── Workers ─────────────────────────────────────────────────────────────────
import './src/workers/seatExpiryWorker.js';

// ── Middleware ──────────────────────────────────────────────────────────────
import requestId from './src/middleware/requestId.js';
import errorHandler from './src/middleware/errorHandler.js';

// ── Routes ─────────────────────────────────────────────────────────────────
import authRoutes from './src/routes/auth.routes.js';
import eventRoutes from './src/routes/event.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import webhookRoutes from './src/routes/webhook.routes.js';
import seatRoutes from "./src/routes/seat.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { getSeats } from './src/controllers/seatController.js';

const app = express();



// ─── Global Middleware ─────────────────────────────────────────────────────
// 1. Request ID — must be first so every log downstream can reference it
app.use(requestId);

// 2. CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Webhook Routes MUST come before express.json()
//    because Stripe requires the raw, unparsed body to securely verify the signature.
app.use('/api/webhooks', webhookRoutes);

// 4. Body parsing
//    All other routes parse the body into JSON.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Cookie parser
app.use(cookieParser());

// 6. HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'TicketFlow API running' });
});

// ─── App Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.get('/api/events/:eventId/seats', getSeats);
app.use('/api/events', eventRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/seats', seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

// ─── Global Error Handler (must be last) ───────────────────────────────────
app.use(errorHandler);

export default app;