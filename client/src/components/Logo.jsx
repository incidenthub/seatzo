const Logo = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="seatzoGradient" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>

      {/* Main Shape */}
      <rect
        x="8"
        y="8"
        width="48"
        height="48"
        rx="16"
        fill="url(#seatzoGradient)"
      />

      {/* Ticket Shape */}
      <path
        d="M20 24C20 21.8 21.8 20 24 20H40C42.2 20 44 21.8 44 24V28C41.8 28 40 29.8 40 32C40 34.2 41.8 36 44 36V40C44 42.2 42.2 44 40 44H24C21.8 44 20 42.2 20 40V36C22.2 36 24 34.2 24 32C24 29.8 22.2 28 20 28V24Z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Center Cut */}
      <path
        d="M32 22V42"
        stroke="#f43f5e"
        strokeWidth="2.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />

      {/* Tiny Accent */}
      <circle cx="32" cy="32" r="2.5" fill="#f43f5e" />
    </svg>
  );
};

export default Logo;