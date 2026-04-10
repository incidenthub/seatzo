import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-24 px-6 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-4xl font-black tracking-tighter mb-8 block">
              SEATZO.
            </Link>
            <p className="text-stone-400 text-lg max-w-sm leading-relaxed">
              Engineering the intersection of reliability and performance for the global event industry. Available 24/7.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-8">Navigation</h4>
            <ul className="space-y-4 font-bold">
              <li><Link to="/events" className="hover:text-stone-400 transition-colors italic">Events</Link></li>
              <li><Link to="/about" className="hover:text-stone-400 transition-colors italic">About</Link></li>
              <li><Link to="/contact" className="hover:text-stone-400 transition-colors italic">Contact</Link></li>
              <li><Link to="/register" className="hover:text-stone-400 transition-colors italic">Get Started</Link></li>
            </ul>
          </div>
          
          {/* Social */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-8">System Status</h4>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-xs font-bold tracking-widest">ALL SYSTEMS OPERATIONAL</span>
            </div>
            <div className="flex gap-6 pt-4">
              <a href="#" className="hover:scale-110 transition-transform"><FaTwitter size={20} /></a>
              <a href="#" className="hover:scale-110 transition-transform"><FaInstagram size={20} /></a>
              <a href="#" className="hover:scale-110 transition-transform"><FaGithub size={20} /></a>
              <a href="#" className="hover:scale-110 transition-transform"><Mail size={20} /></a>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-end border-t border-white/10 pt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
          <div>
            <p>© 2026 SEATZO INFRASTRUCTURES. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
