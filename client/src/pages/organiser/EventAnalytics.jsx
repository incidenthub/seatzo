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
      background: "#111113",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      padding: 24,
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: "#52525b",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 10,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 26,
        fontWeight: 800,
        color: accent || "#fafafa",
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{sub}</div>
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
    fill: SEAT_COLORS[s._id] || "#71717a",
  }));

  const formatRevenue = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate("/organiser/events")}
          style={{
            background: "none",
            border: "none",
            color: "#52525b",
            cursor: "pointer",
            fontSize: 13,
            marginBottom: 12,
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to events
        </button>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#fafafa",
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          {event?.title}
        </h1>
        <p style={{ color: "#52525b", fontSize: 14, margin: "4px 0 0" }}>
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
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Revenue"
          value={formatRevenue(data.totalRevenue)}
          accent="#c084fc"
        />
        <StatCard label="Bookings" value={data.totalBookings} sub="confirmed" />
        <StatCard
          label="Seats Sold"
          value={`${data.soldSeats} / ${data.totalSeats}`}
          sub={`${data.availableSeats} remaining`}
        />
        <StatCard
          label="Occupancy"
          value={data.occupancyRate}
          accent="#4ade80"
        />
      </div>

      {/* Bookings over time chart */}
      <div
        style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: "#52525b",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Bookings Over Time
        </div>

        {bookingChartData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#52525b",
              fontSize: 14,
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
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#fafafa",
                  fontSize: 13,
                }}
                cursor={{ stroke: "rgba(124,58,237,0.3)" }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#bookingGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Seat breakdown chart */}
      <div
        style={{
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: "#52525b",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Seat Status Breakdown
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <ResponsiveContainer width="60%" height={200}>
            <BarChart
              data={seatChartData}
              margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#52525b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "#fafafa",
                  fontSize: 13,
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {seatChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {seatChartData.map((s) => (
              <div
                key={s.name}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: s.fill,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: "#71717a" }}>{s.name}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#fafafa",
                    fontWeight: 600,
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
