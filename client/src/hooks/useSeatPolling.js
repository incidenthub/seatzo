import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/seats";

export default function useSeatPolling(eventId) {
  const [seats, setSeats] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  const fetchSeats = async () => {
    try {
      const res = await axios.get(`${API}/${eventId}`);
      setSeats(res.data.seats);
      setPricing(res.data.pricing);
      setLoading(false);
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  useEffect(() => {
    if (!eventId) return;

    fetchSeats();

    intervalRef.current = setInterval(fetchSeats, 5000);

    return () => clearInterval(intervalRef.current);
  }, [eventId]);

  return {
    seats,
    pricing,
    loading,
    refresh: fetchSeats,
  };
}