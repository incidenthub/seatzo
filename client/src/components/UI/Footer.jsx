import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white py-20 md:py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Top — Brand */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16 md:mb-20">
          <div>
            <Link to="/" className="text-[28px] font-bold tracking-[-0.03em] block mb-3">
              S.
            </Link>
            <p className="text-white/40 text-[15px] max-w-xs leading-relaxed">
              Production-grade event ticketing with atomic seat locking and dynamic pricing.
            </p>
          </div>
          <Link
            to="/events"
            className="group flex items-center gap-2 px-6 py-2.5 rounded-md border border-white/15 hover:border-white/30 transition-colors text-[13px] font-medium"
          >
            Explore Events
            <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16 md:mb-20">
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Events', path: '/events' },
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/55 hover:text-white transition-colors text-[14px]">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">Account</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Log in', path: '/login' },
                { name: 'Register', path: '/register' },
                { name: 'Dashboard', path: '/dashboard' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/55 hover:text-white transition-colors text-[14px]">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">System</h4>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[12px] text-white/45 font-medium">All Systems Operational</span>
            </div>
            <p className="text-[14px] text-white/55">Latency: 12ms</p>
            <p className="text-[14px] text-white/55">Uptime: 99.99%</p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium mb-5">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: <FaTwitter size={16} />, href: '#' },
                { icon: <FaInstagram size={16} />, href: '#' },
                { icon: <FaGithub size={16} />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-white/[0.06] text-[11px] text-white/20 font-medium">
          <span>© 2026 Seatzo. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
