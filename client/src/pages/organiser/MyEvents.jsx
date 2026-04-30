import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS = {
  draft: {
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    text: "#fbbf24",
  },
  published: {
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    text: "#4ade80",
  },
  cancelled: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    text: "#f87171",
  },
};

const Badge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      {status}
    </span>
  );
};

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get("/events/my");
      setEvents(data.events);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    setPublishing(id);
    try {
      await api.patch(`/events/${id}/publish`);
      toast.success("Event published!");
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to publish");
    } finally {
      setPublishing(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this event? This cannot be undone.")) return;
    setCancelling(id);
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event cancelled");
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to cancel");
    } finally {
      setCancelling(null);
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

  return (
    <div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
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
            My Events
          </h1>
          <p style={{ color: "#52525b", fontSize: 14, margin: "4px 0 0" }}>
            {events.length} event{events.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <button
          onClick={() => navigate("/organiser/events/create")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: "#7c3aed",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Event
        </button>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎪</div>
          <p style={{ color: "#52525b", fontSize: 15 }}>
            No events yet. Create your first one!
          </p>
          <button
            onClick={() => navigate("/organiser/events/create")}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 10,
              background: "#7c3aed",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Create Event
          </button>
        </div>
      )}

      {/* Event cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((event) => (
          <div
            key={event._id}
            style={{
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Poster */}
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const parent = e.target.parentElement;
                  if (parent) {
                    const div = document.createElement("div");
                    div.style.width = "56px";
                    div.style.height = "56px";
                    div.style.borderRadius = "10px";
                    div.style.background = "rgba(124,58,237,0.15)";
                    div.style.display = "flex";
                    div.style.alignItems = "center";
                    div.style.justifyContent = "center";
                    div.style.fontSize = "22px";
                    div.innerText = "🎫";
                    parent.appendChild(div);
                  }
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "rgba(124,58,237,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                🎫
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#fafafa",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {event.title}
                </span>
                <Badge status={event.status} />
              </div>
              <div style={{ fontSize: 13, color: "#52525b" }}>
                {event.venue} · {event.city} ·{" "}
                {new Date(event.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>
                {event.availableSeats}/{event.totalSeats} seats available
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {/* Analytics */}
              <button
                onClick={() =>
                  navigate(`/organiser/events/${event._id}/analytics`)
                }
                title="Analytics"
                style={btnStyle("#18181b", "rgba(255,255,255,0.08)", "#a1a1aa")}
              >
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </button>

              {/* Edit — only for DRAFT */}
              {event.status === "draft" && (
                <button
                  onClick={() =>
                    navigate(`/organiser/events/${event._id}/edit`)
                  }
                  title="Edit"
                  style={btnStyle(
                    "#18181b",
                    "rgba(255,255,255,0.08)",
                    "#a1a1aa",
                  )}
                >
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}

              {/* Publish — only for DRAFT */}
              {event.status === "draft" && (
                <button
                  onClick={() => handlePublish(event._id)}
                  disabled={publishing === event._id}
                  title="Publish"
                  style={btnStyle(
                    "rgba(34,197,94,0.1)",
                    "rgba(34,197,94,0.3)",
                    "#4ade80",
                  )}
                >
                  {publishing === event._id ? (
                    "..."
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
              )}

              {/* Cancel — only for DRAFT or PUBLISHED */}
              {event.status !== "cancelled" && (
                <button
                  onClick={() => handleCancel(event._id)}
                  disabled={cancelling === event._id}
                  title="Cancel Event"
                  style={btnStyle(
                    "rgba(239,68,68,0.08)",
                    "rgba(239,68,68,0.25)",
                    "#f87171",
                  )}
                >
                  {cancelling === event._id ? (
                    "..."
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const btnStyle = (bg, border, color) => ({
  width: 34,
  height: 34,
  borderRadius: 8,
  border: `1px solid ${border}`,
  background: bg,
  color,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  transition: "all 0.15s",
});

export default MyEvents;
