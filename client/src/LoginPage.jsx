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
  MailIcon,
  AlertIcon,
  CheckIcon,
} from './Icons';
import SplashScreen from './components/SplashScreen';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/auth` : 'http://localhost:5000/api/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage({ type: '', text: '' });
    setGoogleLoading(true);

    try {
      const credential = await signInWithGoogle();
      const res = await axios.post(`${API_URL}/google`, { credential });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Google sign-in failed. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <SplashScreen isVisible={loading || googleLoading} message="Taking you to orbit..." />

      {/* ── Top Navigation Bar ── */}
      <nav className="login-topbar" id="login-topbar">
        <button
          className="login-topbar__back"
          id="btn-back"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon />
          <span>Back</span>
        </button>
        <Link to="/register" className="login-topbar__create" id="link-create-account">
          Create an account
        </Link>
      </nav>

      {/* ── Main Page ── */}
      <main className="login-page" id="login-page">
        {/* Logo & Heading */}
        <header className="login-header">
          <div className="login-header__logo" id="login-logo" aria-hidden="true">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className={`login-logo-img ${loading || googleLoading ? 'login-logo-img--taking-off' : ''}`}
            />
          </div>
          <h1 className="login-header__title">Log in</h1>
        </header>

        {/* Status Message */}
        {message.text && (
          <div
            className={`login-message login-message--${message.type}`}
            id="login-message"
            role="alert"
          >
            {message.type === 'error' ? <AlertIcon /> : <CheckIcon />}
            {message.text}
          </div>
        )}

        {/* ── Split Content Area ── */}
        <div className="login-content" id="login-content">
          {/* Left: Email/Password Form */}
          <section className="login-form-section">
            <h2 className="login-form-section__title">Log in</h2>

            <form onSubmit={handleLogin} noValidate>
              {/* Email Field */}
              <div className="form-group">
                <div className="form-group__label-row">
                  <label className="form-group__label" htmlFor="email-input">
                    Email address
                  </label>
                </div>
                <div className="form-group__input-wrapper">
                  <input
                    id="email-input"
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
                  <label className="form-group__label" htmlFor="password-input">
                    Password
                  </label>
                  <button
                    type="button"
                    className="form-group__toggle"
                    id="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    <span>{showPassword ? 'Show' : 'Hide'}</span>
                  </button>
                </div>
                <div className="form-group__input-wrapper">
                  <input
                    id="password-input"
                    className={`form-group__input ${
                      message.type === 'error' && !password
                        ? 'form-group__input--error'
                        : ''
                    }`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    autoComplete="current-password"
                    aria-label="Password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`login-btn ${loading ? 'login-btn--loading' : ''}`}
                id="btn-login"
                disabled={loading}
              >
                {loading && <span className="login-btn__spinner" />}
                Log in
              </button>
            </form>
          </section>

          {/* Vertical Divider */}
          <div className="login-divider" aria-hidden="true">
            <div className="login-divider__line" />
            <span className="login-divider__text">OR</span>
            <div className="login-divider__line" />
          </div>

          {/* Right: Social Login Buttons */}
          <section className="login-social-section">
            <button
              className={`social-btn social-btn--google ${googleLoading ? 'social-btn--loading' : ''}`}
              id="btn-google"
              type="button"
              onClick={handleGoogleSignIn}
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
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            <button className="social-btn social-btn--facebook" id="btn-facebook" type="button">
              <span className="social-btn__icon">
                <FacebookIcon />
              </span>
              <span className="social-btn__label">Continue with Facebook</span>
            </button>

            <button
              className="social-btn social-btn--email"
              id="btn-signup-email"
              type="button"
              onClick={() => navigate('/register')}
            >
              <span className="social-btn__icon">
                <MailIcon />
              </span>
              <span className="social-btn__label">Sign up with email</span>
            </button>
          </section>
        </div>

        {/* Footer */}
        <footer className="login-footer" id="login-footer">
          <a href="#" className="login-footer__help" id="link-cant-login">
            Can&apos;t log in?
          </a>
          <p className="login-footer__legal">
            Secure Login with reCAPTCHA subject to
            <br />
            Google <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a> &amp;{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
          </p>
        </footer>
      </main>
    </>
  );
}

