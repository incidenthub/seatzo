import { ArrowUpRight, Mail } from 'lucide-react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white pt-32 pb-12 px-6 md:px-12 border-t border-stone-100 overflow-hidden">
            <div className="max-w-[1400px] mx-auto">
                
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
                    
                    {/* Newsletter / Contact Call to Action */}
                    <div className="md:col-span-6 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-light italic tracking-tighter uppercase leading-[0.85]">
                            Start your <br />
                            <span className="text-[#DC3558]">vault</span> journey.
                        </h2>
                        <div className="flex flex-col gap-4 max-w-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                Join our curated list for exclusive signals.
                            </p>
                            <div className="relative group">
                                <input 
                                    type="email" 
                                    placeholder="ALIAS@SYSTEM.COM" 
                                    className="w-full bg-transparent border-b-2 border-stone-900 py-4 text-sm font-mono focus:outline-none placeholder:text-stone-200"
                                />
                                <button className="absolute right-0 bottom-4 hover:translate-x-1 transition-transform">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-3 space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#DC3558]">Navigation</p>
                        <ul className="space-y-4">
                            {['Events', 'Archive', 'Identity', 'Pricing', 'Security'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-sm font-medium hover:italic transition-all uppercase tracking-tight text-stone-600 hover:text-stone-950">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Socials & Legal */}
                    <div className="md:col-span-3 space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#DC3558]">Connect</p>
                        <ul className="space-y-4">
                            {[
                                { name: 'Instagram', icon: <FaInstagram size={14} /> },
                                { name: 'Twitter', icon: <FaTwitter size={14} /> },
                                { name: 'LinkedIn', icon: <FaLinkedin size={14} /> },
                                { name: 'Contact', icon: <Mail size={14} /> },
                            ].map((social) => (
                                <li key={social.name}>
                                    <a href="#" className="flex items-center gap-2 text-sm font-medium uppercase tracking-tight text-stone-600 hover:text-stone-950 group">
                                        <span className="group-hover:rotate-12 transition-transform">{social.icon}</span>
                                        {social.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* The Brutalist Brand Statement */}
                <div className="relative border-t border-stone-100 pt-12">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="text-[9px] font-mono text-stone-300 uppercase tracking-[0.3em] leading-relaxed">
                            Designed for the elite.<br />
                            Powered by Seatzo Protocol.<br />
                            Thrissur // Kerala // IN
                        </div>
                        
                        <div className="text-[9px] font-mono text-stone-300 uppercase tracking-[0.3em] text-right">
                            © {currentYear} ALL RIGHTS RESERVED<br />
                            v.2.0.46_STABLE
                        </div>
                    </div>

                    {/* Large Background Text Clipping */}
                    <h1 className="text-[25vw] font-black text-stone-50/80 leading-none tracking-tighter uppercase select-none pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 z-[-1] whitespace-nowrap">
                        SEATZO.
                    </h1>
                </div>
            </div>
        </footer>
    );
};

export default Footer;