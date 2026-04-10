# TicketFlow Frontend — Quick Reference Guide

**For Person C**  
**Frontend Phase (Weeks 1-2)**

---

## 🚀 Quick Start Commands

### Day 1: Initial Setup

```bash
# Install dependencies
npm install react-router-dom axios zustand @stripe/react-stripe-js @stripe/js

# Optional but recommended (for styling, UI, etc.)
npm install tailwindcss @tailwindcss/forms
npm install react-toastify  # For notifications
npm install zod  # For form validation

# Start dev server
npm run dev  # http://localhost:5173

# Build for production
npm run build
npm run preview  # Preview production build locally
```

---

## 📋 File Template: AuthContext.jsx (Day 2)

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/auth.service';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in (on mount)
  useEffect(() => {
    if (token) {
      // Optionally verify token with backend
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user, token } = await loginUser(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user, token } = await registerUser(name, email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
```

---

## 📋 File Template: axios.js (Day 2)

```jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { token } = response.data;
        localStorage.setItem('token', token);
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 📋 File Template: Login.jsx (Day 3)

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/events');
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
```

---

## 📋 File Template: EventListings.jsx (Day 4)

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEvents } from '../services/event.service';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EventListings() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllEvents({ search: searchTerm });
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setIsLoading(true);
    fetchEvents();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="events-container">
      <h1>Browse Events</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={handleSearchSubmit}>Search</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="events-grid">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onClick={() => navigate(`/events/${event._id}`)}
          />
        ))}
      </div>

      {events.length === 0 && <p>No events found</p>}
    </div>
  );
}
```

---

## 📋 File Template: SeatGrid.jsx (Day 5)

```jsx
import { useEffect, useState } from 'react';
import { getEventSeats, lockSeat, unlockSeat } from '../services/booking.service';
import './SeatGrid.css';

export default function SeatGrid({ eventId, onSeatsSelected }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
    return () => {
      // Unlock all seats on component unmount
      selectedSeats.forEach(seatId => unlockSeat(eventId, seatId));
    };
  }, [eventId]);

  const fetchSeats = async () => {
    try {
      setIsLoading(true);
      const data = await getEventSeats(eventId);
      setSeats(data);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatClick = async (seatId, seat) => {
    if (seat.status === 'BOOKED') return;

    if (selectedSeats.includes(seatId)) {
      // Deselect
      await unlockSeat(eventId, seatId);
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      // Select
      await lockSeat(eventId, seatId);
      setSelectedSeats([...selectedSeats, seatId]);
    }

    onSeatsSelected(selectedSeats);
  };

  if (isLoading) return <div>Loading seats...</div>;

  return (
    <div className="seat-grid">
      {seats.map((seat) => (
        <div
          key={seat._id}
          className={`seat seat-${seat.section} seat-${seat.status} ${
            selectedSeats.includes(seat._id) ? 'selected' : ''
          }`}
          onClick={() => handleSeatClick(seat._id, seat)}
          title={`${seat.section} - ${seat.seatNumber}`}
        >
          {seat.seatNumber}
        </div>
      ))}
    </div>
  );
}
```

---

## 📋 File Template: PaymentForm.jsx (Day 6)

```jsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function PaymentForm({ onPaymentSuccess, isProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleCardChange = (e) => {
    if (e.error) {
      setCardError(e.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: fullName, email },
    });

    if (result.error) {
      setCardError(result.error.message);
    } else {
      onPaymentSuccess(result.paymentMethod);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isProcessing}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isProcessing}
        />
      </div>

      <div className="form-group">
        <label>Card Details</label>
        <CardElement
          onChange={handleCardChange}
          disabled={isProcessing}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {cardError && <div className="error">{cardError}</div>}

      <button type="submit" disabled={isProcessing || !stripe}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

---

## 📋 File Template: App.jsx (All Days)

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/js';
import { Elements } from '@stripe/react-stripe-js';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EventListings from './pages/EventListings';
import EventDetail from './pages/EventDetail';
import Checkout from './pages/Checkout';
import BookingConfirmation from './pages/BookingConfirmation';
import UserDashboard from './pages/UserDashboard';
import BookingDetail from './pages/BookingDetail';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export default function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/events" element={<EventListings />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation/:bookingId" element={<BookingConfirmation />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/bookings/:id" element={<BookingDetail />} />
            </Route>

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/events" />} />
          </Routes>
        </Router>
      </Elements>
    </AuthProvider>
  );
}
```

---

## 📋 .env.local Template

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Stripe Configuration
VITE_STRIPE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# Feature Flags (optional)
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_ANALYTICS=true
```

---

## 📋 ProtectedRoute Component (Day 2)

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

---

## 📋 Payment Service Template (Days 6-7)

```jsx
// src/services/payment.service.js
import apiClient from '../config/axios';

export async function createPaymentIntent(bookingId) {
  const idempotencyKey = `${bookingId}_${Date.now()}_${Math.random()}`;
  localStorage.setItem(`idempotency_${bookingId}`, idempotencyKey);

  const response = await apiClient.post('/payments/create', {
    bookingId,
    idempotencyKey,
  });

  return response.data;
}

export async function getPaymentStatus(paymentId) {
  const response = await apiClient.get(`/payments/${paymentId}/status`);
  return response.data;
}

export async function refundPayment(paymentId) {
  const response = await apiClient.post(`/payments/${paymentId}/refund`);
  return response.data;
}
```

---

## API Integration Checklist

**Before you start each page, verify the backend endpoint is ready:**

| Endpoint | Used In | Status |
|----------|---------|--------|
| POST /api/auth/register | Day 3 | ✅ |
| POST /api/auth/login | Day 3 | ✅ |
| GET /api/events | Day 4 | ⏱️ |
| GET /api/events/:id | Day 4 | ⏱️ |
| GET /api/events/:id/seats | Day 5 | ⏱️ |
| POST /api/seats/lock | Day 5 | ⏱️ |
| DELETE /api/seats/lock | Day 5 | ⏱️ |
| POST /api/bookings | Day 7 | ⏱️ |
| POST /api/payments/create | Day 7 | ✅ |
| GET /api/payments/:id/status | Day 7 | ✅ |
| GET /api/bookings/:id | Day 8 | ⏱️ |
| GET /api/bookings | Day 9 | ⏱️ |
| POST /api/payments/:id/refund | Day 9 | ✅ |

---

## CSS Starter (Day 1-10)

```css
/* src/styles/index.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #3b82f6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --dark: #1f2937;
  --light: #f3f4f6;
  --bg: #ffffff;
  --text: #111827;
  --border: #e5e7eb;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.error {
  color: var(--danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message {
  background-color: #fee2e2;
  color: var(--danger);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.success-message {
  background-color: #dcfce7;
  color: var(--success);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}
```

---

## Common Mistakes to Avoid

1. ❌ Forgetting `express.raw()` on backend for Stripe webhooks
2. ❌ Not storing token in localStorage (will lose auth on page refresh)
3. ❌ Not implementing error boundaries (app crashes on API errors)
4. ❌ Forgetting to release seat locks on component unmount
5. ❌ Using `alert()` instead of toast notifications
6. ❌ Not validating user input on frontend (and backend)
7. ❌ Hardcoding API URLs instead of using .env
8. ❌ Not handling loading states (confuses users if slow)
9. ❌ Forgetting CORS headers on backend
10. ❌ Not testing on mobile before claiming done

---

## Debugging Tips

### Issue: Token not persisting after page refresh
**Solution:** Make sure localStorage is being set in AuthContext
```jsx
// In Login/Register
localStorage.setItem('token', token);
```

### Issue: Stripe payment always fails
**Solution:** Check if environment variable is set
```bash
echo $VITE_STRIPE_KEY  # Should output: pk_test_...
```

### Issue: CORS errors when calling backend
**Solution:** Check backend has CORS headers
```javascript
// Backend (Express)
app.use(cors());
// OR
app.use(cors({ origin: 'http://localhost:5173' }));
```

### Issue: Seats not locking/unlocking
**Solution:** Check if locks are being released
```jsx
// In SeatGrid cleanup
useEffect(() => {
  return () => {
    selectedSeats.forEach(seatId => unlockSeat(eventId, seatId));
  };
}, []);
```

---

## Performance Tips

- Use React.memo for EventCard components to prevent re-renders
- Implement code splitting with React.lazy()
- Use useCallback for handlers passed to child components
- Load images lazily (intersection observer or img loading="lazy")
- Debounce search input (delay API calls)

---

## Testing Script (Day 10)

```javascript
// Before deployment, run through this
const testScripts = [
  '1. Register with new email → should succeed',
  '2. Login with credentials → should store token',
  '3. Browse 5+ events → should load quickly',
  '4. Select event and 3 seats → should lock seats',
  '5. Proceed to checkout →  should show pricing',
  '6. Pay with 4242... card → should succeed',
  '7. See confirmation page → should show booking ref',
  '8. Go to dashboard → should show booking',
  '9. Cancel booking → should remove from list',
  '10. Logout → should redirect to login',
  '11. Test on mobile Safari → should be responsive',
  '12. Check Lighthouse → should score > 80',
];
```

---

Good luck! You've got this! 🚀
