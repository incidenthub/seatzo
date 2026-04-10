# TicketFlow Frontend — 2-Week Implementation Plan (Person C)

**Duration:** 10 Business Days (2 Weeks)  
**Stack:** React 19, Vite, Axios, Stripe Elements, React Router  
**Phase:** Full User-Facing App Flow  
**Status:** Backend Payment Complete ✅

---

## Overview: What You're Building

```
User Journey:
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│ Register│ -> │  Login   │ -> │ Browse  │ -> │ Checkout │ -> │Confirmed │
└─────────┘    └──────────┘    │ Events  │    └──────────┘    └──────────┘
                                └─────────┘
                                    │
                                    └-> Dashboard (View Bookings)
```

**Your Deliverables:**
- [x] Auth system (Register + Login)
- [ ] Event browsing & filtering
- [ ] Seat selection with live pricing
- [ ] Stripe payment integration
- [ ] Booking confirmation page
- [ ] User dashboard with booking history

---

## Week 1: Foundation & Core Pages (Days 1-5)

### **Day 1: Project Setup & Architecture** 
**Goal:** Get React project ready for feature development

**Tasks:**
1. **Install dependencies**
   - [x] react-router-dom
   - [x] axios
   - [x] redux + saga (substituted for zustand)
   - [x] @stripe/react-stripe-js @stripe/js

2. **Project structure setup**
   - [x] Folder structure created

3. **Create global config files**
   - [x] src/services/api.js (Axios interceptors)
   - [x] src/config/stripe.js
   - [x] src/config/constants.js

4. **Set up Vite environment**
   - [x] .env.local

**Deliverables:**
- [x] All dependencies installed
- [x] Folder structure created
- [x] Config files in place
- [x] Dev server runs without errors

**Definition of Done:**
```bash
npm run dev  # No errors, server runs on localhost:5173
```

---

### **Day 2: Auth Context & Axios Setup**
**Goal:** Prepare shared services for auth-dependent pages

**Tasks:**
1. **Create Auth State (Redux)**
   - [x] src/store/slices/authSlice.js
   - [x] src/store/sagas/authSaga.js

2. **Axios interceptor setup**
   - [x] src/services/api.js (Headers & Refresh Logic)

3. **Auth API service**
   - [x] src/services/auth.service.js

4. **App.jsx structure**
   - [x] Redux Provider
   - [x] BrowserRouter
   - [x] Routing skeleton

**Deliverables:**
- [x] Auth state created and tested
- [x] Axios config with interceptors
- [x] Auth service functions working
- [x] App.jsx has routing skeleton

---

### **Day 3: Login & Register Pages**
**Goal:** Users can authenticate

**Tasks:**
1. **Create Login Page** (`src/pages/Login.jsx`)
   - [x] Form fields: Email, Password
   - [x] Error handling (display error messages)
   - [x] On success → redirect to `/events`
   - [x] Link to Register

2. **Create Register Page** (`src/pages/Register.jsx`)
   - [x] Form fields: Name, Email, Password, Confirm Password
   - [x] Validation: Email format, password strength
   - [x] On success → auto login or redirect to login
   - [x] Link to Login

3. **Create reusable UI components**
   - [x] src/components/Form/Input.jsx — Text input with validation
   - [x] src/components/Form/Button.jsx — Submit button with loading state
   - [x] src/components/Form/ErrorMessage.jsx — Error display

4. **Add routes**
   ```jsx
   <Route path="/login" element={<Login />} />
   <Route path="/register" element={<Register />} />
   <Route path="/" element={<Navigate to="/events" />} />
   ```

5. **Test with backend**
   - [x] API calls verified with Redux Sagas

**Deliverables:**
- [x] Login page functional
- [x] Register page functional
- [x] Form validation working
- [x] Authentication flows tested

---

### **Day 4: Event Listing & Event Detail Pages**
**Goal:** Users can browse and select events

**Tasks:**
1. **Create Event Listing Page** (`src/pages/EventListings.jsx`)
   - [x] Fetch `GET /api/events`
   - [x] Display: Event name, date, location, available seats, start price
   - [x] Filter/search by name or date (basic)
   - [x] Click event → go to `/events/:id`
   - [x] Responsive grid layout

2. **Create Event Detail Page** (`src/pages/EventDetail.jsx`)
   - [x] Fetch `GET /api/events/:id`
   - [x] Display: Full event info, description, organizer
   - [x] Button: "Select Seats" → goes to checkout
   - [x] Show seat sections (PREMIUM, GOLD, SILVER, GENERAL)
   - [x] Display pricing per section

3. **Create API service**
   - [x] File: `src/services/event.service.js`

