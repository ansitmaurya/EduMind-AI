import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Bot,
  Zap,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Subjects', path: '/subjects', icon: BookOpen },
    { label: 'AI Assistant', path: '/assistant', icon: Bot },
    { label: 'Quizzes', path: '/quizzes', icon: Zap },
    { label: 'Progress', path: '/progress', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path) => {
    if (path.includes('#')) {
      return location.pathname + location.hash === path;
    }
    if (path === '/subjects' && location.pathname.startsWith('/subjects')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="dash-app-layout">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`dash-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Brand */}
        <div className="sidebar-brand">
          <Link to="/" className="brand-logo" onClick={() => setMobileSidebarOpen(false)}>
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>
            <span>EduMind <span className="gradient-text">AI</span></span>
          </Link>
          <button
            className="mobile-sidebar-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav" aria-label="Dashboard Sidebar">
          <div className="sidebar-section-title">Menu</div>
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${active ? 'active' : ''}`}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {active && <span className="active-indicator" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="sidebar-section-title" style={{ marginTop: '1.5rem' }}>Preferences</div>
          <ul className="sidebar-menu">
            <li>
              <Link
                to="/settings"
                className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Settings size={18} />
                <span>Settings</span>
                {isActive('/settings') && <span className="active-indicator" />}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dash-main-container">
        {/* Top Header */}
        <header className="dash-top-header">
          <div className="header-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
            <div className="header-greeting">
              <h2>Good Morning, Alex 👋</h2>
              <p>Ready to continue your learning journey?</p>
            </div>
          </div>

          <div className="header-right">
            {/* Notification Icon */}
            <div style={{ position: 'relative' }}>
              <button
                className="header-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="View notifications"
              >
                <Bell size={19} />
                <span className="notif-badge" />
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>3 New</span>
                  </div>
                  <div className="notif-list">
                    <div className="notif-item">
                      <p><strong>Quiz Reminder:</strong> Data Structures test tomorrow at 10 AM.</p>
                      <span>1 hour ago</span>
                    </div>
                    <div className="notif-item">
                      <p><strong>New Note Added:</strong> OS Process Scheduling summary is ready.</p>
                      <span>3 hours ago</span>
                    </div>
                    <div className="notif-item">
                      <p><strong>Streak Alert:</strong> You maintained your 7-day study streak!</p>
                      <span>Yesterday</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Student Profile Avatar */}
            <Link to="/profile" className="header-user-profile">
              <div className="user-avatar">
                <span>A</span>
              </div>
              <div className="user-info-text">
                <span className="user-name">Alex</span>
                <span className="user-role">B.Tech Student</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="dash-body-content">
          {children}
        </main>
      </div>
    </div>
  );
}
