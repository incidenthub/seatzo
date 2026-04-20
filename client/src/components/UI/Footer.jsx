import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-red-500">Seatzo</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your ultimate destination for booking tickets to movies, concerts, sports, and events.
                            Experience entertainment like never before.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FaFacebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FaTwitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FaInstagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <FaYoutube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/events" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    All Events
                                </Link>
                            </li>
                            <li>
                                <Link to="/events?category=movies" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Movies
                                </Link>
                            </li>
                            <li>
                                <Link to="/events?category=concerts" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Concerts
                                </Link>
                            </li>
                            <li>
                                <Link to="/events?category=sports" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Sports
                                </Link>
                            </li>
                            <li>
                                <Link to="/events?category=theatre" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Theatre
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Customer Service</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/help" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Help & Support
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Contact Info</h4>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">
                                    123 Entertainment Street<br />
                                    Mumbai, Maharashtra 400001
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">+91 98765 43210</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">support@seatzo.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="max-w-md">
                        <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
                        <p className="text-gray-300 text-sm mb-4">
                            Subscribe to get latest updates on events and exclusive offers.
                        </p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                            />
                            <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-r-md font-medium transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} Seatzo. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;