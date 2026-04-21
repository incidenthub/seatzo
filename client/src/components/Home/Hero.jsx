import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Film, Music, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [location, setLocation] = useState('Mumbai');

    const quickCategories = [
        { name: 'Movies', icon: Film, link: '/events?category=movies' },
        { name: 'Concerts', icon: Music, link: '/events?category=concerts' },
        { name: 'Sports', icon: Trophy, link: '/events?category=sports' }
    ];

    return (
        <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Discover Amazing
                        <span className="block text-yellow-300">Events Near You</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
                        Book tickets for movies, concerts, sports, and more. Experience entertainment like never before.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <div className="bg-white rounded-lg shadow-2xl p-2 flex flex-col md:flex-row gap-2">
                        {/* Search Input */}
                        <div className="flex-1 flex items-center px-4 py-3">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Search for events, movies, shows..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        {/* Location Selector */}
                        <div className="flex items-center px-4 py-3 border-t md:border-t-0 md:border-l border-gray-200">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="outline-none text-gray-700 bg-transparent"
                            >
                                <option value="Mumbai">Mumbai</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Chennai">Chennai</option>
                                <option value="Pune">Pune</option>
                            </select>
                        </div>

                        {/* Search Button */}
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200 flex items-center justify-center">
                            <Search className="w-5 h-5 mr-2" />
                            Search
                        </button>
                    </div>
                </motion.div>

                {/* Quick Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-4 mb-12"
                >
                    {quickCategories.map((category, index) => {
                        const IconComponent = category.icon;
                        return (
                            <Link
                                key={category.name}
                                to={category.link}
                                className="flex items-center bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 transition-all duration-200 group"
                            >
                                <IconComponent className="w-5 h-5 mr-3 text-yellow-300" />
                                <span className="font-medium">{category.name}</span>
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        );
                    })}
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                    <div>
                        <div className="text-3xl font-bold mb-2">10K+</div>
                        <div className="text-red-100">Events</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold mb-2">1M+</div>
                        <div className="text-red-100">Happy Customers</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold mb-2">50+</div>
                        <div className="text-red-100">Cities</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold mb-2">24/7</div>
                        <div className="text-red-100">Support</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;