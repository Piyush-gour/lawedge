import { useState, useEffect } from 'react';
import api from '../../utils/api';

// Utility to extract YouTube ID from URL
function extractYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    instructor: '',
    language: 'Hinglish',
    duration: '',
  });

  const fetchData = async () => {
    try {
      const [vidRes, subRes] = await Promise.all([
        api.get('/videos'),
        api.get('/subjects')
      ]);
      setVideos(vidRes.data.videos);
      setSubjects(subRes.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setYoutubeUrl('');
    setFormData({
      title: '',
      subject: subjects.length > 0 ? subjects[0]._id : '',
      instructor: '',
      language: 'Hinglish',
      duration: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (video) => {
    setEditingId(video._id);
    setYoutubeUrl(`https://youtube.com/watch?v=${video.youtubeId}`);
    setFormData({
      title: video.title,
      subject: video.subject._id,
      instructor: video.instructor,
      language: video.language,
      duration: video.duration,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await api.delete(`/videos/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete video');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      alert('Invalid YouTube URL');
      return;
    }

    const payload = {
      ...formData,
      subject: formData.subject || (subjects.length > 0 ? subjects[0]._id : ''),
      youtubeId,
    };

    if (!payload.subject) {
      alert('Please create a subject first before adding a video.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/videos/${editingId}`, payload);
      } else {
        await api.post('/videos', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save video: ' + (err.response?.data?.message || err.message));
      console.error('Save video error:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Manage Videos</h3>
        <button className="admin-btn-primary" onClick={openAddModal}>+ Add Video</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Video</th>
              <th>Subject</th>
              <th>Instructor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={video.thumbnailUrl} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    <span style={{ fontWeight: 500 }}>{video.title}</span>
                  </div>
                </td>
                <td>{video.subject?.name}</td>
                <td>{video.instructor}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-action-btn" onClick={() => openEditModal(video)}>Edit</button>
                    <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDelete(video._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <div className="admin-modal__title">{editingId ? 'Edit Video' : 'Add New Video'}</div>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal__body">
                <div className="form-group">
                  <label className="form-group__label">YouTube URL</label>
                  <input
                    required
                    type="url"
                    className="form-group__input"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Title</label>
                  <input
                    required
                    type="text"
                    className="form-group__input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Subject</label>
                  <select
                    required
                    className="form-group__input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ background: 'white' }}
                  >
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Instructor</label>
                  <input
                    type="text"
                    className="form-group__input"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Duration (e.g., 1:20:00)</label>
                  <input
                    type="text"
                    className="form-group__input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Video</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
