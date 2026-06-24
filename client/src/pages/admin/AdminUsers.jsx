import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the account for ${userName}? This action cannot be undone and will erase all their test attempts.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert('User deleted successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h1 className="admin-page__title">Student Analytics</h1>
        <p className="admin-page__subtitle">Loading user database...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="admin-page__title">Student Analytics & Users</h1>
          <p className="admin-page__subtitle">
            Manage your {users.length} registered students and track their test performance.
          </p>
        </div>
      </div>

      <div className="premium-card" style={{ overflowX: 'auto', background: 'white', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569' }}>Name</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569' }}>Email</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569' }}>Role</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569' }}>Tests Taken</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569' }}>Avg. Score</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569' }}>Joined On</th>
              <th style={{ padding: '16px', fontWeight: '700', color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                <td style={{ padding: '16px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    {user.name}
                    {user.role === 'admin' && <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ADMIN</span>}
                  </div>
                </td>
                <td style={{ padding: '16px', color: '#64748b' }}>{user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    background: user.role === 'admin' ? '#e0e7ff' : '#d1fae5', 
                    color: user.role === 'admin' ? '#4338ca' : '#047857',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px', fontWeight: 'bold', color: '#334155' }}>
                  {user.analytics?.totalTestsCompleted || 0}
                </td>
                <td style={{ padding: '16px' }}>
                  {user.analytics?.totalTestsCompleted > 0 ? (
                    <span style={{
                      color: user.analytics.averageScore >= 70 ? '#059669' : user.analytics.averageScore <= 40 ? '#dc2626' : '#d97706',
                      fontWeight: 'bold'
                    }}>
                      {user.analytics.averageScore}%
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                  {formatDate(user.createdAt)}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#f87171'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
            <h3>No users found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
