import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: '#333545', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .footer-link { color: #bbbbbb; text-decoration: none; font-size: 13px; transition: color 0.2s; }
        .footer-link:hover { color: #fff; }
        .footer-social { width: 32px; height: 32px; border-radius: 50%; background: #404251; display: flex; align-items: center; justify-content: center; transition: background 0.2s; text-decoration: none; }
        .footer-social:hover { background: #f84464; }
      `}</style>

      {/* Corporate Strip */}
      <div style={{ background: '#2b2d3d', padding: '12px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', px: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <img src="https://in.bmscdn.com/webin/common/icons/hut.svg" alt="" style={{ width: 24 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fafafa' }}>List your Show</span>
          <span style={{ fontSize: 12, color: '#999' }}>Got a show, event, activity or a great experience? Partner with us & get listed</span>
          <Link to="/register" style={{ background: '#f84464', color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, textDecoration: 'none', marginLeft: 'auto' }}>Contact today!</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>
              <span style={{ color: '#f84464' }}>S</span>EATZO
            </div>
            <p style={{ fontSize: 13, color: '#999', lineHeight: 1.6 }}>
              India's leading entertainment destination. From the latest movies to the biggest concerts, find everything here.
            </p>
          </div>

          {/* Categories */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/events?category=movie" className="footer-link">Movies</Link>
              <Link to="/events?category=music" className="footer-link">Music</Link>
              <Link to="/events?category=sports" className="footer-link">Sports</Link>
              <Link to="/events?category=comedy" className="footer-link">Comedy</Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/events" className="footer-link">Browse All</Link>
              <Link to="/dashboard" className="footer-link">My Bookings</Link>
              <Link to="/organiser/events" className="footer-link">List Event</Link>
              <Link to="/login" className="footer-link">Sign In</Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Help</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#" className="footer-link">FAQs</a>
              <a href="#" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Terms & Conditions</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
          </div>
        </div>

        {/* Socials & Copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 48, paddingTop: 32, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
             {/* Simple Icon Placeholders */}
            <a href="#" className="footer-social"><span style={{ color: '#fff', fontSize: 14 }}>f</span></a>
            <a href="#" className="footer-social"><span style={{ color: '#fff', fontSize: 14 }}>t</span></a>
            <a href="#" className="footer-social"><span style={{ color: '#fff', fontSize: 14 }}>i</span></a>
            <a href="#" className="footer-social"><span style={{ color: '#fff', fontSize: 14 }}>y</span></a>
          </div>
          <p style={{ fontSize: 11, color: '#777', margin: 0 }}>
            Copyright 2026 © Seatzo Entertainment Pvt. Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;