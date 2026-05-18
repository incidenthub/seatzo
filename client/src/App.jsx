import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import EventListings from "./pages/EventListings";
import EventDetail from "./pages/EventDetail";
import Checkout from "./pages/Checkout";
import BookingConfirmation from "./pages/BookingConfirmation";
import UserDashboard from "./pages/UserDashboard";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Organiser
import OrganiserLayout from "./pages/organiser/OrganiserLayout";
import MyEvents from "./pages/organiser/MyEvents";
import CreateEvent from "./pages/organiser/CreateEvent";
import EditEvent from "./pages/organiser/EditEvent";
import EventAnalytics from "./pages/organiser/EventAnalytics";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerifyOrganisers from "./pages/admin/VerifyOrganisers";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageEvents from "./pages/admin/ManageEvents";

const App = () => {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "12px",
              padding: "12px 16px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
          }}
        />
        <Routes>
          {/* ── Auth pages — no navbar, no footer ── */}
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />

          {/* ── Organiser pages — own layout (sidebar), no Navbar/Footer ── */}
          <Route
            element={<ProtectedRoute allowedRoles={["organiser", "admin"]} />}
          >
            <Route element={<OrganiserLayout />}>
              <Route path="/organiser/events" element={<MyEvents />} />
              <Route
                path="/organiser/events/create"
                element={<CreateEvent />}
              />
              <Route
                path="/organiser/events/:id/edit"
                element={<EditEvent />}
              />
              <Route
                path="/organiser/events/:id/analytics"
                element={<EventAnalytics />}
              />
            </Route>
          </Route>

          {/* ── Admin pages — own layout ── */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/verify-organisers" element={<VerifyOrganisers />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/events" element={<ManageEvents />} />
            </Route>
          </Route>

          {/* ── App pages — with Navbar and Footer ── */}
          <Route
            element={
              <>
                <Navbar />
                <Outlet />
                <Footer />
              </>
            }
          >
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<EventListings />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-confirmation"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/help" element={<Help />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;