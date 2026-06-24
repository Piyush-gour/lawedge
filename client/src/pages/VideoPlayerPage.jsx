import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/VideoPlayer.css';

export default function VideoPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const [vidRes, progRes] = await Promise.all([
          api.get(`/videos/${id}`),
          // We can fetch progress for just this video, or all progress. 
          // Since our dashboard endpoint already fetches progress, we can add a specific endpoint if needed,
          // or just rely on a POST call. Let's just fetch the video and assume not watched initially,
          // unless the dashboard endpoint returns it. Actually, our backend doesn't have GET /videos/:id/progress yet.
          // For now, let's just default to not watched, and if they click it, we POST.
          // Or wait, /api/dashboard returns all recent activity. Let's keep it simple.
        ]);
        setVideo(vidRes.data.video);
      } catch (err) {
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [id]);

  const handleMarkWatched = async (e) => {
    const isWatched = e.target.checked;
    // We only have POST /api/videos/:id/progress which sets it to true right now (based on Phase 1 plan).
    // Let's call it if they check it.
    if (isWatched) {
      try {
        await api.post(`/videos/${id}/progress`);
        setProgress(true);
      } catch (err) {
        console.error('Failed to update progress', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="dash-skeleton" style={{ aspectRatio: '16/9', borderRadius: 12 }} />
        <div className="dash-skeleton" style={{ height: 40, width: '60%', marginTop: 24 }} />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="dash-empty">
        <div className="dash-empty__icon">⚠️</div>
        <p className="dash-empty__text">Video not found.</p>
        <button className="admin-btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/classes')}>
          Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="video-player-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="video-container">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-iframe"
        ></iframe>
      </div>

      <div className="video-details">
        <div className="video-header-row">
          <div>
            <div className="video-subject" style={{ color: video.subject?.color || '#6366f1' }}>
              {video.subject?.name}
            </div>
            <h1 className="video-title">{video.title}</h1>
          </div>
          
          <div className="video-actions">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                className="custom-checkbox" 
                checked={progress === true}
                onChange={handleMarkWatched}
                disabled={progress === true}
              />
              <span className="checkbox-text">Mark as Watched</span>
            </label>
          </div>
        </div>

        <div className="video-meta-row">
          <div className="meta-item">
            <span className="meta-icon">👨‍🏫</span>
            <span>{video.instructor}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🗣️</span>
            <span>{video.language}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <span>{video.duration || '1:00:00'}</span>
          </div>
        </div>

        <div className="video-description">
          <p>This class covers the essential concepts of {video.subject?.name} for CLAT PG preparation. Make sure to take notes and review the PYQs related to this topic after watching.</p>
        </div>
      </div>
    </div>
  );
}
