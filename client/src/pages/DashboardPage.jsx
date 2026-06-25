import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TodoList from '../components/TodoList';
import Pomodoro from '../components/Pomodoro';
import StudyHeatmap from '../components/StudyHeatmap';
import JudgmentTracker from '../components/JudgmentTracker';
import CountdownTimer from '../components/CountdownTimer';
import BadgesDisplay from '../components/BadgesDisplay';
import '../styles/Dashboard.css';

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Ayushi';

  if (loading) {
    return (
      <div>
        <div className="dash-skeleton" style={{ height: 120, marginBottom: 24 }} />
        <div className="dash-stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dash-skeleton" style={{ height: 130 }} />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || { videos: {}, pyqs: {}, tests: {} };
  const subjectProgress = data?.subjectProgress || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <section className="dashboard-header" id="dash-welcome">
        <h2 className="dashboard-title">
          Welcome back, {firstName}! 👋
        </h2>
        <p className="dashboard-subtitle">
          Keep up the momentum! 🔥 Study every day to build your streak.
        </p>
      </section>

      {/* 2-Column Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Top Row: Timer & Heatmap */}
        <div className="grid-timer">
          <CountdownTimer />
        </div>
        
        <div className="grid-heatmap premium-card">
          <StudyHeatmap />
        </div>

        {/* Left Column: To-Dos & Pomodoro */}
        <div className="grid-left">
          <div className="premium-card">
            <TodoList />
          </div>
          <div className="premium-card">
            <Pomodoro />
          </div>
          {/* Quick Actions */}
          <div className="premium-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>⚡ Quick Actions</h3>
            <div className="dash-actions" style={{ marginTop: 0 }}>
              <Link to="/classes" className="dash-action-btn">▶️ Watch Classes</Link>
              <Link to="/pyq" className="dash-action-btn">📝 Solve PYQs</Link>
              <Link to="/tests" className="dash-action-btn">📋 Take a Test</Link>
              <Link to="/chat" className="dash-action-btn">💬 Ask AI</Link>
            </div>
          </div>
        </div>

        {/* Right Column: Badges */}
        <div className="grid-right">
          <div className="premium-card" style={{ padding: 0 }}>
            <BadgesDisplay />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-stats premium-card">
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>📊 Overview Stats</h3>
          <div className="dash-stats" id="dash-stats">
            <div className="dash-stat-card">
              <h4>Total Tests</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', margin: '8px 0 0 0' }}>{stats.tests?.total || 0}</p>
            </div>
            <div className="dash-stat-card">
              <h4>Avg. Score</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', margin: '8px 0 0 0' }}>{stats.tests?.avgScore || 0}%</p>
            </div>
            <div className="dash-stat-card">
              <h4>Videos Watched</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6', margin: '8px 0 0 0' }}>{stats.videos?.watched || 0}</p>
            </div>
          </div>
        </div>

        {/* Full Width Row: Judgments */}
        <div className="grid-news premium-card">
          <JudgmentTracker />
        </div>

      </div>
    </div>
  );
}
