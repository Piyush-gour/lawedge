import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AICopilot from './AICopilot';
import '../styles/Layout.css';

/* ─── SVG Icons for Sidebar ─── */
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const TestIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/classes', label: 'YouTube Classes', icon: <VideoIcon /> },
  { path: '/pyq', label: 'PYQ Bank', icon: <BookIcon /> },
  { path: '/tests', label: 'Mock Tests', icon: <TestIcon /> },
  { path: '/progress', label: 'Progress', icon: <ChartIcon /> },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/classes': 'YouTube Classes',
  '/pyq': 'PYQ Bank',
  '/tests': 'Mock Tests',
  '/progress': 'Progress Tracker',
  '/profile': 'My Profile',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const currentPath = window.location.pathname;
  const pageTitle = pageTitles[currentPath] || 'CLAT PG';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="app-layout">
      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`} id="sidebar">
        <div className="sidebar__header">
          <NavLink to="/dashboard" className="sidebar__brand" onClick={() => setSidebarOpen(false)}>
            <div className="sidebar__logo">
              <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
            <div>
              <div className="sidebar__title">CLAT PG</div>
              <div className="sidebar__subtitle">Prep Portal</div>
            </div>
          </NavLink>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar__section-label" style={{ marginTop: 'var(--space-md)' }}>Admin Access</div>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar__link-icon">⚙️</span>
                <span>Admin Panel</span>
              </NavLink>
            </>
          )}
        </nav>


      </aside>

      {/* Main Content */}
      <div className="app-content">
        <header className="app-header" id="app-header">
          <div className="app-header__left">
            <button
              className="app-header__menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              id="btn-menu"
            >
              <MenuIcon />
            </button>
            <h1 className="app-header__page-title">{pageTitle}</h1>
          </div>
          <div className="app-header__right">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="header-profile">
              <button 
                className="header-profile__trigger" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="header-profile__avatar" />
                ) : (
                  <div className="header-profile__avatar">{getInitials(user?.name)}</div>
                )}
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                    onClick={() => setProfileDropdownOpen(false)} 
                  />
                  <div className="header-profile__dropdown">
                    <div className="dropdown__header">
                      <div className="dropdown__name">{user?.name || 'User'}</div>
                      <div className="dropdown__email">{user?.email || ''}</div>
                    </div>
                    <NavLink 
                      to="/profile" 
                      className="dropdown__item" 
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <UserIcon /> My Profile
                    </NavLink>
                    <button 
                      className="dropdown__item dropdown__item--danger" 
                      onClick={handleLogout}
                    >
                      <LogoutIcon /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="app-page">
          <Outlet />
        </main>
      </div>

      {/* Global AI Copilot Integration */}
      <AICopilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
      
      {/* Floating Action Button (FAB) for Copilot */}
      {!copilotOpen && (
        <button 
          className="copilot-fab" 
          onClick={() => setCopilotOpen(true)}
          title="Open AI Legal Tutor"
        >
          🤖
        </button>
      )}

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="bottom-nav">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
            }
          >
            <span className="bottom-nav__icon">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
            }
          >
            <span className="bottom-nav__icon">⚙️</span>
            <span className="bottom-nav__label">Admin</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}
