import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function JudgmentTracker() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/news/sc-judgments');
        if (res.data.success) {
          setNews(res.data.news);
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
        setError('Failed to fetch latest judgments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div style={{ padding: '0' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚖️</span> Daily Supreme Court Judgments
      </h3>
      
      {loading ? (
        <p style={{ color: '#64748b' }}>Fetching latest cases...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : news.length === 0 ? (
        <p style={{ color: '#64748b' }}>No recent judgments found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {news.slice(0, 5).map((item, index) => (
            <div key={index} className="premium-card" style={{ padding: '12px 16px', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {item.title}
                  </a>
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.contentSnippet?.substring(0, 150).replace(/\n/g, ' ')}...
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.pubDate).toLocaleDateString()}</span>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold', marginTop: '4px' }}>{item.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