4. **Reusable components**
   - [x] src/components/EventCard.jsx — Event preview card
   - [x] src/components/EventGallery.jsx — Grid of events
   - [x] src/components/UI/LoadingSpinner.jsx — Reusable loader

5. **Handle loading & error states**
   - [x] Show spinner while loading
   - [x] Show error message if API fails
   - [x] Implement retry logic

**Deliverables:**
- [x] Event list loads and displays correctly
- [x] Event detail page shows full info
- [x] Navigation between pages works
- [x] API calls verified

---

### **Day 5: Seat Selection & Pricing Display**
**Goal:** Users can interact with seat map and see live pricing

**Tasks:**
1. **Create SeatGrid Component** (`src/components/SeatGrid.jsx`)
   - Fetch seats from `GET /api/events/:id/seats`
   - Display seat map by section (PREMIUM, GOLD, SILVER, GENERAL)
   - Seat states: `AVAILABLE`, `BOOKED`, `LOCKED`
   - Visual feedback: Click to select, hover effects
   - Multi-select seats (add/remove from cart)

2. **Create Checkout Page** (`src/pages/Checkout.jsx`) — UI structure only
   - Left side: Selected seats summary
   - Right side: Order summary (seat count, pricing, total)
   - Calculate total from `calculatePrice(event)` service
   - "Proceed to Payment" button (not functional yet)

3. **Create Booking service**
   - File: `src/services/booking.service.js`
   - `createBooking(eventId, selectedSeats)`
   - `createPayment(bookingId, idempotencyKey)`
   - `getBookingStatus(bookingId)`

4. **Seat locking logic**
   - When user selects seat: `POST /api/seats/lock`
   - When user deselects seat: `DELETE /api/seats/lock`
   - When user leaves page: release all locks (cleanup)
   - Update seat UI in real-time

5. **Live pricing display**
   - Call pricing service after seat selection
   - Show breakdown: Base price, taxes, fees, total
   - Update in real-time as user adds/removes seats

**Deliverables:**
- ✅ Seat grid renders correctly
- ✅ Seat selection works
- ✅ Pricing updates dynamically
- ✅ Locks acquired/released on backend

---

## Week 2: Payment & Confirmation (Days 6-10)

### **Day 6: Stripe Integration Setup**
**Goal:** Stripe Elements ready to accept payment

**Tasks:**
1. **Initialize Stripe in App.jsx**
   ```jsx
   import { loadStripe } from '@stripe/js';
   import { Elements } from '@stripe/react-stripe-js';
   
   const stripePromise = loadStripe(process.env.VITE_STRIPE_KEY);
   
   <StripeProvider stripe={stripePromise}>
     {/* App */}
   </StripeProvider>
   ```

2. **Create Payment Method component** (`src/components/PaymentForm.jsx`)
   - Stripe CardElement for card input
   - Full name, email fields
   - Billing address (optional but recommended)
   - Stripe error handling

3. **Create Stripe service**
   - File: `src/services/stripe.service.js`
   - `createPaymentIntent(bookingId)` — Get clientSecret
   - `confirmPayment(clientSecret, paymentMethod)` — Confirm payment
   - `handlePaymentError(error)` — Parse Stripe errors

4. **Add Stripe Element styling**
   - Match app theme colors
   - Dark mode support if applicable
   - Mobile-responsive input sizes

5. **Test with Stripe test cards**
   - Success: `4242 4242 4242 4242`
   - Test 3D Secure, declines, etc.

**Deliverables:**
- ✅ Stripe Elements loaded
- ✅ PaymentForm component created
- ✅ CardElement renders correctly
- ✅ Test cards work

---

### **Day 7: Checkout Page — Full Implementation**
**Goal:** Complete checkout flow from cart to payment

**Tasks:**
1. **Expand Checkout page**
   - Left side: Seat summary + seat images/thumbnails if available
   - Center: Seat map (read-only, shows selected seats)
   - Right side: Order breakdown + PaymentForm component
   - Bottom: "Pay Now" button

2. **Checkout form state management**
   ```jsx
   const [checkout, setCheckout] = useState({
     eventId: null,
     selectedSeats: [],
     bookingId: null,
     totalPrice: 0,
     isProcessing: false,
     error: null
   });
   ```

3. **Payment flow**
   ```
   1. User clicks "Pay Now"
   2. Create booking: POST /api/bookings
   3. Get payment intent: POST /api/payments/create
   4. Show Stripe form
   5. User enters card
   6. Confirm payment with Stripe
   7. Stripe processes → webhook → backend confirms
   8. Redirect to confirmation page
   ```

