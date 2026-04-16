import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Landing Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OrganizerRegister = lazy(() => import('./pages/OrganizerRegister'));
const OrganizerLogin = lazy(() => import('./pages/OrganizerLogin'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Event Pages
const EventListings = lazy(() => import('./pages/EventListings'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));

// Dashboard Pages
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));

import AuthModal from './components/Auth/AuthModal';

function App() {
  return (
    <div className="min-h-screen bg-surface grain">
      <AuthModal />
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          {/* Landing & Info Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/organizer-register" element={<OrganizerRegister />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Event Routes */}
          <Route path="/events" element={<EventListings />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/book/:bookingId" element={<BookingPage />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />

          {/* Dashboard Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
