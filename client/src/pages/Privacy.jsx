const Privacy = () => (
  <div className="min-h-screen bg-white dark:bg-neutral-950 py-16 px-4">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Privacy Policy
      </h1>
      <p className="text-xs text-gray-400 dark:text-neutral-500 mb-8">Last updated: January 2026</p>

      {[
        {
          title: "1. Information We Collect",
          body: "We collect information you provide directly: name, email address, phone number, and payment details (processed securely via Stripe). We also collect booking history, seat selections, and device information such as IP address and browser type for security and analytics."
        },
        {
          title: "2. How We Use Your Information",
          body: "Your information is used to create and manage your account, process bookings, send confirmation emails and tickets, detect and prevent fraud, and improve our services. We may also use your email to send promotional communications — you can opt out at any time."
        },
        {
          title: "3. Information Sharing",
          body: "We share your information with event organizers (for ticket validation), Stripe (for payment processing), and law enforcement authorities when required by law. We do not sell or rent your personal data to third parties."
        },
        {
          title: "4. Data Security",
          body: "We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Payment data is handled exclusively by Stripe, which is PCI-DSS Level 1 certified. Your passwords are hashed using bcrypt."
        },
        {
          title: "5. Cookies",
          body: "We use essential cookies for authentication and session management, analytics cookies to understand how you use Seatzo, and marketing cookies (with your consent) for personalized recommendations. You can manage your cookie preferences in your browser settings."
        },
        {
          title: "6. Your Rights",
          body: "Under India's DPDP Act, you have the right to: access your personal data, correct inaccurate data, delete your account and data, withdraw consent for marketing, and lodge a complaint with the Data Protection Board. To exercise these rights, contact privacy@seatzo.com."
        },
        {
          title: "7. Data Retention",
          body: "We retain your account data for as long as your account is active. Booking records are retained for 7 years for legal and tax compliance. After account deletion, your data is permanently removed within 30 days, except where retention is required by law."
        },
        {
          title: "8. Children's Privacy",
          body: "Seatzo is not intended for users under 18 years of age. We do not knowingly collect personal data from minors. If we become aware of such collection, the data will be promptly deleted."
        },
        {
          title: "9. International Transfers",
          body: "Your data may be processed on servers outside of India. When we transfer data internationally, we ensure appropriate safeguards are in place, including Standard Contractual Clauses."
        },
        {
          title: "10. Contact",
          body: "For privacy-related questions or to report a data breach, contact our Data Protection Officer at privacy@seatzo.com."
        },
      ].map((section, i) => (
        <div key={i} className="mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{section.title}</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">{section.body}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Privacy;