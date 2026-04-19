import React from 'react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import Hero from '../components/Home/Hero';
import FeaturedEvents from '../components/Home/FeaturedEvents';
import EventCategories from '../components/Home/EventCategories';
import UpcomingEvents from '../components/Home/UpcomingEvents';
import QuickLinks from '../components/Home/QuickLinks';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Hero />
            <FeaturedEvents />
            <EventCategories />
            <UpcomingEvents />
            <QuickLinks />
            <Footer />
        </div>
    );
};

export default Home;
