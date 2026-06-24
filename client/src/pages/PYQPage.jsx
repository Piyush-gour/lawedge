import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/PYQ.css';

// Helper to convert a normal Drive share URL to an embeddable preview URL
function getDrivePreviewUrl(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }
  return url; 
}

export default function PYQPage() {
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingPyq, setViewingPyq] = useState(null);

  useEffect(() => {
    const fetchPyqs = async () => {
      try {
        const res = await api.get('/pyqs');
        setPyqs(res.data.pyqs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPyqs();
  }, []);

  if (loading) {
    return (
      <div className="pyq-page split-layout">
        <div className="dash-skeleton" style={{ width: '300px', height: '80vh' }} />
        <div className="dash-skeleton" style={{ flex: 1, height: '80vh' }} />
      </div>
    );
  }

  // Group PYQs by year
  const groupedByYear = pyqs.reduce((acc, pyq) => {
    if (!acc[pyq.year]) acc[pyq.year] = [];
    acc[pyq.year].push(pyq);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

  return (
    <div className="pyq-page split-layout">
      
      {/* Left Sidebar Menu */}
      <div className="pyq-sidebar premium-card">
        <div className="pyq-sidebar__header">
          <h2>📝 PYQ Bank</h2>
          <p>Access Previous Year Questions.</p>
        </div>

        <div className="pyq-sidebar__content">
          {sortedYears.length > 0 ? (
            sortedYears.map((year) => (
              <div key={year} className="pyq-sidebar__year-section">
                <h3 className="pyq-sidebar__year-title">{year}</h3>
                <div className="pyq-sidebar__list">
                  {groupedByYear[year].map((pyq) => {
                    const isActive = viewingPyq?._id === pyq._id;
                    return (
                      <button
                        key={pyq._id}
                        className={`pyq-sidebar__item ${isActive ? 'active' : ''}`}
                        onClick={() => setViewingPyq(pyq)}
                      >
                        <span className="pyq-icon">📄</span>
                        <span className="pyq-title">{pyq.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', marginTop: '20px' }}>No PYQs found.</p>
          )}
        </div>
      </div>

      {/* Right PDF Viewer Pane */}
      <div className="pyq-viewer-pane premium-card">
        {viewingPyq ? (
          <div className="pyq-viewer-content">
            <div className="pyq-viewer-header">
              <h3>{viewingPyq.title} ({viewingPyq.year})</h3>
              <a
                href={viewingPyq.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pyq-download-btn"
              >
                ↗ Open in Google Drive
              </a>
            </div>
            <iframe
              src={getDrivePreviewUrl(viewingPyq.driveUrl)}
              title={viewingPyq.title}
              className="pyq-iframe"
              allow="autoplay"
            ></iframe>
          </div>
        ) : (
          <div className="pyq-empty-state">
            <div className="pyq-empty-icon">📖</div>
            <h3>Select a Past Paper</h3>
            <p>Choose a PYQ from the left menu to begin reading instantly.</p>
          </div>
        )}
      </div>

    </div>
  );
}
