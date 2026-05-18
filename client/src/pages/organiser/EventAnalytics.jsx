import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const SEAT_COLORS = {
  AVAILABLE: "#4ade80",
  BOOKED: "#c084fc",
  LOCKED: "#fbbf24",
  DISABLED: "#3f3f46",
};

const StatCard = ({ label, value, sub, accent }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 20,
      padding: 24,
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 12,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 26,
        fontWeight: 800,
        color: accent || "#0f172a",
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{sub}</div>
    )}
  </div>
);

const EventAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [analyticsRes, eventRes] = await Promise.all([
        api.get(`/events/${id}/analytics`),
        api.get(`/events/${id}`),
      ]);
      setData(analyticsRes.data);
      setEvent(eventRes.data.event);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load analytics");
      navigate("/organiser/events");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid #7c3aed",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  const bookingChartData = (data.bookingsByDate || []).map((b) => ({
    date: b._id,
    bookings: b.count,
  }));

  const seatChartData = (data.seatBreakdown || []).map((s) => ({
    name: s._id,
    count: s.count,
    fill: SEAT_COLORS[s._id] || "#94a3b8",
  }));

  const formatRevenue = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/organiser/events")}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 12,
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600
          }}
        >
          ← Back to events
        </button>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          {event?.title}
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0", fontWeight: 500 }}>
          {event?.venue} · {event?.city} ·{" "}
          {new Date(event?.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Revenue"
          value={formatRevenue(data.totalRevenue)}
          accent="#7c3aed"
        />
        <StatCard label="Bookings" value={data.totalBookings} sub="confirmed" />
        <StatCard
          label="Seats Sold"
          value={`${data.soldSeats} / ${data.totalSeats}`}
          sub={`${data.availableSeats} remaining`}
        />
        <StatCard
          label="Turnout"
          value={data.checkInRate}
          sub={`${data.totalCheckedIn} / ${data.totalBookings} checked in`}
          accent="#10b981"
        />
      </div>

      {/* Bookings over time chart */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 11,
            fontWeight: 800,
            color: "#94a3b8",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Bookings Over Time
        </div>

        {bookingChartData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#94a3b8",
              fontSize: 14,
              fontWeight: 500
            }}
          >
            No confirmed bookings yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={bookingChartData}
              margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
            >
              <defs>
                <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ stroke: "#7c3aed33" }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#7c3aed"
                strokeWidth={3}
                fill="url(#bookingGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Seat breakdown chart */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 11,
            fontWeight: 800,
            color: "#94a3b8",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Seat Status Breakdown
        </div>

        <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
          <ResponsiveContainer width="50%" height={200}>
            <BarChart
              data={seatChartData}
              margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  color: "#0f172a",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                {seatChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {seatChartData.map((s) => (
              <div
                key={s.name}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12,
                  padding: '8px 16px',
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #f1f5f9'
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: s.fill,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>{s.name}</span>
                <span
                  style={{
                    fontSize: 14,
                    color: "#0f172a",
                    fontWeight: 800,
                    marginLeft: "auto",
                  }}
                >
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAnalytics;
