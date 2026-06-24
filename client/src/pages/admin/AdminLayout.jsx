import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const adminTabs = [
    { path: '/admin/dashboard', label: 'Overview' },
    { path: '/admin/users', label: 'Students' },
    { path: '/admin/subjects', label: 'Subjects' },
    { path: '/admin/videos', label: 'Videos' },
    { path: '/admin/pyqs', label: 'PYQs' },
    { path: '/admin/tests', label: 'Tests' },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh' }}>
      <div className="admin-header">
        <h2 className="admin-header__title">Admin Panel</h2>
        <nav className="admin-tabs">
          {adminTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `admin-tabs__link ${isActive ? 'admin-tabs__link--active' : ''}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="admin-content" style={{ flexGrow: 1 }}>
        <Outlet />
      </div>

      {/* Admin Footer */}
      <footer style={{ marginTop: 'auto', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', background: 'white' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Grafiqly.in. All rights reserved.</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          For any support related to this website, contact <a href="mailto:grafiqly.in@gmail.com" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>grafiqly.in@gmail.com</a>
        </p>
      </footer>
    </div>
  );
}
