import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

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

// Organiser
import OrganiserLayout from "./pages/organiser/OrganiserLayout";
import MyEvents from "./pages/organiser/MyEvents";
import CreateEvent from "./pages/organiser/CreateEvent";
import EditEvent from "./pages/organiser/EditEvent";
import EventAnalytics from "./pages/organiser/EventAnalytics";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fff",
              border: "1px solid #27272a",
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
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
