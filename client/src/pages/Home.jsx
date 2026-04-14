import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/UI/Navbar';
import Footer from '../components/UI/Footer';

// ─── Fade-up on scroll ───────────────────────────────────────────────────────
const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });
  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── Horizontal Scroll Section ───────────────────────────────────────────────
const HorizontalScroll = ({ children, title, viewAllLink }) => {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 md:py-10 bg-[#f5f5f5]">
      <div className="max-w-[1240px] mx-auto px-4 relative">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[24px] font-bold text-[#333] tracking-tight">{title}</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-[#DC3558] text-[14px] hover:underline"
            >
              See All &#8250;
            </Link>
          )}
        </div>

        {/* Scrollable row */}
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-2 pt-1"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {children}
          </div>

          {/* Nav arrows - visible on hover for desktop */}
          <button
            onClick={() => scroll(-1)}
            className="hidden md:flex absolute left-[-20px] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll(1)}
            className="hidden md:flex absolute right-[-20px] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

// ─── Event Card (Exact BookMyShow match) ────────────────────────────────────
const EventCard = ({ event }) => {
  return (
    <Link
      to={`/events/${event.id}`}
      className="shrink-0 w-[210px] md:w-[225px] flex flex-col"
    >
      {/* Poster Image Container */}
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#e0e0e0] mb-3">
        <img 
          src={event.poster} 
          alt={event.title}
          className="w-full h-full object-cover"
        />

        {/* Rating/Likes Ribbon */}
        {event.rating || event.likes ? (
          <div className="absolute bottom-0 inset-x-0 bg-black/90 px-3 py-1.5 flex items-center gap-1.5">
            {event.type === 'rating' ? (
              <>
                <Star size={14} className="text-[#F84464] fill-[#F84464]" />
                <span className="text-white text-[13px] font-medium">{event.rating}/10</span>
                <span className="text-white text-[13px] ml-1">{event.votes} Votes</span>
              </>
            ) : (
              <>
                <ThumbsUp size={14} className="text-[#2DC492] fill-[#2DC492]" />
                <span className="text-white text-[13px] font-medium">{event.likes} Likes</span>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Info Details */}
      <h3 className="text-[16px] font-semibold text-[#1a1a1a] line-clamp-2 leading-snug">
        {event.title}
      </h3>
      <p className="text-[14px] text-[#666] mt-1 line-clamp-1">
        {event.genre}
      </p>
    </Link>
  );
};

const Home = () => {
  // ─── Hero carousel state ──────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    { image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1200&h=400&fit=crop', link: '/events' },
    { image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&h=400&fit=crop', link: '/events' },
    { image: 'https://images.unsplash.com/photo-1540039155732-d67414afc20f?q=80&w=1200&h=400&fit=crop', link: '/events' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // ─── Recommended Movies mock data (from screenshot) ─────────────
  const recommendedMovies = [
    { 
      id: '1', 
      title: 'Dhurandhar The Revenge', 
      genre: 'Action/Thriller', 
      type: 'rating',
      rating: '9.4', 
      votes: '565K+', 
      poster: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&h=600&fit=crop' 
    },
    { 
      id: '2', 
      title: 'Bhooth Bangla', 
      genre: 'Comedy/Horror/Thriller', 
      type: 'likes',
      likes: '175K+', 
      poster: 'https://images.unsplash.com/photo-1563842423-455b85e05aa3?q=80&w=400&h=600&fit=crop' 
    },
    { 
      id: '3', 
      title: 'Project Hail Mary', 
      genre: 'Adventure/Drama/Sci-Fi', 
      type: 'rating',
      rating: '9', 
      votes: '56.2K+', 
      poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=400&h=600&fit=crop' 
    },
    { 
      id: '4', 
      title: 'Dacoit', 
      genre: 'Action/Drama/Romantic/Thriller', 
      type: 'likes',
      likes: '96.6K+', 
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&h=600&fit=crop' 
    },
    { 
      id: '5', 
      title: 'Super Duperr', 
      genre: 'Comedy/Drama/Family', 
      type: 'rating',
      rating: '9.6', 
      votes: '3.1K+', 
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=400&h=600&fit=crop' 
    },
    { 
      id: '6', 
      title: 'The Great Indian Family', 
      genre: 'Drama/Comedy', 
      type: 'rating',
      rating: '8.5', 
      votes: '12K+', 
      poster: 'https://images.unsplash.com/photo-1588691515082-cd2f4955bdc8?q=80&w=400&h=600&fit=crop' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />
      <div className="h-[106px]" />

      {/* Hero Carousel */}
      <section className="bg-[#ebebeb] py-2 md:py-4">
        <div className="max-w-[1240px] mx-auto">
          <div className="relative rounded-lg overflow-hidden aspect-[21/9] md:aspect-[12/3] bg-gray-200">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={heroSlides[currentSlide].image}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                onClick={() => window.location.href = heroSlides[currentSlide].link}
              />
            </AnimatePresence>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Carousel Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => prev === 0 ? heroSlides.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* RECOMMENDED MOVIES */}
      <HorizontalScroll title="Recommended Movies" viewAllLink="/events?category=movie">
        {recommendedMovies.map((movie) => (
          <EventCard key={movie.id} event={movie} />
        ))}
      </HorizontalScroll>

      {/* Add more spacing or content below if needed */}
      <div className="pb-20"></div>

      <Footer />
    </div>
  );
};

export default Home;
