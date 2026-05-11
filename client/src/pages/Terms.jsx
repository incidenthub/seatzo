const Terms = () => (
  <div className="min-h-screen bg-white dark:bg-neutral-950 py-16 px-4">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        Terms & Conditions
      </h1>
      <p className="text-xs text-gray-400 dark:text-neutral-500 mb-8">Last updated: January 2026</p>

      {[
        {
          title: "1. Acceptance of Terms",
          body: "By accessing and using Seatzo, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our platform."
        },
        {
          title: "2. Ticket Booking",
          body: "Tickets purchased through Seatzo are subject to availability. Seats are held for 5 minutes once you proceed to checkout. If payment is not completed within this window, seats are automatically released. Prices are inclusive of applicable taxes and convenience fees."
        },
        {
          title: "3. Payment",
          body: "All payments are processed securely through Stripe. We do not store your card details. Payment must be received in full before a booking is confirmed."
        },
        {
          title: "4. Cancellation & Refunds",
          body: "Booking cancellations are permitted only for PENDING bookings before payment is completed. Confirmed bookings are non-refundable except in cases of event cancellation by the organizer. In case of event cancellation, full refunds are processed automatically within 5-7 business days."
        },
        {
          title: "5. Event Changes",
          body: "If an event is postponed, your ticket remains valid for the rescheduled date. If an event is cancelled, you will receive a full refund. Seatzo is not responsible for changes made by event organizers."
        },
        {
          title: "6. User Responsibilities",
          body: "You agree to provide accurate information during registration and booking. You are responsible for maintaining the confidentiality of your account. Ticket scalping, resale at inflated prices, or transfer for commercial purposes is strictly prohibited."
        },
        {
          title: "7. Intellectual Property",
          body: "All content on Seatzo, including logos, text, graphics, and software, is the property of Seatzo Entertainment Pvt. Ltd. and is protected by copyright laws."
        },
        {
          title: "8. Limitation of Liability",
          body: "Seatzo shall not be liable for any indirect, incidental, or consequential damages arising from the use of our platform or attendance at events booked through Seatzo."
        },
        {
          title: "9. Governing Law",
          body: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra."
        },
        {
          title: "10. Contact",
          body: "For any questions regarding these Terms & Conditions, please contact us at support@seatzo.com."
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

export default Terms;