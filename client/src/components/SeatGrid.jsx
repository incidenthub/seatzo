import { useState, useRef } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/seats";

export default function SeatGrid({ eventId, seats, refresh }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const isProcessing = useRef(false);

  const handleSeatClick = async (seat) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      const isSelected = selectedSeats.find(
        (s) => s.seatNumber === seat.seatNumber
      );

      // 🔴 UNSELECT
      if (isSelected) {
        await axios.post(`${API}/release`, {
          eventId,
          seatIds: [seat.seatNumber],
        });

        setSelectedSeats((prev) =>
          prev.filter((s) => s.seatNumber !== seat.seatNumber)
        );

        await refresh();
        return;
      }

      // ❌ BLOCK
      if (seat.status !== "AVAILABLE") return;

      // 🟢 SELECT
      await axios.post(`${API}/lock`, {
        eventId,
        seatIds: [seat.seatNumber],
      });

      setSelectedSeats((prev) => [...prev, seat]);

      await refresh();

    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      isProcessing.current = false;
    }
  };

  const total = selectedSeats.reduce(
    (sum, s) => sum + s.currentPrice,
    0
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Select Seats</h2>

      <div style={screenStyle}>SCREEN</div>

      <div style={gridStyle}>
        {seats.map((seat) => {
          const isSelected = selectedSeats.find(
            (s) => s.seatNumber === seat.seatNumber
          );

          return (
            <div
              key={seat.seatNumber}
              style={getSeatStyle(seat, isSelected)}
              onClick={() => handleSeatClick(seat)}
            >
              {seat.seatNumber}
            </div>
          );
        })}
      </div>

      {selectedSeats.length > 0 && (
        <div style={bottomBar}>
          <div>
            {selectedSeats.map((s) => s.seatNumber).join(", ")}
          </div>
          <div>₹{total}</div>
        </div>
      )}
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(10, 45px)",
  gap: "12px",
  justifyContent: "center",
  marginTop: "30px",
};

const screenStyle = {
  textAlign: "center",
  margin: "20px auto",
  padding: "10px",
  width: "60%",
  background: "#ddd",
  borderRadius: "10px",
  fontWeight: "bold",
};

const getSeatStyle = (seat, isSelected) => {
  let bg = "#ccc";

  if (seat.status === "AVAILABLE") bg = "#4CAF50";
  if (seat.status === "LOCKED") bg = "#FFC107";
  if (seat.status === "BOOKED") bg = "#F44336";
  if (isSelected) bg = "#2196F3";

  return {
    background: bg,
    color: "white",
    padding: "8px",
    textAlign: "center",
    cursor: seat.status === "AVAILABLE" || isSelected ? "pointer" : "not-allowed",
    borderRadius: "6px",
    fontSize: "12px",
    transition: "0.2s",
  };
};

const legendStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "20px",
};

const Legend = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
    <div style={{ width: "15px", height: "15px", background: color }} />
    <span>{label}</span>
  </div>
);

const bottomBar = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "#111",
  color: "white",
  padding: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const buttonStyle = {
  background: "#e91e63",
  border: "none",
  padding: "10px 20px",
  color: "white",
  borderRadius: "5px",
  cursor: "pointer",
};