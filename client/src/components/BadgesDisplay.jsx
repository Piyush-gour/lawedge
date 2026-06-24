import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function BadgesDisplay() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await api.get('/dashboard/badges');
        if (res.data.success) {
          setBadges(res.data.badges);
        }
      } catch (err) {
        console.error('Failed to load badges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) return null;

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div style={{ padding: '24px' }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏆</span> Your Achievements ({unlockedCount}/{badges.length} Unlocked)
        </h3>
        <span style={{ 
          fontSize: '1.2rem', 
          color: '#64748b', 
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          ▼
        </span>
      </div>
      
      {/* Always show unlocked badges when collapsed */}
      {!isExpanded && unlockedCount > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {badges.filter(b => b.unlocked).map(badge => (
            <div 
              key={`unlocked-${badge.id}`} 
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                border: '2px solid #3b82f6',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '1.8rem' }}>{badge.icon}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a' }}>{badge.name}</h4>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>UNLOCKED</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show all badges (locked + unlocked) when expanded */}
      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {badges.map(badge => (
            <div 
              key={badge.id} 
              style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                border: badge.unlocked ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
                background: badge.unlocked ? '#eff6ff' : '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                opacity: badge.unlocked ? 1 : 0.6,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '12px',
                filter: badge.unlocked ? 'none' : 'grayscale(100%) opacity(50%)'
              }}>
                {badge.icon}
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: badge.unlocked ? '#1e3a8a' : '#64748b' }}>
                {badge.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                {badge.description}
              </p>
              {badge.unlocked && (
                <span style={{ marginTop: '12px', background: '#3b82f6', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  UNLOCKED
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
