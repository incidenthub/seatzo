import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredEvents = [
    {
        id: '1',
        title: 'Avengers: Endgame',
        category: 'Movies',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
        venue: 'PVR Icon',
        city: 'Mumbai',
        date: 'Apr 20, 2026',
        time: '7:00 PM',
        price: '₹350 onwards'
    },
    {
        id: '2',
        title: 'Taylor Swift World Tour',
        category: 'Concerts',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=800',
        venue: 'DY Patil Stadium',
        city: 'Mumbai',
        date: 'Apr 25, 2026',
        time: '8:00 PM',
        price: '₹5000 onwards'
    },
    {
        id: '3',
        title: 'IPL Final 2026',
        category: 'Sports',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=800',
        venue: 'Wankhede Stadium',
        city: 'Mumbai',
        date: 'May 30, 2026',
        time: '7:30 PM',
        price: '₹2000 onwards'
    }
];

const FeaturedEvents = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Events</h2>
                        <p className="text-gray-600">Don't miss out on these trending events</p>
                    </div>
                    <Link
                        to="/events"
                        className="text-red-600 hover:text-red-700 font-medium flex items-center"
                    >
                        View All
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="relative">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                        {event.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4 flex items-center bg-white bg-opacity-90 px-2 py-1 rounded">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm font-medium ml-1">{event.rating}</span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {event.title}
                                </h3>

                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{event.venue}, {event.city}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{event.date} at {event.time}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-red-600">{event.price}</span>
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Book Now
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedEvents;