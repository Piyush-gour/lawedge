import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Vault.css';

export default function VaultPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Form State
  const [fileUrl, setFileUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [type, setType] = useState('bare_act');

  const subjects = ['General', 'Constitutional Law', 'Jurisprudence', 'Contract Law', 'IPC', 'CrPC', 'Evidence Act', 'Family Law', 'Property Law'];

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileUrl || !title) return alert('Please provide a Google Drive link and a title');

    setUploading(true);
    
    try {
      const res = await api.post('/documents', {
        title,
        subject,
        type,
        fileUrl
      });
      if (res.data.success) {
        setFileUrl('');
        setTitle('');
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="vault-page">
      <h1 className="vault-page__title">📚 Bare Acts & Notes Vault</h1>
      
      <div className="vault-page__layout">
        
        {/* Upload Form */}
        <div className="vault-form-card">
          <h3>Add New Document Link</h3>
          <form onSubmit={handleUpload} className="vault-form">
            <div>
              <label>Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="e.g. Constitution of India"
              />
            </div>

            <div>
              <label>Subject</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label>Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="bare_act">Bare Act (PDF)</option>
                <option value="note">Personal Notes</option>
                <option value="pyq">Past Year Paper</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label>Google Drive Link</label>
              <input 
                type="url" 
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)} 
                required 
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="vault-form__submit"
            >
              {uploading ? 'Adding...' : 'Add to Vault'}
            </button>
          </form>
        </div>

        {/* Document List */}
        <div className="vault-docs">
          {loading ? (
            <p>Loading your vault...</p>
          ) : error ? (
            <p className="vault-error">{error}</p>
          ) : documents.length === 0 ? (
            <div className="vault-empty">
              <p>Your vault is empty.</p>
              <p>Add your first Bare Act or Study Note link to get started!</p>
            </div>
          ) : (
            <div className="vault-docs-grid">
              {documents.map(doc => (
                <div key={doc._id} className="vault-doc-card">
                  <div className="vault-doc-card__top">
                    <span className="vault-doc-card__icon">
                      {doc.type === 'bare_act' ? '⚖️' : doc.type === 'note' ? '📝' : doc.type === 'pyq' ? '📄' : '📁'}
                    </span>
                    <button onClick={() => handleDelete(doc._id)} className="vault-doc-card__delete">&times;</button>
                  </div>
                  <h4 className="vault-doc-card__title">{doc.title}</h4>
                  <span className="vault-doc-card__subject">
                    {doc.subject}
                  </span>
                  <div className="vault-doc-card__actions">
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="vault-doc-card__link"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