4. **Handle idempotency**
   - Generate `idempotencyKey` (UUID) when creating payment
   - Store in localStorage: `bookingId_idempotencyKey`
   - Retry with same key if payment fails

5. **Error recovery**
   - If payment fails: display error message
   - Show "Retry Payment" button
   - Explain why payment failed (card declined, insufficient funds, etc.)

6. **Loading states**
   - Disable form while processing
   - Show spinner on submit button
   - Display progress: "Processing payment..."

**Deliverables:**
- ✅ Checkout page fully functional
- ✅ Payment form integrated
- ✅ Booking creation tested
- ✅ Payment confirmation tested

---

### **Day 8: Booking Confirmation Page**
**Goal:** Show users their payment succeeded and booking is confirmed

**Tasks:**
1. **Create Confirmation Page** (`src/pages/BookingConfirmation.jsx`)
   - Fetch booking by ID: `/api/bookings/:id`
   - Display: Booking reference, event details, seats, total paid
   - Show QR code if backend provides it
   - Show confirmation email sent message
   - Display: Booking date, event date

2. **Confirmation Page Structure**
   ```jsx
   <ConfirmationCard>
     <SuccessIcon />
     <h1>Booking Confirmed!</h1>
     <BookingDetails {...booking} />
     <QRCode value={booking.qrCode} />
     <div>A confirmation email has been sent to {user.email}</div>
     <Link to="/dashboard">View All Bookings</Link>
   </ConfirmationCard>
   ```

3. **Webhook polling (fallback)**
   - If backend webhook takes time, poll `GET /api/bookings/:id/status`
   - Show "Confirming your booking..." spinner
   - Once confirmed, show confirmation details

4. **Download booking details**
   - Button to download booking PDF if backend provides URL
   - Copy booking reference to clipboard

5. **Post-confirmation actions**
   - "View Dashboard" button → `/dashboard`
   - "Browse More Events" button → `/events`
   - "Share Booking" (social share, copy link)

**Deliverables:**
- ✅ Confirmation page displays correctly
- ✅ Booking details fetched and shown
- ✅ QR code renders
- ✅ Navigation options working

---

### **Day 9: User Dashboard & Booking History**
**Goal:** Users can view their bookings and booking details

**Tasks:**
1. **Create User Dashboard Page** (`src/pages/UserDashboard.jsx`)
   - Fetch user's bookings: `GET /api/bookings`
   - Filter: Upcoming, Past, Cancelled
   - Sort by date (newest first)
   - Display: Event name, date, seats, status, total paid

2. **Booking List Component** (`src/components/BookingList.jsx`)
   - Table or card layout
   - Each booking card shows:
     - Event name & date
     - Booking reference
     - Seats booked
     - Total price
     - Status badge (CONFIRMED, CANCELLED, PENDING, REFUNDED)
   - Click → view details page

3. **Create Booking Detail Page** (`src/pages/BookingDetail.jsx`)
   - Fetch `GET /api/bookings/:id`
   - Show full booking details
   - Display QR code / ticketfor entry
   - Actions:
     - "Download Ticket" (PDF if available)
     - "Cancel Booking" (if cancellable)
     - "Request Refund" (if refundable)
     - "Share Booking" (social share)

4. **Booking cancellation flow**
   - Confirm: "Are you sure you want to cancel?"
   - Call `POST /api/bookings/:id/cancel`
   - If refund needed: `POST /api/payments/:id/refund`
   - Update UI after cancellation

5. **Refund status tracking**
   - Show refund progress: "Refund Initiated", "Processing", "Completed"
   - Display refund amount and expected date

**Deliverables:**
- ✅ Dashboard loads and displays bookings
- ✅ Booking detail page functional
- ✅ Cancel booking works
- ✅ Refund flow visible

---

### **Day 10: Polish, Testing & Deployment Ready**
**Goal:** Production-ready frontend

**Tasks:**
1. **UI/UX Polish**
   - Responsive design: Mobile, tablet, desktop
   - Dark mode support (if applicable)
   - Loading skeletons (instead of spinners)
   - Better error messages
   - Accessibility: alt text, ARIA labels, keyboard navigation

2. **Performance optimization**
   - Code splitting: Lazy load pages with `React.lazy()`
   - Image optimization: Use WebP if available
   - Remove unused dependencies
   - Minify CSS/JS in production build

3. **Error handling & edge cases**
   - Session expired → redirect to login
   - Network errors → show retry message
   - User not authenticated → redirect to login
   - Invalid booking ID → show error

