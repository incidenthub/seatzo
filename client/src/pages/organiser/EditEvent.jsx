import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['movie', 'music', 'concert', 'sports', 'standup', 'theatre', 'conference', 'festival', 'other'];

const inputStyle = {
  width: '100%', background: '#ffffff', border: '1px solid #e2e8f0',
  borderRadius: 12, padding: '12px 16px', color: '#0f172a', fontSize: 14,
  outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
};

const labelStyle = { 
  fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', 
  marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' 
};

const FormGroup = ({ label, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      const e = data.event;
      setForm({
        title: e.title || '',
        description: e.description || '',
        venue: e.venue || '',
        city: e.city || '',
        category: e.category || 'music',
        date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '',
        basePrice: e.basePrice ? e.basePrice / 100 : '', // convert to rupees for editing
        posterUrl: e.posterUrl || '',
        tags: Array.isArray(e.tags) ? e.tags.join(', ') : '',
      });
    } catch {
      toast.error('Failed to load event');
      navigate('/organiser/events');
    } finally {
      setLoading(false);
    }
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: Math.round(Number(form.basePrice) * 100), // convert to paise
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      };
      await api.put(`/events/${id}`, payload);
      toast.success('Event updated!');
      navigate('/organiser/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: 32, height: 32, border: '2px solid #7c3aed',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;700&display=swap');
        input:focus, select:focus, textarea:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.05); }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <button
          onClick={() => navigate('/organiser/events')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, marginBottom: 12, padding: 0, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
        >
          ← Back to events
        </button>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>
          Edit Event
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0', fontWeight: 500 }}>
          Sections and seat counts cannot be changed after creation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 20, padding: 32, marginBottom: 24,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
        }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 800,
            color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 24,
          }}>
            Event Details
          </div>

          <FormGroup label="EVENT TITLE *">
            <input style={inputStyle} value={form.title} onChange={e => setField('title', e.target.value)} required />
          </FormGroup>

          <FormGroup label="DESCRIPTION">
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.description} onChange={e => setField('description', e.target.value)} />
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="VENUE *">
              <input style={inputStyle} value={form.venue} onChange={e => setField('venue', e.target.value)} required />
            </FormGroup>
            <FormGroup label="CITY *">
              <input style={inputStyle} value={form.city} onChange={e => setField('city', e.target.value)} required />
            </FormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="CATEGORY">
              <select style={inputStyle} value={form.category} onChange={e => setField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="DATE & TIME *">
              <input style={inputStyle} type="datetime-local" value={form.date} onChange={e => setField('date', e.target.value)} required />
            </FormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <FormGroup label="BASE PRICE (₹) *">
              <input style={inputStyle} type="number" value={form.basePrice} onChange={e => setField('basePrice', e.target.value)} required />
            </FormGroup>
            <FormGroup label="POSTER URL">
              <input style={inputStyle} value={form.posterUrl} onChange={e => setField('posterUrl', e.target.value)} placeholder="https://..." />
            </FormGroup>
          </div>

          <FormGroup label="TAGS (comma separated)">
            <input style={inputStyle} value={form.tags} onChange={e => setField('tags', e.target.value)} placeholder="live, rock, outdoor" />
          </FormGroup>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/organiser/events')}
            style={{
              padding: '12px 32px', borderRadius: 12,
              background: 'white', border: '1px solid #e2e8f0',
              color: '#64748b', fontSize: 14, cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1, padding: '12px', borderRadius: 12,
              background: saving ? '#4c1d95' : '#7c3aed',
              border: 'none', color: '#fff', fontSize: 14,
              fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Syne', sans-serif",
              boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.2)'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;