import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "organiser") {
        navigate("/organiser/events");
      } else if (user.role === "admin") {
        navigate("/admin/events");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === "organiser") {
        navigate("/organiser/events");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#333] tracking-tighter">
            SEAT<span className="text-[#f84464]">ZO</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Please sign in to continue</p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#333] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/20 focus:border-[#f84464] transition-all"
              />
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-2">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-gray-50 border border-gray-200 text-[#333] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#f84464]/20 focus:border-[#f84464] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f84464] hover:bg-[#d63955] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-[#f84464]/20 text-sm uppercase tracking-widest"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-8 font-medium">
            New to Seatzo?{" "}
            <Link
              to="/register"
              className="text-[#f84464] font-bold hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
