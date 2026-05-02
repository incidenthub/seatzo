import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success("Account pending. Check your email for the OTP.");
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#333] tracking-tighter">
            SEAT<span className="text-[#f84464]">ZO</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Join us for the best events</p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/20 focus:border-[#f84464] transition-all"
              />
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/20 focus:border-[#f84464] transition-all"
              />
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/20 focus:border-[#f84464] transition-all"
              />
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2">Account Type</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 text-[#333] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/20 focus:border-[#f84464] transition-all appearance-none cursor-pointer"
              >
                <option value="customer">Customer (Booking Tickets)</option>
                <option value="organiser">Organiser (Listing Events)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f84464] hover:bg-[#d63955] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[#f84464]/20 text-sm uppercase tracking-widest mt-4"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-8 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-[#f84464] font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;