import { Link } from "react-router-dom";

const faqs = [
  {
    q: "How do I book tickets?",
    a: "Browse events, select your seats on the seat map, and proceed to checkout. You'll need to create an account or sign in to complete your booking."
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes, you can cancel pending bookings from your dashboard. Note that confirmed bookings may have different cancellation policies depending on the event."
  },
  {
    q: "How long are seats held after selection?",
    a: "Seats are held for 5 minutes once you proceed to checkout. If your session expires before payment, you'll need to re-select your seats."
  },
  {
    q: "How do I get my tickets?",
    a: "After successful payment, you'll receive a booking confirmation with a QR code. Download the PDF ticket or show the QR code at the venue entry."
  },
  {
    q: "Are my payment details secure?",
    a: "Yes. All payments are processed by Stripe with bank-level encryption. We never store your card details on our servers."
  },
  {
    q: "What happens if an event is cancelled?",
    a: "In the rare case an event is cancelled, you'll be notified and refunded automatically according to our refund policy."
  },
  {
    q: "Can I transfer my ticket to someone else?",
    a: "Tickets are tied to your account. Please contact our support team if you need assistance with ticket transfers."
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe's secure payment gateway."
  },
];

const Help = () => (
  <div className="min-h-screen bg-white dark:bg-neutral-950 py-16 px-4">
    <div className="max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          Help & FAQ
        </h1>
        <p className="text-gray-500 dark:text-neutral-400 text-sm max-w-md mx-auto">
          Find answers to the most common questions about booking tickets on Seatzo.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="group bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none text-gray-900 dark:text-white font-bold text-sm select-none">
              <span>{f.q}</span>
              <svg className="w-4 h-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div className="px-5 pb-5 text-gray-500 dark:text-neutral-400 text-sm leading-relaxed pt-0">
              {f.a}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center bg-rose-500/8 border border-rose-500/15 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Still need help?</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">Our support team is available 24/7.</p>
        <Link to="/contact" className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-sm px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px">
          Contact Us
        </Link>
      </div>
    </div>
  </div>
);

export default Help;