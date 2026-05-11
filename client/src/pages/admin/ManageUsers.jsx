import { useState, useEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("User role updated");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Management</p>
          <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Platform <span className="text-neutral-500">Users</span>
          </h1>
        </div>
        <div className="text-xs font-bold text-neutral-500">
          Total Users: <span className="text-white">{users.length}</span>
        </div>
      </header>

      <div className="bg-[#0e0e11] border border-white/5 rounded-[32px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">User</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Email</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Joined</th>
              <th className="px-6 py-5 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 text-xs font-bold border border-rose-500/10">
                      {user.name[0]}
                    </div>
                    <span className="text-sm font-bold text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-400">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                    user.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                    user.role === 'organiser' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    disabled={updating === user._id}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="bg-neutral-900 border border-white/10 text-xs font-bold text-neutral-300 rounded-lg px-2 py-1 outline-none focus:border-rose-500/50 transition-colors cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="organiser">Organiser</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
