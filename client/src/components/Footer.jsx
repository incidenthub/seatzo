import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: '#09090b', borderTop: '1px solid rgba(255,255,255,0.07)', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .footer-link { color: #71717a; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-link:hover { color: #fafafa; }
        .footer-social { width: 36px; height: 36px; border-radius: 8px; background: #18181b; border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; transition: border-color 0.2s, background 0.2s; text-decoration: none; }
        .footer-social:hover { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.1); }
        .footer-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); color: #c084fc; padding: 4px 12px; border-radius: 100px; font-size: 12px; }
        .footer-badge-dot { width: 5px; height: 5px; background: #c084fc; border-radius: 50%; animation: footerPulse 2s infinite; }
        @keyframes footerPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* Main footer */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 48px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>

        {/* Brand column */}
        <div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#fafafa', letterSpacing: -0.5, marginBottom: 16 }}>
              Seat<span style={{ color: '#c084fc' }}>zo</span>
            </div>
          </Link>
          <p style={{ fontSize: 14, color: '#71717a', lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
            The modern event ticketing platform with real-time seat locking, dynamic pricing, and zero double bookings.
          </p>
          <div className="footer-badge">
            <div className="footer-badge-dot" />
            All systems operational
          </div>

          {/* Socials */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <a href="#" className="footer-social" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#a1a1aa">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <a href="#" className="footer-social" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#a1a1aa">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="footer-social" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#a1a1aa">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product links */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: '#fafafa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Product</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/events" className="footer-link">Browse Events</Link>
            <Link to="/register" className="footer-link">Create Account</Link>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/dashboard" className="footer-link">My Bookings</Link>
          </div>
        </div>

        {/* Company links */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: '#fafafa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Company</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Contact</a>
          </div>
        </div>

        {/* Legal links */}
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: '#fafafa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Legal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Refund Policy</a>
            <a href="#" className="footer-link">Cookie Policy</a>
          </div>
        </div>
      </div>

      {/* Tech stack strip */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 32px' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#52525b' }}>Built with</span>
            {['MongoDB', 'Express', 'React', 'Node.js', 'Redis', 'Stripe'].map((tech, i, arr) => (
              <span key={tech} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#52525b', background: '#18181b', border: '1px solid rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 100 }}>{tech}</span>
                {i < arr.length - 1 && <span style={{ color: '#3f3f46', fontSize: 10 }}>·</span>}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#52525b' }}>
            © 2026 Seatzo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;