import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  BookOpen,
  User,
  LogOut,
  CheckCircle2,
  Sliders,
  Shield,
  Save,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();

  // 1. Theme State (persists to localStorage & document data-theme)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('edumind_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('edumind_theme', theme);
  }, [theme]);

  // 2. Notification Toggles
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    quizReminders: true,
    learningRecommendations: true
  });

  // 3. Learning Settings
  const [learningSettings, setLearningSettings] = useState({
    dailyStudyGoal: '2 hours',
    preferredDifficulty: 'Intermediate',
    preferredSubject: 'Data Structures'
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast('Notification preference updated.');
      return updated;
    });
  };

  const handleSaveLearning = (e) => {
    e.preventDefault();
    showToast('Learning configuration saved successfully.');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="card" style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <CheckCircle2 size={18} color="#10b981" />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="ai-page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Settings</h1>
              <span className="badge badge-primary">
                <SettingsIcon size={13} />
                <span>Preferences</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Customize your EduMind AI experience.
            </p>
          </div>
        </div>

        {/* SECTION 1: APPEARANCE */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <Sun size={20} color="var(--primary)" />
            <div>
              <h3>Appearance</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Select your preferred interface visual theme.
              </p>
            </div>
          </div>

          <div className="settings-theme-cards">
            {/* Light Theme Option */}
            <div
              className={`theme-option-card ${theme === 'light' ? 'active-theme' : ''}`}
              onClick={() => {
                setTheme('light');
                showToast('Light theme activated.');
              }}
            >
              <div className="theme-preview-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#4f46e5' }}>
                <Sun size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Light Theme</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Clean, crisp, high-contrast daytime study mode
                </p>
              </div>
              {theme === 'light' && (
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Active</span>
              )}
            </div>

            {/* Dark Theme Option */}
            <div
              className={`theme-option-card ${theme === 'dark' ? 'active-theme' : ''}`}
              onClick={() => {
                setTheme('dark');
                showToast('Dark theme activated.');
              }}
            >
              <div className="theme-preview-box" style={{ background: '#0b0f19', border: '1px solid #1e293b', color: '#818cf8' }}>
                <Moon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Dark Theme</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Sleek deep dark mode, easy on your eyes at night
                </p>
              </div>
              {theme === 'dark' && (
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Active</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <Bell size={20} color="var(--primary)" />
            <div>
              <h3>Notifications</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Choose which study alerts and reminders you receive.
              </p>
            </div>
          </div>

          <div className="settings-list">
            {/* Toggle 1: Study Reminders */}
            <div className="settings-row">
              <div className="settings-row-info">
                <h4>Study reminders</h4>
                <p>Receive notifications when your scheduled study session begins.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.studyReminders}
                  onChange={() => handleToggleNotification('studyReminders')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Toggle 2: Quiz Reminders */}
            <div className="settings-row">
              <div className="settings-row-info">
                <h4>Quiz reminders</h4>
                <p>Get notified about upcoming revision quizzes and weak topic tests.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.quizReminders}
                  onChange={() => handleToggleNotification('quizReminders')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Toggle 3: Learning Recommendations */}
            <div className="settings-row">
              <div className="settings-row-info">
                <h4>Learning recommendations</h4>
                <p>AI-suggested chapters, notes, and questions based on your study pattern.</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifications.learningRecommendations}
                  onChange={() => handleToggleNotification('learningRecommendations')}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: LEARNING */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <BookOpen size={20} color="var(--primary)" />
            <div>
              <h3>Learning</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Set your study targets and default subject preferences.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveLearning}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Option 1: Daily study goal */}
              <div className="form-group">
                <label className="form-label">Daily Study Goal</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                  value={learningSettings.dailyStudyGoal}
                  onChange={(e) => setLearningSettings({ ...learningSettings, dailyStudyGoal: e.target.value })}
                >
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4+ hours">4+ hours</option>
                </select>
              </div>

              {/* Option 2: Preferred difficulty */}
              <div className="form-group">
                <label className="form-label">Preferred Difficulty</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                  value={learningSettings.preferredDifficulty}
                  onChange={(e) => setLearningSettings({ ...learningSettings, preferredDifficulty: e.target.value })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Option 3: Preferred subjects */}
              <div className="form-group">
                <label className="form-label">Preferred Subjects</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                  value={learningSettings.preferredSubject}
                  onChange={(e) => setLearningSettings({ ...learningSettings, preferredSubject: e.target.value })}
                >
                  <option value="Data Structures">Data Structures</option>
                  <option value="Database Management">Database Management</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={15} />
                <span>Save Learning Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 4: ACCOUNT */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <User size={20} color="var(--primary)" />
            <div>
              <h3>Account</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Manage student profile details and session access.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Student Profile Session</h4>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Signed in as Alex (alex@example.com) • B.Tech Student
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/profile')}
                className="btn btn-outline btn-sm"
              >
                <User size={15} />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ color: '#ef4444' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
