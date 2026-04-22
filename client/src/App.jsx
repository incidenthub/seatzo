import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />

          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/events" element={<EventListings />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/checkout" element={
                  <ProtectedRoute><Checkout /></ProtectedRoute>
                } />
                <Route path="/booking-confirmation" element={
                  <ProtectedRoute><BookingConfirmation /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute><UserDashboard /></ProtectedRoute>
                } />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;