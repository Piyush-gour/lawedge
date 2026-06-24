import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminPYQs() {
  const [pyqs, setPyqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear(),
    driveUrl: '',
  });

  const fetchPyqs = async () => {
    try {
      const res = await api.get('/pyqs');
      setPyqs(res.data.pyqs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPyqs();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: `CLAT PG ${new Date().getFullYear()} Paper`,
      year: new Date().getFullYear(),
      driveUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pyq) => {
    setEditingId(pyq._id);
    setFormData({
      title: pyq.title,
      year: pyq.year,
      driveUrl: pyq.driveUrl,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this PYQ?')) {
      try {
        await api.delete(`/pyqs/${id}`);
        fetchPyqs();
      } catch (err) {
        alert('Failed to delete PYQ');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.driveUrl.includes('drive.google.com')) {
      alert('Please enter a valid Google Drive URL');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/pyqs/${editingId}`, formData);
      } else {
        await api.post('/pyqs', formData);
      }
      setIsModalOpen(false);
      fetchPyqs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save PYQ');
    }
  };

  // Generate year options from 2014 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 2014; y--) {
    yearOptions.push(y);
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Manage PYQs</h3>
        <button className="admin-btn-primary" onClick={openAddModal}>+ Add PYQ</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Drive Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pyqs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  No PYQs added yet. Click "+ Add PYQ" to get started.
                </td>
              </tr>
            ) : (
              pyqs.map((pyq) => (
                <tr key={pyq._id}>
                  <td style={{ fontWeight: 500 }}>{pyq.title}</td>
                  <td>
                    <span style={{
                      background: '#eef2ff',
                      color: '#6366f1',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      {pyq.year}
                    </span>
                  </td>
                  <td>
                    <a
                      href={pyq.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#6366f1', fontWeight: 500, fontSize: '0.85rem' }}
                    >
                      Open in Drive ↗
                    </a>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-action-btn" onClick={() => openEditModal(pyq)}>Edit</button>
                      <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDelete(pyq._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <div className="admin-modal__title">{editingId ? 'Edit PYQ' : 'Add New PYQ'}</div>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal__body">
                <div className="form-group">
                  <label className="form-group__label">Title</label>
                  <input
                    required
                    type="text"
                    className="form-group__input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. CLAT PG 2023 Paper"
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Year</label>
                  <select
                    required
                    className="form-group__input"
                    value={formData.year}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        year,
                        title: editingId ? formData.title : `CLAT PG ${year} Paper`,
                      });
                    }}
                    style={{ background: 'white' }}
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Google Drive URL</label>
                  <input
                    required
                    type="url"
                    className="form-group__input"
                    value={formData.driveUrl}
                    onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 6 }}>
                    💡 Upload the PDF to your Google Drive, right-click → Share → "Anyone with the link", then paste that link here.
                  </p>
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save PYQ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
