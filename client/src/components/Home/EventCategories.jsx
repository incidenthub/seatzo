import React from 'react';
import { motion } from 'framer-motion';
import { Film, Music, Trophy, Theater, Mic, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
    {
        id: 'movies',
        name: 'Movies',
        icon: Film,
        description: 'Blockbusters & indie films',
        color: 'bg-blue-500',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'concerts',
        name: 'Concerts',
        icon: Music,
        description: 'Live music & performances',
        color: 'bg-purple-500',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'sports',
        name: 'Sports',
        icon: Trophy,
        description: 'Matches & tournaments',
        color: 'bg-green-500',
        image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'theatre',
        name: 'Theatre',
        icon: Theater,
        description: 'Plays & musicals',
        color: 'bg-orange-500',
        image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'comedy',
        name: 'Comedy',
        icon: Mic,
        description: 'Stand-up & comedy shows',
        color: 'bg-pink-500',
        image: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 'activities',
        name: 'Activities',
        icon: Gamepad2,
        description: 'Events & experiences',
        color: 'bg-indigo-500',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
    }
];

const EventCategories = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Categories</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover events that match your interests across movies, music, sports, and more
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((category, index) => {
                        const IconComponent = category.icon;
                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/events?category=${category.id}`}
                                    className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                                >
                                    <div className="relative h-32 overflow-hidden">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className={`absolute inset-0 ${category.color} bg-opacity-80 flex items-center justify-center`}>
                                            <IconComponent className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                                        <p className="text-sm text-gray-600">{category.description}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default EventCategories;