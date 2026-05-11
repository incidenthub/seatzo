import { Link } from "react-router-dom";
import Logo from "../components/Logo"

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-gray-200 dark:border-white/5 transition-colors duration-200">

      {/* Top CTA Strip */}
      <div className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <span className="text-rose-500 text-lg">🎟</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                List your event
              </h3>

              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Reach thousands of users with Seatzo
              </p>
            </div>
          </div>

          <Link
            to="/register"
            className="md:ml-auto text-sm font-black text-white bg-rose-500 hover:bg-rose-400 px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(248,68,100,0.35)] hover:-translate-y-px active:scale-95"
          >
            Start Selling
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-10">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr] gap-12">
          {/* Brand */}
          <div>
           <Link to="/">
  <Logo className="h-10 w-auto" />
</Link>

            <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-neutral-400 max-w-[320px]">
              Discover movies, concerts, comedy shows, sports events, and live experiences across India.
            </p>
          </div>

         

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>

            <div className="flex flex-col gap-3">
              <Link to="/events" className="footer-link">
                Browse Events
              </Link>

              <Link to="/dashboard" className="footer-link">
                My Bookings
              </Link>


              <Link to="/login" className="footer-link">
                Sign In
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Support
            </h4>

<div className="flex flex-col gap-3">
              <Link to="/help" className="footer-link">Help & FAQ</Link>
              <Link to="/contact" className="footer-link">Contact Us</Link>
              <Link to="/terms" className="footer-link">Terms & Conditions</Link>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-5 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-5">

          {/* Socials */}
          <div className="flex items-center gap-2">

            {/* Facebook */}
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-rose-500 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.99A10 10 0 0022 12z"/>
              </svg>
            </a>

            {/* Twitter/X */}
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-rose-500 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.9 2H22l-6.77 7.74L23 22h-6.1l-4.78-6.24L6.66 22H3.55l7.24-8.27L1 2h6.25l4.32 5.71L18.9 2zm-1.07 18h1.69L6.33 3.9H4.52L17.83 20z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-rose-500 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0 2h10c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3zm11.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="#"
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-rose-500 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.7 31.7 0 000 12a31.7 31.7 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.7 31.7 0 0024 12a31.7 31.7 0 00-.5-5.8zM9.75 15.5v-7l6 3.5-6 3.5z"/>
              </svg>
            </a>
          </div>

          <p className="text-xs text-gray-400 dark:text-neutral-500 text-center">
            © 2026 Seatzo Entertainment Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>

      {/* Shared Footer Link Style */}
      <style>{`
        .footer-link {
          font-size: 14px;
          color: rgb(107 114 128);
          transition: all 0.2s;
          text-decoration: none;
          width: fit-content;
        }

        .dark .footer-link {
          color: rgb(163 163 163);
        }

        .footer-link:hover {
          color: rgb(244 63 94);
          transform: translateX(2px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;