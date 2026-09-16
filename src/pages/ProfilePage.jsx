import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  BookOpen,
  Zap,
  Flame,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Sparkles,
  Award,
  Clock,
  Settings as SettingsIcon
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();

  // 1. Profile State (Demo frontend-only)
  const [profile, setProfile] = useState({
    name: 'Alex',
    role: 'B.Tech Student',
    email: 'alex@example.com',
    course: 'B.Tech',
    semester: '3rd Semester'
  });

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [saveToast, setSaveToast] = useState(false);

  // 2. Learning Preferences State
  const [learningPrefs, setLearningPrefs] = useState({
    learningStyle: 'Concept-based',
    dailyGoal: '2 hours',
    preferredSubject: 'Data Structures'
  });
  const [prefsToast, setPrefsToast] = useState(false);

  // Handle Edit Profile Actions
  const handleStartEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Handle Preferences Save
  const handleSavePrefs = (e) => {
    e.preventDefault();
    setPrefsToast(true);
    setTimeout(() => setPrefsToast(false), 3000);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Toast Notification */}
        {saveToast && (
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
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Profile updated successfully! (Frontend demo saved)</span>
          </div>
        )}

        {prefsToast && (
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
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Learning preferences saved!</span>
          </div>
        )}

        {/* Page Header */}
        <div className="ai-page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>My Profile</h1>
              <span className="badge badge-primary">
                <User size={13} />
                <span>Student</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Manage your student profile and learning preferences.
            </p>
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="btn btn-secondary btn-sm"
          >
            <SettingsIcon size={15} />
            <span>Go to Settings</span>
          </button>
        </div>

        {/* 3. Profile Statistics (3 Small Cards) */}
        <div className="profile-stats-grid">
          {/* Card 1: Topics Completed */}
          <div className="profile-stat-card">
            <div className="profile-stat-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={22} />
            </div>
            <div className="profile-stat-info">
              <h4>Topics Completed</h4>
              <div className="stat-value">34</div>
              <div className="stat-sub">Across 6 subjects</div>
            </div>
          </div>

          {/* Card 2: Quizzes Completed */}
          <div className="profile-stat-card">
            <div className="profile-stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <Zap size={22} />
            </div>
            <div className="profile-stat-info">
              <h4>Quizzes Completed</h4>
              <div className="stat-value">18</div>
              <div className="stat-sub">Avg. score: 85%</div>
            </div>
          </div>

          {/* Card 3: Study Streak */}
          <div className="profile-stat-card">
            <div className="profile-stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
              <Flame size={22} />
            </div>
            <div className="profile-stat-info">
              <h4>Study Streak</h4>
              <div className="stat-value">7 Days</div>
              <div className="stat-sub">Personal best 🔥</div>
            </div>
          </div>
        </div>

        {/* 1. Main Profile Card */}
        <div className="profile-hero-card">
          <div className="profile-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className="profile-avatar-circle">
                A
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>{profile.name}</h2>
                  <span className="badge badge-primary">{profile.role}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                  {profile.email} • {profile.course} ({profile.semester})
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={handleStartEdit}
                className="btn btn-outline btn-sm"
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* View Mode vs Edit Mode */}
          {!isEditing ? (
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">Full Name</div>
                <div className="profile-info-val">{profile.name}</div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">Email Address</div>
                <div className="profile-info-val">{profile.email}</div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">Degree / Course</div>
                <div className="profile-info-val">{profile.course}</div>
              </div>

              <div className="profile-info-item">
                <div className="profile-info-label">Academic Semester</div>
                <div className="profile-info-val">{profile.semester}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                    value={editForm.course}
                    onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="M.Tech">M.Tech</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn btn-secondary btn-sm"
                >
                  <X size={15} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2. Learning Preferences Section */}
        <div className="settings-section-card">
          <div className="settings-section-header">
            <Sparkles size={20} color="var(--primary)" />
            <div>
              <h3>Learning Preferences</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Personalize how EduMind AI tailors suggestions and explanations for you.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePrefs}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Option 1: Preferred Learning Style */}
              <div className="form-group">
                <label className="form-label">Preferred Learning Style</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                  value={learningPrefs.learningStyle}
                  onChange={(e) => setLearningPrefs({ ...learningPrefs, learningStyle: e.target.value })}
                >
                  <option value="Concept-based">Concept-based</option>
                  <option value="Problem-solving">Problem-solving</option>
                  <option value="Visual / Diagrams">Visual / Diagrams</option>
                  <option value="Exam Revision Notes">Exam Revision Notes</option>
                </select>
              </div>

              {/* Option 2: Daily Study Goal */}
              <div className="form-group">
                <label className="form-label">Daily Study Goal</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                  value={learningPrefs.dailyGoal}
                  onChange={(e) => setLearningPrefs({ ...learningPrefs, dailyGoal: e.target.value })}
                >
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                  <option value="4+ hours">4+ hours</option>
                </select>
              </div>

              {/* Option 3: Preferred Subjects */}
              <div className="form-group">
                <label className="form-label">Preferred Subjects</label>
                <select
                  className="form-input"
                  style={{ paddingLeft: '1rem', cursor: 'pointer' }}
                  value={learningPrefs.preferredSubject}
                  onChange={(e) => setLearningPrefs({ ...learningPrefs, preferredSubject: e.target.value })}
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
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
