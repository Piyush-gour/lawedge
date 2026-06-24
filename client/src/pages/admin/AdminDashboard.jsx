import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

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
  }, []);

  return (
    <div className="admin-overview">
      <div className="admin-stat-card">
        <div className="admin-stat-card__title">Total Subjects</div>
        <div className="admin-stat-card__value">{stats?.subjects || 0}</div>
      </div>
      <div className="admin-stat-card">
        <div className="admin-stat-card__title">Total Videos</div>
        <div className="admin-stat-card__value">{stats?.videos || 0}</div>
      </div>
    </div>
  );
}
