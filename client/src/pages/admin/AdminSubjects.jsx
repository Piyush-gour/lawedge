import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📚',
    color: '#6366f1',
    order: 0,
  });

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      icon: '📚',
      color: '#6366f1',
      order: subjects.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingId(subject._id);
    setFormData({
      name: subject.name,
      slug: subject.slug,
      icon: subject.icon,
      color: subject.color,
      order: subject.order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? Videos attached to it may break.')) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
      } catch (err) {
        alert('Failed to delete subject');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/subjects/${editingId}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      alert('Failed to save subject. Make sure slug is unique.');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3>Manage Subjects</h3>
        <button className="admin-btn-primary" onClick={openAddModal}>+ Add Subject</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Slug</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      background: subject.color + '20', borderRadius: 4, fontSize: '0.9rem' 
                    }}>
                      {subject.icon}
                    </span>
                    <span style={{ fontWeight: 500, color: subject.color }}>{subject.name}</span>
                  </div>
                </td>
                <td>{subject.slug}</td>
                <td>{subject.order}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-action-btn" onClick={() => openEditModal(subject)}>Edit</button>
                    <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDelete(subject._id)}>Delete</button>
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
              <div className="admin-modal__title">{editingId ? 'Edit Subject' : 'Add New Subject'}</div>
              <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal__body">
                <div className="form-group">
                  <label className="form-group__label">Name</label>
                  <input
                    required
                    type="text"
                    className="form-group__input"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      setFormData({ ...formData, name, slug: editingId ? formData.slug : slug });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-group__label">Slug (URL friendly)</label>
                  <input
                    required
                    type="text"
                    className="form-group__input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-group__label">Icon (Emoji)</label>
                    <input
                      type="text"
                      className="form-group__input"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-group__label">Color (Hex)</label>
                    <input
                      type="color"
                      className="form-group__input"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{ padding: '2px', height: '42px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-group__label">Display Order</label>
                  <input
                    type="number"
                    className="form-group__input"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
