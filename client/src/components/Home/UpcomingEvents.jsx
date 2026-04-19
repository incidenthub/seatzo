import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const upcomingEvents = [
    {
        id: '4',
        title: 'Hamilton: The Musical',
        category: 'Theatre',
        image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=400',
        venue: 'Prithvi Theatre',
        city: 'Mumbai',
        date: 'Apr 22, 2026',
        time: '7:00 PM',
        price: '₹800 onwards'
    },
    {
        id: '5',
        title: 'Comedy Night with Zakir Khan',
        category: 'Comedy',
        image: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?auto=format&fit=crop&q=80&w=400',
        venue: 'The Comedy Store',
        city: 'Delhi',
        date: 'Apr 28, 2026',
        time: '8:00 PM',
        price: '₹600 onwards'
    },
    {
        id: '6',
        title: 'Jazz Festival 2026',
        category: 'Concerts',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=400',
        venue: 'Bandra Reclamation',
        city: 'Mumbai',
        date: 'May 5, 2026',
        time: '6:00 PM',
        price: '₹1200 onwards'
    },
    {
        id: '7',
        title: 'Premier League: Chelsea vs Arsenal',
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=400',
        venue: 'Wembley Stadium',
        city: 'London',
        date: 'May 10, 2026',
        time: '5:30 PM',
        price: '₹1500 onwards'
    }
];

const UpcomingEvents = () => {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
                        <p className="text-gray-600">Plan ahead for these exciting upcoming events</p>
                    </div>
                    <Link
                        to="/events?filter=upcoming"
                        className="text-red-600 hover:text-red-700 font-medium flex items-center"
                    >
                        View All
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {upcomingEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="relative">
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                    <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                                        {event.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {event.title}
                                </h3>

                                <div className="space-y-1 mb-3">
                                    <div className="flex items-center text-xs text-gray-600">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="truncate">{event.venue}, {event.city}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>{event.time}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-red-600">{event.price}</span>
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Book
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

export default UpcomingEvents;