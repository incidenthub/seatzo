import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const CATEGORIES = [
  "music",
  "sports",
  "comedy",
  "theatre",
  "conference",
  "festival",
  "other",
];

const defaultSection = () => ({
  name: "",
  rows: ["A"],
  seatsPerRow: 10,
  price: 500, // in rupees
});

const inputStyle = {
  width: "100%",
  background: "#18181b",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#fafafa",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: 12,
  color: "#71717a",
  display: "block",
  marginBottom: 6,
  letterSpacing: 0.3,
};

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    city: "",
    category: "music",
    date: "",
    basePrice: "",
    posterUrl: "",
    tags: "",
  });
  const [sections, setSections] = useState([defaultSection()]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Section helpers
  const updateSection = (i, key, val) => {
    setSections((s) =>
      s.map((sec, idx) => (idx === i ? { ...sec, [key]: val } : sec)),
    );
  };

  const updateRows = (i, val) => {
    // val is a string like "A,B,C" or "A-E"
    const rows = val
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    updateSection(i, "rows", rows);
  };

  const addSection = () => setSections((s) => [...s, defaultSection()]);
  const removeSection = (i) =>
    setSections((s) => s.filter((_, idx) => idx !== i));

  const totalSeats = sections.reduce(
    (sum, s) => sum + s.rows.length * (Number(s.seatsPerRow) || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      sections.some(
        (s) => !s.name || !s.rows.length || !s.seatsPerRow || !s.price,
      )
    ) {
      toast.error("Fill in all section fields");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        basePrice: Math.round(Number(form.basePrice) * 100), // convert to paise
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        sections: sections.map((s) => ({
          name: s.name,
          rows: s.rows,
          seatsPerRow: Number(s.seatsPerRow),
          price: Math.round(Number(s.price) * 100), // convert to paise
        })),
      };
      await api.post("/events", payload);
      toast.success("Event created as draft!");
      navigate("/organiser/events");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        input:focus, select:focus, textarea:focus { border-color: rgba(124,58,237,0.6) !important; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
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
          Create Event
        </h1>
        <p style={{ color: "#52525b", fontSize: 14, margin: "4px 0 0" }}>
          Saved as draft — publish when ready
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <Section title="Basic Info">
          <FormGroup label="EVENT TITLE *">
            <input
              style={inputStyle}
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Summer Music Fest 2025"
              required
            />
          </FormGroup>

          <FormGroup label="DESCRIPTION">
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe your event..."
            />
          </FormGroup>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="VENUE *">
              <input
                style={inputStyle}
                value={form.venue}
                onChange={(e) => setField("venue", e.target.value)}
                placeholder="Stadium / Hall name"
                required
              />
            </FormGroup>
            <FormGroup label="CITY *">
              <input
                style={inputStyle}
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="e.g. Kochi"
                required
              />
            </FormGroup>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="CATEGORY">
              <select
                style={inputStyle}
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="DATE & TIME *">
              <input
                style={inputStyle}
                type="datetime-local"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
            </FormGroup>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="BASE PRICE (₹) *">
              <input
                style={inputStyle}
                type="number"
                value={form.basePrice}
                onChange={(e) => setField("basePrice", e.target.value)}
                placeholder="e.g. 500"
                required
              />
            </FormGroup>
            <FormGroup label="POSTER URL">
              <input
                style={inputStyle}
                value={form.posterUrl}
                onChange={(e) => setField("posterUrl", e.target.value)}
                placeholder="https://..."
              />
            </FormGroup>
          </div>

          <FormGroup label="TAGS (comma separated)">
            <input
              style={inputStyle}
              value={form.tags}
              onChange={(e) => setField("tags", e.target.value)}
              placeholder="live, rock, outdoor"
            />
          </FormGroup>
        </Section>

        {/* Sections & Seating */}
        <Section title={`Seat Sections · ${totalSeats} total seats`}>
          <p
            style={{
              fontSize: 13,
              color: "#52525b",
              marginTop: -8,
              marginBottom: 16,
            }}
          >
            Define sections like PREMIUM, VIP, GENERAL. Rows are letters (A, B,
            C...).
          </p>

          {sections.map((sec, i) => (
            <div
              key={i}
              style={{
                background: "#0e0e10",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 20,
                marginBottom: 12,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 13,
                    color: "#71717a",
                    fontWeight: 600,
                  }}
                >
                  SECTION {i + 1}
                </span>
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <FormGroup label="SECTION NAME *">
                  <input
                    style={inputStyle}
                    value={sec.name}
                    onChange={(e) => updateSection(i, "name", e.target.value)}
                    placeholder="e.g. PREMIUM"
                    required
                  />
                </FormGroup>
                <FormGroup label="PRICE (₹) *">
                  <input
                    style={inputStyle}
                    type="number"
                    value={sec.price}
                    onChange={(e) => updateSection(i, "price", e.target.value)}
                    placeholder="e.g. 199"
                    required
                  />
                </FormGroup>
                <FormGroup label="ROWS (comma separated) *">
                  <input
                    style={inputStyle}
                    value={sec.rows.join(", ")}
                    onChange={(e) => updateRows(i, e.target.value)}
                    placeholder="A, B, C, D"
                    required
                  />
                </FormGroup>
                <FormGroup label="SEATS PER ROW *">
                  <input
                    style={inputStyle}
                    type="number"
                    value={sec.seatsPerRow}
                    onChange={(e) =>
                      updateSection(i, "seatsPerRow", e.target.value)
                    }
                    placeholder="10"
                    required
                  />
                </FormGroup>
              </div>

              <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>
                → {sec.rows.length} rows × {sec.seatsPerRow} seats ={" "}
                <strong style={{ color: "#71717a" }}>
                  {sec.rows.length * (Number(sec.seatsPerRow) || 0)} seats
                </strong>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSection}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              background: "transparent",
              border: "1px dashed rgba(124,58,237,0.3)",
              color: "#c084fc",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            + Add Section
          </button>
        </Section>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => navigate("/organiser/events")}
            style={{
              padding: "12px 24px",
              borderRadius: 10,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#71717a",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              background: loading ? "#4c1d95" : "#7c3aed",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {loading ? "Creating..." : "Create Event (Draft)"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => (
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
      {title}
    </div>
    {children}
  </div>
);

export default CreateEvent;
