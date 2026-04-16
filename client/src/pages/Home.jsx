import React from 'react';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';
import Hero from '../components/Home/Hero'; 
import TrendingGrid from '../components/Home/TrendingGrid';
import SignalDiscovery from '../components/Home/SignalDiscovery';
import TheLedger from '../components/Home/TheLedger';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <TrendingGrid />
            <SignalDiscovery />
            <TheLedger />
            {/* Other sections will be added here */}
            <Footer />
        </div>
    );
};

export default Home;
