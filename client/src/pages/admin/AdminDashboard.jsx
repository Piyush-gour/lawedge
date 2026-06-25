import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingActive, setLoadingActive] = useState(false);

  const isOwner = user?.email === 'grafiqly.in@gmail.com';

  useEffect(() => {
    // A quick way to get stats is to fetch subjects and videos and count them
    const fetchStats = async () => {
      try {
        const [subRes, vidRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/videos')
        ]);
        setStats({
          subjects: subRes.data.subjects?.length || 0,
          videos: vidRes.data.videos?.length || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();

    if (isOwner) {
      const fetchActiveUsers = async () => {
        setLoadingActive(true);
        try {
          const res = await api.get('/admin/active-users');
          if (res.data.success) {
            setActiveUsers(res.data.activeUsers);
          }
        } catch (err) {
          console.error('Failed to fetch active users', err);
        } finally {
          setLoadingActive(false);
        }
      };
      fetchActiveUsers();
      // Poll every 30 seconds
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isOwner]);

  return (
    <div className="admin-overview" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="admin-stat-card" style={{ flex: 1, minWidth: '200px' }}>
          <div className="admin-stat-card__title">Total Subjects</div>
          <div className="admin-stat-card__value">{stats?.subjects || 0}</div>
        </div>
        <div className="admin-stat-card" style={{ flex: 1, minWidth: '200px' }}>
          <div className="admin-stat-card__title">Total Videos</div>
          <div className="admin-stat-card__value">{stats?.videos || 0}</div>
        </div>
      </div>

      {isOwner && (
        <div className="admin-stat-card" style={{ padding: '24px', background: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="admin-stat-card__title" style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
            Live Active Users (Last 5 mins)
          </div>
          
          {loadingActive && activeUsers.length === 0 ? (
            <p style={{ color: '#64748b' }}>Loading active users...</p>
          ) : activeUsers.length === 0 ? (
            <p style={{ color: '#64748b' }}>No users active in the last 5 minutes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeUsers.map(u => {
                const minutesAgo = Math.floor((Date.now() - new Date(u.lastActiveAt).getTime()) / 60000);
                return (
                  <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                        {u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (u.name ? u.name[0].toUpperCase() : '?')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{u.name || 'Unnamed User'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        background: u.role === 'admin' ? '#fef08a' : '#e0e7ff',
                        color: u.role === 'admin' ? '#854d0e' : '#3730a3'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
                        {minutesAgo === 0 ? 'Active just now' : `Active ${minutesAgo}m ago`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
