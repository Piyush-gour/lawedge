import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Tests.css';

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get('/tests');
        setTests(res.data.tests);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) {
    return (
      <div className="tests-page dashboard-container">
        <div className="dash-skeleton" style={{ height: 120, marginBottom: 24 }} />
        <div className="tests-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-skeleton premium-card" style={{ height: 200 }} />
          ))}
        </div>
      </div>
    );
  }

  // Categorize Tests
  const filteredTests = tests.filter(test => {
    if (activeTab === 'all') return true;
    
    // A test without a subject or explicitly named "Full Length"
    const isFullLength = !test.subject || test.subject?.name?.toLowerCase().includes('full');
    
    if (activeTab === 'full-length') return isFullLength;
    if (activeTab === 'subject-wise') return !isFullLength;
    
    return true;
  });

  return (
    <div className="tests-page dashboard-container">
      {/* Header */}
      <section className="dashboard-header">
        <h2 className="dashboard-title">Mock Tests</h2>
        <p className="dashboard-subtitle">
          Practice with timed mock tests and track your competitive performance.
        </p>
      </section>

      {/* Categorized Tab Bar */}
      <div className="tests-tabs premium-card">
        <button 
          className={`tests-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Tests
        </button>
        <button 
          className={`tests-tab-btn ${activeTab === 'full-length' ? 'active' : ''}`}
          onClick={() => setActiveTab('full-length')}
        >
          Full-Length Mocks
        </button>
        <button 
          className={`tests-tab-btn ${activeTab === 'subject-wise' ? 'active' : ''}`}
          onClick={() => setActiveTab('subject-wise')}
        >
          Subject-Wise Mocks
        </button>
      </div>

      {/* Grid of Tests */}
      {filteredTests.length > 0 ? (
        <div className="tests-grid">
          {filteredTests.map((test) => (
            <div key={test._id} className="test-card premium-card" style={{ padding: '24px' }}>
              <div className="test-card__top">
                <div className="test-card__badge" style={{
                  background: test.subject?.color ? `${test.subject.color}15` : '#eef2ff',
                  color: test.subject?.color || '#6366f1',
                }}>
                  {test.subject?.icon || '📋'} {test.subject?.name || 'Full Length Simulator'}
                </div>
                <div className="test-card__difficulty" data-level={test.difficulty}>
                  {test.difficulty}
                </div>
              </div>

              <h3 className="test-card__title">{test.title}</h3>

              <div className="test-card__meta">
                <div className="test-card__meta-item">
                  <span>📝</span> {test.questions?.length || test.totalMarks} Qs
                </div>
                <div className="test-card__meta-item">
                  <span>⏱️</span> {test.duration} min
                </div>
                <div className="test-card__meta-item">
                  <span>🏆</span> {test.totalMarks} marks
                </div>
              </div>

              {test.attempt?.status === 'completed' ? (
                <div className="test-card__completed">
                  <div className="test-card__score" style={{ background: '#ecfdf5', color: '#059669', padding: '8px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', marginBottom: '12px' }}>
                    Score: {test.attempt.score}/{test.attempt.totalQuestions} ({test.attempt.percentage}%)
                  </div>
                  <Link to={`/tests/${test._id}`} className="test-card__btn test-card__btn--retake" style={{ width: '100%', textAlign: 'center' }}>
                    Retake Test
                  </Link>
                </div>
              ) : (
                <Link to={`/tests/${test._id}`} className="test-card__btn test-card__btn--start" style={{ width: '100%', textAlign: 'center' }}>
                  ▶ Start Test
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="dash-empty premium-card">
          <div className="dash-empty__icon">📋</div>
          <p className="dash-empty__text">No {activeTab === 'all' ? '' : activeTab.replace('-', ' ')} tests available yet.</p>
        </div>
      )}
    </div>
  );
}
