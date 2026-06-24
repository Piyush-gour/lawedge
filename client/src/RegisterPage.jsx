import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { signInWithGoogle } from './googleAuth';
import {
  ArrowLeftIcon,
  EyeOffIcon,
  EyeIcon,
  GoogleIcon,
  FacebookIcon,
  AlertIcon,
  CheckIcon,
  UserIcon,
} from './Icons';
import SplashScreen from './components/SplashScreen';
import './RegisterPage.css';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth` : 'http://localhost:5000/api/auth';

/* ─── Password Strength Helper ─── */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak' };
  if (score <= 2) return { score: 2, label: 'Fair' };
  if (score <= 3) return { score: 3, label: 'Good' };
  return { score: 4, label: 'Strong' };
}

const strengthClasses = ['weak', 'fair', 'good', 'strong'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full name' });
      return;
    }
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter a password' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      if (res.data.success) {
        authLogin(res.data.token, res.data.user);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setMessage({ type: '', text: '' });
    setGoogleLoading(true);

    try {
      const credential = await signInWithGoogle();
      const res = await axios.post(`${API_URL}/google`, { credential });

      if (res.data.success) {
        authLogin(res.data.token, res.data.user);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Google sign-up failed. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <SplashScreen isVisible={loading || googleLoading} message="Preparing your portal..." />

      {/* ── Top Navigation Bar (reuses login-topbar styles) ── */}
      <nav className="login-topbar" id="register-topbar">
        <button
          className="login-topbar__back"
          id="btn-back-register"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon />
          <span>Back</span>
        </button>
        <Link to="/" className="login-topbar__create" id="link-login">
          Log in
        </Link>
      </nav>

      {/* ── Main Page ── */}
      <main className="register-page" id="register-page">
        {/* Logo & Heading */}
        <header className="register-header">
          <div className="register-header__logo" id="register-logo" aria-hidden="true">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className={`register-logo-img ${loading || googleLoading ? 'register-logo-img--taking-off' : ''}`}
            />
          </div>
          <h1 className="register-header__title">Create an account</h1>
          <p className="register-header__subtitle">Join us to get started</p>
        </header>

        {/* Status Message */}
        {message.text && (
          <div
            className={`login-message login-message--${message.type}`}
            id="register-message"
            role="alert"
          >
            {message.type === 'error' ? <AlertIcon /> : <CheckIcon />}
            {message.text}
          </div>
        )}

        {/* ── Split Content Area ── */}
        <div className="register-content" id="register-content">
          {/* Left: Registration Form */}
          <section className="register-form-section">
            <h2 className="register-form-section__title">Sign up with email</h2>

            <form onSubmit={handleRegister} noValidate>
              {/* Name Field */}
              <div className="form-group">
                <div className="form-group__label-row">
                  <label className="form-group__label" htmlFor="name-input">
                    Full name
                  </label>
                </div>
                <div className="form-group__input-wrapper">
                  <input
                    id="name-input"
                    className={`form-group__input ${
                      message.type === 'error' && !name ? 'form-group__input--error' : ''
                    }`}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=""
                    autoComplete="name"
                    aria-label="Full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <div className="form-group__label-row">
                  <label className="form-group__label" htmlFor="register-email-input">
                    Email address
                  </label>
                </div>
                <div className="form-group__input-wrapper">
                  <input
                    id="register-email-input"
                    className={`form-group__input ${
                      message.type === 'error' && !email ? 'form-group__input--error' : ''
                    }`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    autoComplete="email"
                    aria-label="Email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="form-group__label-row">
                  <label className="form-group__label" htmlFor="register-password-input">
                    Password
                  </label>
                  <button
                    type="button"
                    className="form-group__toggle"
                    id="btn-toggle-register-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    <span>{showPassword ? 'Show' : 'Hide'}</span>
                  </button>
                </div>
                <div className="form-group__input-wrapper">
                  <input
                    id="register-password-input"
                    className={`form-group__input ${
                      message.type === 'error' && !password
                        ? 'form-group__input--error'
                        : ''
                    }`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    aria-label="Password"
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <>
                    <div className="password-strength">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`password-strength__bar ${
                            level <= passwordStrength.score
                              ? `password-strength__bar--active password-strength__bar--${strengthClasses[passwordStrength.score - 1]}`
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                    <div
                      className={`password-strength__label password-strength__label--${strengthClasses[passwordStrength.score - 1]}`}
                    >
                      {passwordStrength.label}
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`register-btn ${loading ? 'register-btn--loading' : ''}`}
                id="btn-register"
                disabled={loading}
              >
                {loading && <span className="register-btn__spinner" />}
                Create account
              </button>
            </form>
          </section>

          {/* Vertical Divider */}
          <div className="register-divider" aria-hidden="true">
            <div className="register-divider__line" />
            <span className="register-divider__text">OR</span>
            <div className="register-divider__line" />
          </div>

          {/* Right: Social Sign-Up Buttons */}
          <section className="register-social-section">
            <button
              className={`social-btn social-btn--google ${googleLoading ? 'social-btn--loading' : ''}`}
              id="btn-google-register"
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
            >
              <span className="social-btn__icon">
                {googleLoading ? (
                  <span className="social-btn__spinner" />
                ) : (
                  <GoogleIcon />
                )}
              </span>
              <span className="social-btn__label">
                {googleLoading ? 'Signing up...' : 'Continue with Google'}
              </span>
            </button>

            <button className="social-btn social-btn--facebook" id="btn-facebook-register" type="button">
              <span className="social-btn__icon">
                <FacebookIcon />
              </span>
              <span className="social-btn__label">Continue with Facebook</span>
            </button>
          </section>
        </div>

        {/* Footer */}
        <footer className="register-footer" id="register-footer">
          <p className="register-footer__login-text">
            Already have an account?
            <Link to="/" className="register-footer__login-link" id="link-to-login">
              Log in
            </Link>
          </p>
          <p className="register-footer__legal">
            By creating an account, you agree to our{' '}
            <a href="#" target="_blank" rel="noopener noreferrer">Terms of Service</a> &amp;{' '}
            <a href="#" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </p>
        </footer>
      </main>
    </>
  );
}
