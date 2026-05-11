import { useState, useEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const VerifyOrganisers = () => {
  const [organisers, setOrganisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/organisers/pending");
      setOrganisers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleVerify = async (id, status) => {
    setVerifying(id);
    try {
      await api.patch(`/admin/organisers/${id}/verify`, { status });
      toast.success(`Organiser ${status === 'verified' ? 'approved' : 'rejected'}`);
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed");
    } finally {
      setVerifying(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Security</p>
        <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Verify <span className="text-neutral-500">Organisers</span>
        </h1>
      </header>

      {organisers.length === 0 ? (
        <div className="bg-[#0e0e11] border border-white/5 rounded-[32px] p-20 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
          <p className="text-neutral-500 text-sm">No pending organiser verifications at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {organisers.map((org) => (
            <div key={org._id} className="bg-[#0e0e11] border border-white/5 rounded-[24px] p-6 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-bold border border-white/5">
                    {org.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{org.name}</h3>
                    <p className="text-xs text-neutral-500">{org.email}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedId(org)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/5 transition-all"
                  >
                    View ID Cards
                  </button>
                  <button
                    onClick={() => handleVerify(org._id, "verified")}
                    disabled={verifying === org._id}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerify(org._id, "rejected")}
                    disabled={verifying === org._id}
                    className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-xl border border-rose-500/20 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ID Viewer Modal */}
      {selectedId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0e0e11] border border-white/10 rounded-[32px] max-w-4xl w-full p-10 relative overflow-hidden">
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-white mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>Verification Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Front Side</p>
                <div className="aspect-[3/2] bg-neutral-900 rounded-2xl overflow-hidden border border-white/5">
                  <img
                    src={`http://localhost:5000/${selectedId.idCardFront}`}
                    className="w-full h-full object-cover"
                    alt="ID Front"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Back Side</p>
                <div className="aspect-[3/2] bg-neutral-900 rounded-2xl overflow-hidden border border-white/5">
                  <img
                    src={`http://localhost:5000/${selectedId.idCardBack}`}
                    className="w-full h-full object-cover"
                    alt="ID Back"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyOrganisers;
