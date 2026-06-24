import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckIcon, AlertIcon } from '../Icons';
import '../styles/Profile.css';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth` : 'http://localhost:5000/api/auth';

export default function ProfilePage() {
  const { user, token, login } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);

  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    return nameStr
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.put(
        `${API_URL}/profile`,
        { name, email, avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update global auth state with new user info
        login(token, res.data.user);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPassLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setPassMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Something went wrong.';
      setPassMessage({ type: 'error', text: errorMsg });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card__header">
          <div className="profile-card__avatar-section">
            <div className="profile-card__avatar">
              {avatar ? (
                <img src={avatar} alt="Profile Avatar" />
              ) : (
                <span>{getInitials(name)}</span>
              )}
            </div>
            <button 
              className="profile-btn profile-btn--secondary" 
              onClick={() => fileInputRef.current?.click()}
              type="button"
              style={{ padding: '6px 12px', fontSize: '0.8rem', marginTop: '8px' }}
            >
              Change Picture
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          <div>
            <h2 className="profile-card__title">Profile Settings</h2>
            <p className="profile-card__subtitle">Manage your personal information and preferences.</p>
          </div>
        </div>

        {message.text && (
          <div className={`profile-message profile-message--${message.type}`} role="alert">
            {message.type === 'error' ? <AlertIcon /> : <CheckIcon />}
            {message.text}
          </div>
        )}

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-form__group">
            <label className="profile-form__label" htmlFor="profile-name">
              Full Name
            </label>
            <input
              id="profile-name"
              className="profile-form__input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="profile-form__group">
            <label className="profile-form__label" htmlFor="profile-email">
              Email Address
            </label>
            <input
              id="profile-email"
              className={`profile-form__input ${(user?.provider && user?.provider !== 'local') ? 'profile-form__input--disabled' : ''}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={user?.provider && user?.provider !== 'local'} 
              title={(user?.provider && user?.provider !== 'local') ? `Logged in via ${user?.provider}. Email cannot be changed.` : ''}
            />
          </div>

          <div>
            <button
              type="submit"
              className="profile-btn"
              disabled={loading}
            >
              {loading && <span className="profile-btn__spinner" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {(!user?.provider || user?.provider === 'local') && (
        <div className="profile-card profile-card--password">
          <div className="profile-card__header">
            <div>
              <h2 className="profile-card__title">Change Password</h2>
              <p className="profile-card__subtitle">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>

          {passMessage.text && (
            <div className={`profile-message profile-message--${passMessage.type}`} role="alert">
              {passMessage.type === 'error' ? <AlertIcon /> : <CheckIcon />}
              {passMessage.text}
            </div>
          )}

          <form className="profile-form" onSubmit={handlePasswordUpdate}>
            <div className="profile-form__group">
              <label className="profile-form__label" htmlFor="current-password">
                Current Password
              </label>
              <input
                id="current-password"
                className="profile-form__input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="profile-form__group">
              <label className="profile-form__label" htmlFor="new-password">
                New Password
              </label>
              <input
                id="new-password"
                className="profile-form__input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="profile-form__group">
              <label className="profile-form__label" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                className="profile-form__input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="profile-btn profile-btn--danger-outline"
                disabled={passLoading}
              >
                {passLoading && <span className="profile-btn__spinner" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
