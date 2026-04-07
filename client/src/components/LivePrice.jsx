export default function LivePrice({ pricing }) {
  if (!pricing) return null;

  const { price, multiplier } = pricing;
  const surge = multiplier > 1.3;

  return (
    <div style={box}>
      <div style={{ fontSize: "12px", color: "#aaa" }}>
        Live Price
      </div>

      <div style={{ fontSize: "26px", fontWeight: "bold" }}>
        ₹{price}
      </div>

      {surge && (
        <div style={surgeStyle}>
          ⚡ High demand — prices increased
        </div>
      )}

      <div style={{ fontSize: "11px", marginTop: "5px" }}>
        {multiplier.toFixed(2)}x
      </div>
    </div>
  );
}

const box = {
  background: "#111",
  color: "white",
  padding: "15px",
  borderRadius: "10px",
  width: "200px",
  textAlign: "center",
  margin: "20px auto",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
};

const surgeStyle = {
  marginTop: "10px",
  padding: "5px",
  background: "#ff9800",
  borderRadius: "5px",
  fontSize: "12px",
};

const meta = {
  marginTop: "8px",
  fontSize: "12px",
  color: "#aaa",
};