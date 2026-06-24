import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Classes.css';

export default function ClassesPage() {
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);

  useEffect(() => {
    const fetchClassesData = async () => {
      try {
        const [vidRes, subRes] = await Promise.all([
          api.get('/videos'),
          api.get('/subjects')
        ]);
        setVideos(vidRes.data.videos);
        setSubjects(subRes.data.subjects);
        
        // Auto-expand first subject if available
        if (subRes.data.subjects.length > 0) {
          setExpandedSubject(subRes.data.subjects[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassesData();
  }, []);

  if (loading) {
    return (
      <div className="classes-page">
        <div className="dash-skeleton" style={{ height: 200, marginBottom: 24 }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="dash-skeleton" style={{ height: 80, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  // Group videos by subject
  const groupedCurriculum = subjects.map(subject => {
    const subjectVideos = videos.filter(v => v.subject?._id === subject._id);
    return {
      ...subject,
      videos: subjectVideos,
      // Mock progress: In a real app, calculate based on user's watched history
      progress: Math.floor(Math.random() * subjectVideos.length)
    };
  }).filter(group => group.videos.length > 0);

  const toggleSubject = (id) => {
    setExpandedSubject(expandedSubject === id ? null : id);
  };

  return (
    <div className="classes-page dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <h2 className="dashboard-title">Master Curriculum</h2>
        <p className="dashboard-subtitle">
          Your complete CLAT PG syllabus, structured chapter-by-chapter.
        </p>
      </section>

      {/* Curriculum Accordion */}
      {groupedCurriculum.length > 0 ? (
        <div className="curriculum-container">
          {groupedCurriculum.map((group, index) => {
            const isExpanded = expandedSubject === group._id;
            const progressPct = group.videos.length > 0 ? Math.round((group.progress / group.videos.length) * 100) : 0;

            return (
              <div key={group._id} className="premium-card curriculum-module" style={{ padding: 0, marginBottom: '24px', overflow: 'hidden' }}>
                {/* Module Header */}
                <div 
                  className="module-header" 
                  onClick={() => toggleSubject(group._id)}
                  style={{ 
                    padding: '24px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                    background: isExpanded ? '#f8fafc' : 'white',
                    transition: 'background 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    <div style={{ 
                      width: '60px', height: '60px', borderRadius: '12px', 
                      background: `${group.color || '#3b82f6'}15`, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '2rem' 
                    }}>
                      {group.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#1e293b' }}>
                        Module {index + 1}: {group.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                          {group.videos.length} Chapters
                        </span>
                        {/* Progress Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progressPct}%`, background: group.color || '#3b82f6', borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>{progressPct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem', color: '#94a3b8', 
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s ease' 
                  }}>
                    ▼
                  </div>
                </div>

                {/* Chapter List */}
                {isExpanded && (
                  <div className="module-content" style={{ padding: '0' }}>
                    {group.videos.map((video, vIndex) => {
                      const isWatched = vIndex < group.progress; // Mock watched status

                      return (
                        <Link 
                          to={`/classes/${video._id}`} 
                          key={video._id} 
                          className="chapter-row"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '16px 24px', 
                            borderBottom: '1px solid #f1f5f9',
                            textDecoration: 'none',
                            transition: 'background 0.2s',
                            background: isWatched ? '#f8fafc' : 'white'
                          }}
                        >
                          <div style={{ width: '40px', color: '#94a3b8', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {vIndex + 1}.
                          </div>
                          
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: isWatched ? '#64748b' : '#0f172a', fontWeight: isWatched ? 'normal' : '600' }}>
                              {video.title}
                            </h4>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>By {video.instructor}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                              {video.duration || '1:00:00'}
                            </span>
                            
                            {isWatched ? (
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                ✓
                              </div>
                            ) : (
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="play-btn">
                                ▶
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dash-empty premium-card">
          <div className="dash-empty__icon">📭</div>
          <p className="dash-empty__text">No classes available yet.</p>
        </div>
      )}
    </div>
  );
}
