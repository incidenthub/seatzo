import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

const RoleGuard = ({ allowedRoles, unauthenticatedTo, unauthorizedTo, children }) => {
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to={unauthenticatedTo} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectPath = typeof unauthorizedTo === 'function' ? unauthorizedTo(user) : unauthorizedTo;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const STAFF_PATHS = ['/admin-dashboard', '/organizer-dashboard'];

const isStaffPath = (pathname = '') => STAFF_PATHS.some((staffPath) => pathname === staffPath || pathname.startsWith(`${staffPath}/`));

const AdminRouteLock = () => {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminUser = Boolean(token && user?.role === 'admin');
  const isAllowedPath = isStaffPath(location.pathname);

  useEffect(() => {
    if (!isAdminUser || !isAllowedPath) {
      return undefined;
    }

    const blockBackwardNavigation = () => {
      if (!isStaffPath(window.location.pathname)) {
        navigate('/admin-dashboard', { replace: true });
      }
    };

    window.addEventListener('popstate', blockBackwardNavigation);

    return () => window.removeEventListener('popstate', blockBackwardNavigation);
  }, [isAdminUser, isAllowedPath, navigate]);

  if (isAdminUser && !isAllowedPath) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return null;
};

function App() {
  return (
    <div className="min-h-screen bg-surface grain">
      <AuthModal />
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <AdminRouteLock />
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
          <Route path="/events/:id/book" element={<BookingPage />} />
          <Route path="/events/:id/book/:bookingId" element={<BookingPage />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />

          {/* Dashboard Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/organizer-dashboard"
            element={
              <RoleGuard
                allowedRoles={['organiser', 'admin']}
                unauthenticatedTo="/organizer-login"
                unauthorizedTo="/"
              >
                <OrganizerDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <RoleGuard
                allowedRoles={['admin']}
                unauthenticatedTo="/login"
                unauthorizedTo={(currentUser) => (currentUser?.role === 'organiser' ? '/organizer-dashboard' : '/')}
              >
                <AdminDashboard />
              </RoleGuard>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
