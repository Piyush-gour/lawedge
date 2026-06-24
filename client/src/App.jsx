import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClassesPage from './pages/ClassesPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import PYQPage from './pages/PYQPage';
import TestsPage from './pages/TestsPage';
import TakeTestPage from './pages/TakeTestPage';
import ProgressPage from './pages/ProgressPage';
import VaultPage from './pages/VaultPage';
import SyllabusPage from './pages/SyllabusPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminVideos from './pages/admin/AdminVideos';
import AdminPYQs from './pages/admin/AdminPYQs';
import AdminTests from './pages/admin/AdminTests';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with sidebar layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/:id" element={<VideoPlayerPage />} />
            <Route path="/pyq" element={<PYQPage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/tests/:id" element={<TakeTestPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/syllabus" element={<SyllabusPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="subjects" element={<AdminSubjects />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="pyqs" element={<AdminPYQs />} />
              <Route path="tests" element={<AdminTests />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