4. **Testing checklist**
   - ✅ Register flow end-to-end
   - ✅ Login with valid/invalid credentials
   - ✅ Browse events
   - ✅ Select seats (locks acquired)
   - ✅ Checkout with valid test card
   - ✅ Payment success → confirmation page
   - ✅ Payment failure → error message & retry
   - ✅ View bookings in dashboard
   - ✅ Cancel booking & refund
   - ✅ Logout
   - ✅ Responsive design on mobile

5. **Deployment**
   - Build: `npm run build` (generates `dist/` folder)
   - Deploy to Vercel, Netlify, or your host
   - Set production env vars
   - Test on production domain

6. **Documentation**
   - README with setup instructions
   - .env.example with all required variables
   - Component architecture diagram
   - API integration guide

**Deliverables:**
- ✅ All pages tested
- ✅ No console errors
- ✅ Responsive on all devices
- ✅ Production build created
- ✅ Deployed to live server

---

## Critical Dependencies on Backend

**Must be working before you start:**

| Endpoint | Status | Used In |
|----------|--------|---------|
| `POST /api/auth/register` | ✅ Assumed Complete | Day 3 |
| `POST /api/auth/login` | ✅ Assumed Complete | Day 3 |
| `GET /api/events` | ⏱️ Waiting on Person A | Day 4 |
| `GET /api/events/:id` | ⏱️ Waiting on Person A | Day 4 |
| `GET /api/events/:id/seats` | ⏱️ Waiting on Person B | Day 5 |
| `POST /api/seats/lock` | ⏱️ Waiting on Person B | Day 5 |
| `DELETE /api/seats/lock` | ⏱️ Waiting on Person B | Day 5 |
| `POST /api/bookings` | ⏱️ Waiting on Person A | Day 7 |
| `POST /api/payments/create` | ✅ You Built This | Day 7 |
| `POST /api/webhooks/stripe` | ✅ You Built This | Day 8 (Backend) |
| `GET /api/bookings` | ⏱️ Waiting on Person A | Day 9 |
| `GET /api/bookings/:id` | ⏱️ Waiting on Person A | Day 9 |

---

## Deliverables by End of Week 2

- ✅ Complete React app with all pages
- ✅ Authentication system (register, login, logout)
- ✅ Event browsing and filtering
- ✅ Seat selection with visual feedback
- ✅ Stripe Elements payment integration
- ✅ Booking confirmation flow
- ✅ User dashboard with booking history
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling throughout
- ✅ Production build ready to deploy

---

## Recommended Tech Stack Additions

- **State Management:** Zustand or Redux (for complex cart state)
- **UI Library:** TailwindCSS or Material-UI (for styling)
- **Date Picker:** React-DatePicker or similar (for event filtering)
- **Notifications:** React-Toastify (for success/error messages)
- **HTTP Caching:** React Query or SWR (for optimistic updates)

---

## File Structure Checklist

By end of Week 2, you should have:

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── EventListings.jsx
│   ├── EventDetail.jsx
│   ├── Checkout.jsx
│   ├── BookingConfirmation.jsx
│   ├── UserDashboard.jsx
│   └── BookingDetail.jsx
├── components/
│   ├── SeatGrid.jsx
│   ├── PaymentForm.jsx
│   ├── EventCard.jsx
│   ├── BookingList.jsx
│   ├── Form/
│   │   ├── Input.jsx
│   │   ├── Button.jsx
│   │   └── ErrorMessage.jsx
│   └── UI/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── LoadingSpinner.jsx
├── context/
│   └── AuthContext.jsx
├── services/
│   ├── axios.js
│   ├── auth.service.js
│   ├── event.service.js
│   ├── booking.service.js
│   ├── stripe.service.js
│   └── payment.service.js
├── hooks/
│   ├── useAuth.js
│   ├── useSeatPolling.js
│   └── useCheckout.js
├── config/
│   ├── stripe.js
│   ├── axios.js
│   └── constants.js
├── utils/
│   ├── formatting.js
│   ├── validation.js
│   └── errorHandler.js
├── styles/
│   ├── index.css
│   ├── pages.css
│   └── components.css
└── App.jsx
```

---

## Key Success Metrics

- **Performance:** Lighthouse score > 80
- **Usability:** Customer can complete booking in < 5 minutes
- **Reliability:** No unhandled errors in console
- **Mobile:** Works flawlessly on iOS/Android Chrome
- **Accessibility:** WCAG 2.1 Level AA compliance

---

## Next Steps (After 2 Weeks)

- Admin dashboard for organizers
- Event analytics and revenue tracking
- Advanced filters and search
- Wishlist/saved events
- Multi-seat discounts
- Booking modifications (seat changes)
- Email notifications for booking reminders

---

**Good luck! You've got this! 🚀**
