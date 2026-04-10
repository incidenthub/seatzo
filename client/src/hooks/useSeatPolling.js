import { useEffect, useState, useRef } from "react";
import eventService from "../services/event.service";

export default function useSeatPolling(eventId) {
  const [seats, setSeats] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [viewers, setViewers] = useState(0);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  const fetchSeats = async () => {
    try {
      const res = await eventService.getEventSeats(eventId);
      setSeats(res.data.seats || []);
      setPricing(res.data.pricing || null);
      setViewers(res.data.viewers || 0);
      setLoading(false);
    } catch (err) {
      console.error("Polling error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;

    fetchSeats();

    // Poll every 5 seconds for real-time seat updates
    intervalRef.current = setInterval(fetchSeats, 5000);

    return () => clearInterval(intervalRef.current);
  }, [eventId]);

  return {
    seats,
    pricing,
    viewers,
    loading,
    refresh: fetchSeats,
  };
}