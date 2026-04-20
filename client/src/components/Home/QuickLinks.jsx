import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Gift, User, Phone, HelpCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
    {
        id: 'my-bookings',
        title: 'My Bookings',
        description: 'View & manage your tickets',
        icon: Ticket,
        color: 'bg-blue-500',
        link: '/user/dashboard'
    },
    {
        id: 'offers',
        title: 'Offers & Deals',
        description: 'Exclusive discounts & coupons',
        icon: Gift,
        color: 'bg-green-500',
        link: '/offers'
    },
    {
        id: 'account',
        title: 'My Account',
        description: 'Profile & preferences',
        icon: User,
        color: 'bg-purple-500',
        link: '/profile'
    },
    {
        id: 'support',
        title: 'Help & Support',
        description: 'Get assistance anytime',
        icon: HelpCircle,
        color: 'bg-orange-500',
        link: '/contact'
    },
    {
        id: 'reviews',
        title: 'Write a Review',
        description: 'Share your experience',
        icon: Star,
        color: 'bg-yellow-500',
        link: '/reviews'
    },
    {
        id: 'contact',
        title: 'Contact Us',
        description: 'Reach out to our team',
        icon: Phone,
        color: 'bg-red-500',
        link: '/contact'
    }
];

const QuickLinks = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Everything you need is just a click away
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickLinks.map((link, index) => {
                        const IconComponent = link.icon;
                        return (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <Link
                                    to={link.link}
                                    className="group block bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                                        <p className="text-sm text-gray-600">{link.description}</p>
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

export default QuickLinks;