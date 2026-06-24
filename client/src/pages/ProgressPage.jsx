import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import api from '../utils/api';
import '../styles/Progress.css';

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/dashboard/progress');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="progress-page">
        <div className="dash-skeleton" style={{ height: 100 }} />
        <div className="dash-skeleton" style={{ height: 350 }} />
      </div>
    );
  }

  if (!data || data.stats.totalTests === 0) {
    return (
      <div className="progress-page">
        <div className="dash-empty">
          <div className="dash-empty__icon">📈</div>
          <p className="dash-empty__text">You haven't taken any mock tests yet.</p>
          <Link to="/tests" className="admin-btn-primary" style={{ textDecoration: 'none', marginTop: 16 }}>
            Take a Test
          </Link>
        </div>
      </div>
    );
  }

  const { stats, chartData, recentActivity } = data;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="progress-tooltip">
          <p className="progress-tooltip__title">{dataPoint.title}</p>
          <p className="progress-tooltip__score">Score: {dataPoint.score}</p>
          <p className="progress-tooltip__percent">{dataPoint.percentage}%</p>
          <p className="progress-tooltip__date">{dataPoint.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1 className="progress-header__title">📈 My Progress</h1>
        <p className="progress-header__subtitle">Track your performance across all mock tests.</p>
      </div>

      {/* Stats Row */}
      <div className="progress-stats">
        <div className="progress-stat-card">
          <div className="progress-stat-card__icon" style={{ background: '#eef2ff', color: '#6366f1' }}>📋</div>
          <div>
            <div className="progress-stat-card__label">Total Tests Taken</div>
            <div className="progress-stat-card__value">{stats.totalTests}</div>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="progress-stat-card__icon" style={{ background: '#fef3c7', color: '#d97706' }}>⚖️</div>
          <div>
            <div className="progress-stat-card__label">Average Score</div>
            <div className="progress-stat-card__value">{stats.averagePercentage}%</div>
          </div>
        </div>
        <div className="progress-stat-card">
          <div className="progress-stat-card__icon" style={{ background: '#d1fae5', color: '#059669' }}>🏆</div>
          <div>
            <div className="progress-stat-card__label">Best Score</div>
            <div className="progress-stat-card__value">{stats.bestPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="progress-chart-container">
        <h3 className="progress-section-title">Performance Trend (Percentage)</h3>
        <div style={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c7d2fe', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPercent)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tests List */}
      <div className="progress-recent">
        <h3 className="progress-section-title">Recent Test Attempts</h3>
        <div className="progress-recent-list">
          {recentActivity.map((attempt) => (
            <div key={attempt._id} className="progress-recent-item">
              <div className="progress-recent-item__icon">
                {attempt.percentage >= 70 ? '🟢' : attempt.percentage >= 40 ? '🟡' : '🔴'}
              </div>
              <div className="progress-recent-item__info">
                <h4 className="progress-recent-item__title">{attempt.test?.title || 'Unknown Test'}</h4>
                <div className="progress-recent-item__meta">
                  {new Date(attempt.completedAt).toLocaleDateString('en-GB')} • {attempt.test?.subject?.name || 'Full Length'}
                </div>
              </div>
              <div className="progress-recent-item__score">
                <div className="progress-recent-item__percent">{attempt.percentage}%</div>
                <div className="progress-recent-item__fraction">{attempt.score}/{attempt.totalQuestions}</div>
              </div>
              <Link to={`/tests/${attempt.test?._id}`} className="progress-recent-item__btn">
                Review
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
