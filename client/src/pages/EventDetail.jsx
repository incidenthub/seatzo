import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Info, Share2, Heart,
  ChevronRight, Star, Clock, Languages, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import eventService from '../services/event.service';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventService.getEventById(id);
      const eventData = response.data.event || response.data;
      setEvent(eventData);
      setPricing({ currentPrice: Math.round(eventData.basePrice) });
      setError(null);
    } catch (err) {
      setError('Event details currently unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-8">The event you're looking for is currently unavailable.</p>
          <Link
            to="/events"
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Back to Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Poster */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-lg shadow-lg"
              >
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-700 font-medium">4.5</span>
                    <span className="ml-1 text-gray-500">(2.1k reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{formattedDate}</p>
                      <p className="text-sm text-gray-600">{formattedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{event.venue}</p>
                      <p className="text-sm text-gray-600">{event.city}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Starting from</p>
                    <p className="text-3xl font-bold text-red-600">
                      ₹{pricing?.currentPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <Link
                    to={token ? `/events/${id}/book` : '/login'}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
                  >
                    Book Tickets
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Information */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
                <p className="text-gray-700 leading-relaxed">
                  {event.description}
                </p>
              </motion.div>

              {/* Venue Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.venue}</h3>
                      <p className="text-gray-600">{event.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <ShieldCheck className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Safety Measures</h3>
                      <p className="text-gray-600">Sanitized venue, mask required, social distancing</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                      isLiked
                        ? 'border-red-600 text-red-600 bg-red-50'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{isLiked ? 'Added to Favorites' : 'Add to Favorites'}</span>
                  </button>

                  <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share Event</span>
                  </button>
                </div>
              </motion.div>

              {/* Organizer Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Organizer</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.organiser?.name || 'Authorized Partner'}
                    </p>
                    <p className="text-sm text-gray-600">Event Organizer</p>
                  </div>
                </div>
              </motion.div>

              {/* Offers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
              >
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Special Offer</h3>
                    <p className="text-sm text-blue-800">
                      Get 25% off on food and beverages with select credit cards.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Starting from</p>
            <p className="text-xl font-bold text-red-600">
              ₹{pricing?.currentPrice?.toLocaleString('en-IN')}
            </p>
          </div>
          <Link
            to={token ? `/events/${id}/book` : '/login'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;