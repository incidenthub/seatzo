import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/UI/Navbar';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const [events, setEvents] = useState([
    {
      _id: '1',
      title: 'Coldplay Live Concert',
      city: 'Mumbai',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalSeats: 1000,
      bookedSeats: 750,
      revenue: 3750000,
      status: 'published'
    },
    {
      _id: '2',
      title: 'Tech Conference 2024',
      city: 'Bangalore',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      totalSeats: 500,
      bookedSeats: 320,
      revenue: 1600000,
      status: 'published'
    }
  ]); // Mock data

  React.useEffect(() => {
    if (!token || userRole !== 'organiser') {
      navigate('/login');
    }
  }, [token, userRole, navigate]);

  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const totalBookings = events.reduce((sum, e) => sum + (e.bookedSeats || 0), 0);
  const avgOccupancy = Math.round(events.reduce((sum, e) => sum + ((e.bookedSeats / e.totalSeats) * 100), 0) / events.length);

  const handleEdit = (eventId) => {
    alert(`Edit event ${eventId} - would open edit form`);
  };

  const handleView = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleDelete = (eventId) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e._id !== eventId));
      alert('Event deleted successfully');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      <div style={{ paddingTop: '80px', maxWidth: '1400px', margin: '0 auto', padding: '80px 2rem 2rem 2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              📊 Event Manager
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
              Manage your events and view analytics
            </p>
          </div>
          <button
            onClick={() => alert('Create event form would open')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={20} /> Create Event
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={24} style={{ color: '#0066cc' }} />
              </div>
              <p style={{ color: '#6b7280', fontWeight: '600' }}>Active Events</p>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0066cc', marginBottom: '0.5rem' }}>
              {events.filter(e => e.status === 'published').length}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {events.filter(e => e.status === 'draft').length} in draft
            </p>
          </div>

          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} style={{ color: '#16a34a' }} />
              </div>
              <p style={{ color: '#6b7280', fontWeight: '600' }}>Total Bookings</p>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '0.5rem' }}>
              {totalBookings}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {avgOccupancy}% average occupancy
            </p>
          </div>

          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} style={{ color: '#92400e' }} />
              </div>
              <p style={{ color: '#6b7280', fontWeight: '600' }}>Total Revenue</p>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
              ₹{(totalRevenue / 100000).toFixed(1)}L
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              From {events.length} events
            </p>
          </div>

          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} style={{ color: '#4338ca' }} />
              </div>
              <p style={{ color: '#6b7280', fontWeight: '600' }}>Avg Revenue/Event</p>
            </div>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4338ca', marginBottom: '0.5rem' }}>
              ₹{Math.round(totalRevenue / events.length)}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Per event average
            </p>
          </div>
        </div>

        {/* Events Table */}
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#111827' }}>
              Your Events
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Event Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Occupancy</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Revenue</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => {
                  const occupancyPercent = Math.round((event.bookedSeats / event.totalSeats) * 100);
                  return (
                    <tr key={event._id} style={{ borderBottom: idx < events.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: '500', color: '#111827' }}>
                        {event.title}
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>📍 {event.city}</p>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.95rem', color: '#6b7280' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '100px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: occupancyPercent + '%', height: '100%', background: '#0066cc', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0066cc' }}>{occupancyPercent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.95rem', fontWeight: '600', color: '#0066cc' }}>
                        ₹{event.revenue}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {event.status === 'published' ? '✓ Published' : '📝 Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleView(event._id)}
                            title="View"
                            style={{ padding: '0.5rem', background: '#dbeafe', color: '#0066cc', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(event._id)}
                            title="Edit"
                            style={{ padding: '0.5rem', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event._id)}
                            title="Delete"
                            style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
