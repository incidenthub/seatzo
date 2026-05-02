import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";

const LandingPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events?limit=20");
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const CATEGORIES = [
    { name: "Movies", icon: "🎬", slug: "movie" },
    { name: "Music", icon: "🎵", slug: "music" },
    { name: "Comedy", icon: "😂", slug: "comedy" },
    { name: "Sports", icon: "⚽", slug: "sports" },
    { name: "Plays", icon: "🎭", slug: "theatre" },
    { name: "Workshops", icon: "🎨", slug: "festival" },
    { name: "Conferences", icon: "💼", slug: "conference" },
  ];

  const filterByCategory = (slug) => events.filter(e => e.category === slug);

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;700&display=swap');

        .category-item { 
          display: flex; flex-direction: column; align-items: center; gap: 8px; 
          text-decoration: none; color: #666; font-size: 12px; font-weight: 500;
          transition: color 0.2s;
        }
        .category-item:hover { color: #f84464; }
        .category-icon { 
          width: 48px; height: 48px; background: #fff; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; font-size: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.2s;
        }
        .category-item:hover .category-icon { transform: translateY(-2px); }

        .event-card { 
          background: #fff; border-radius: 12px; overflow: hidden; 
          text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s;
          height: 100%; display: flex; flex-direction: column;
        }
        .event-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .poster-container { position: relative; aspect-ratio: 2/3; overflow: hidden; background: #eee; }
        .poster-img { width: 100%; height: 100%; object-fit: cover; }
        .event-badge { 
          position: absolute; top: 12px; right: 12px; background: #f84464; color: #fff;
          font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px;
          text-transform: uppercase;
        }

        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .section-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #333; }
        .see-all { color: #f84464; font-size: 14px; font-weight: 700; text-decoration: none; }
      `}</style>

      {/* Sub-Header Categories */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: "40px", overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/events?category=${cat.slug}`} className="category-item">
              <div className="category-icon">{cat.icon}</div>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Carousel (Mock) */}
      <div style={{ maxWidth: 1200, margin: "24px auto", padding: "0 24px" }}>
        <div style={{ 
          background: "linear-gradient(90deg, #2b2d3d 0%, #1c1e2b 100%)", 
          borderRadius: "16px", height: "320px", display: "flex", overflow: "hidden", position: "relative"
        }}>
          <div style={{ flex: 1, padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 style={{ color: "#fff", fontSize: "40px", fontWeight: 800, margin: "0 0 16px", fontFamily: "'Syne', sans-serif" }}>
              Experience Magic <br/> <span style={{ color: "#f84464" }}>Live on Stage</span>
            </h1>
            <p style={{ color: "#aaa", fontSize: "16px", maxWidth: "400px", margin: "0 0 32px" }}>
              Book tickets for the most anticipated movies, concerts, and sports events in your city.
            </p>
            <Link to="/events" style={{ 
              background: "#f84464", color: "#fff", padding: "12px 32px", borderRadius: "8px", 
              fontWeight: 700, textDecoration: "none", width: "fit-content"
            }}>
              Book Now
            </Link>
          </div>
          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
             <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80" alt="" style={{ width: "120%", height: "120%", objectFit: "cover", opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div style={{ maxWidth: 1200, margin: "48px auto", padding: "0 24px" }}>
        
        {/* RECOMMENDED SECTION */}
        <section style={{ marginBottom: 64 }}>
          <div className="section-header">
            <h2 className="section-title">Recommended Movies</h2>
            <Link to="/events?category=movie" className="see-all">See All ›</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} style={{ height: "300px", background: "#ddd", borderRadius: 12 }} />
            )) : filterByCategory("movie").length > 0 ? filterByCategory("movie").slice(0, 5).map(event => (
              <EventItem key={event._id} event={event} />
            )) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#999", background: "#fff", borderRadius: 12 }}>
                No movies currently listed.
              </div>
            )}
          </div>
        </section>

        {/* LATEST EVENTS */}
        <section style={{ marginBottom: 64 }}>
          <div className="section-header">
            <h2 className="section-title">Best of Live Events</h2>
            <Link to="/events" className="see-all">See All ›</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
             {events.filter(e => e.category !== "movie").slice(0, 10).map(event => (
               <EventItem key={event._id} event={event} />
             ))}
          </div>
        </section>

        {/* STREAM BANNER (MOCK) */}
        <div style={{ marginBottom: 64 }}>
           <img src="https://assets-in.bmscdn.com/discovery-catalog/collections/tr:w-1440,h-120/stream-le-collection-202210241242.png" alt="stream" style={{ width: "100%", borderRadius: 12 }} />
        </div>

        {/* COMEDY SHOWS */}
        <section style={{ marginBottom: 64 }}>
          <div className="section-header">
            <h2 className="section-title">Laughter Therapy</h2>
            <Link to="/events?category=comedy" className="see-all">See All ›</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
             {filterByCategory("comedy").slice(0, 5).map(event => (
               <EventItem key={event._id} event={event} />
             ))}
          </div>
        </section>

      </div>

      {/* FOOTER CALL TO ACTION */}
      <section style={{ 
        padding: "80px 24px", background: "#fff", borderTop: "1px solid #eee",
        textAlign: "center" 
      }}>
         <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#333", marginBottom: 16 }}>Ready to experience magic?</h2>
         <p style={{ color: "#666", fontSize: "16px", marginBottom: 32 }}>Join thousands of event-goers and organisers today.</p>
         <Link to="/events" style={{ 
            background: "#f84464", color: "#fff", padding: "16px 48px", borderRadius: "8px", 
            fontWeight: 700, textDecoration: "none", fontSize: "16px", display: "inline-block"
         }}>Browse Events Now</Link>
      </section>
    </div>
  );
};

const EventItem = ({ event }) => (
  <Link to={`/events/${event._id}`} className="event-card">
    <div className="poster-container">
      <img src={event.posterUrl || "https://images.unsplash.com/photo-1514525253344-9914f25af042?auto=format&fit=crop&w=400&q=80"} alt={event.title} className="poster-img" />
      <div className="event-badge">{event.category}</div>
    </div>
    <div style={{ padding: "16px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#333", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.title}</h3>
      <p style={{ fontSize: "12px", color: "#666", margin: "0 0 12px" }}>{event.venue}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>₹{event.basePrice / 100} onwards</span>
        <span style={{ fontSize: "11px", color: "#f84464", fontWeight: 700 }}>{event.city}</span>
      </div>
    </div>
  </Link>
);

export default LandingPage;
