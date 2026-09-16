import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Zap,
  TrendingUp,
  Bot,
  PlayCircle,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronRight,
  FileCheck,
  Calendar
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
  const navigate = useNavigate();

  // 1. Overview Summary Cards
  const overviewStats = [
    {
      title: "Subjects",
      value: "6",
      subtitle: "Active",
      icon: BookOpen,
      iconBg: "#eef2ff",
      iconColor: "#4f46e5"
    },
    {
      title: "Study Hours",
      value: "24.5",
      subtitle: "hrs",
      icon: Clock,
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed"
    },
    {
      title: "Quizzes",
      value: "18",
      subtitle: "Completed",
      icon: Zap,
      iconBg: "#f0f9ff",
      iconColor: "#0ea5e9"
    },
    {
      title: "Overall Progress",
      value: "78%",
      subtitle: "On Track",
      icon: TrendingUp,
      iconBg: "#ecfdf5",
      iconColor: "#10b981"
    }
  ];

  // 2. Continue Learning Subject Cards
  const continueSubjects = [
    {
      id: 1,
      name: "Data Structures",
      code: "CS301",
      progress: 72,
      currentTopic: "Linked Lists",
      accentColor: "#4f46e5",
      bgLight: "#eef2ff"
    },
    {
      id: 2,
      name: "Database Management",
      code: "CS303",
      progress: 58,
      currentTopic: "SQL Basics",
      accentColor: "#7c3aed",
      bgLight: "#f5f3ff"
    },
    {
      id: 3,
      name: "Computer Networks",
      code: "CS304",
      progress: 45,
      currentTopic: "Network Fundamentals",
      accentColor: "#0ea5e9",
      bgLight: "#f0f9ff"
    }
  ];

  // 3. Quick Actions
  const quickActions = [
    {
      title: "Start Quiz",
      desc: "Test chapter knowledge",
      icon: Zap,
      path: "/quizzes",
      bg: "#eef2ff",
      color: "#4f46e5"
    },
    {
      title: "Ask AI",
      desc: "Instant doubt resolution",
      icon: Bot,
      path: "/assistant",
      bg: "#f5f3ff",
      color: "#7c3aed"
    },
    {
      title: "Study Subjects",
      desc: "Resume current syllabus",
      icon: BookOpen,
      path: "/subjects",
      bg: "#ecfdf5",
      color: "#10b981"
    },
    {
      title: "View Progress",
      desc: "Review weekly stats",
      icon: BarChart3,
      path: "/progress",
      bg: "#f0f9ff",
      color: "#0ea5e9"
    }
  ];

  // 4. Recent Activity Items
  const recentActivities = [
    {
      id: 1,
      title: "Completed \"Linked List Basics\" quiz",
      time: "Today",
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
      badge: "Scored 90%"
    },
    {
      id: 2,
      title: "Studied SQL Joins",
      time: "Yesterday",
      iconBg: "#eef2ff",
      iconColor: "#4f46e5",
      badge: "Topic Completed"
    },
    {
      id: 3,
      title: "Asked AI about Binary Trees",
      time: "Yesterday",
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
      badge: "AI Summary"
    },
    {
      id: 4,
      title: "Completed Computer Networks topic",
      time: "2 days ago",
      iconBg: "#f0f9ff",
      iconColor: "#0ea5e9",
      badge: "Module 1 Done"
    }
  ];

  // 5. Weekly Study Activity (Mon to Sun)
  const weeklyData = [
    { day: "Mon", hours: 3.5, height: "70%" },
    { day: "Tue", hours: 4.2, height: "84%" },
    { day: "Wed", hours: 2.8, height: "56%" },
    { day: "Thu", hours: 5.0, height: "100%", isHighest: true },
    { day: "Fri", hours: 3.0, height: "60%" },
    { day: "Sat", hours: 4.0, height: "80%" },
    { day: "Sun", hours: 2.0, height: "40%" }
  ];

  // 6. Recommended For You
  const recommendations = [
    {
      title: "Practice: Data Structures Quiz",
      type: "Quiz",
      buttonText: "Start Quiz",
      path: "/quizzes",
      accent: "#4f46e5",
      bg: "#eef2ff"
    },
    {
      title: "Revise: DBMS Normalization",
      type: "Revision",
      buttonText: "Ask AI",
      path: "/assistant",
      accent: "#7c3aed",
      bg: "#f5f3ff"
    },
    {
      title: "Learn: OS Process Management",
      type: "Topic",
      buttonText: "Study Now",
      path: "#continue-learning",
      accent: "#0ea5e9",
      bg: "#f0f9ff"
    }
  ];

  return (
    <DashboardLayout>
      {/* 1. Overview Summary Cards */}
      <section className="dash-section" style={{ marginTop: 0 }}>
        <div className="overview-cards-grid">
          {overviewStats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="overview-card">
                <div className="overview-icon" style={{ backgroundColor: item.iconBg, color: item.iconColor }}>
                  <Icon size={22} />
                </div>
                <div className="overview-details">
                  <span className="overview-title">{item.title}</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{item.value}</span>
                    <span className="overview-sub">{item.subtitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Quick Actions */}
      <section className="dash-section">
        <div className="section-header-compact">
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-actions-bar">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                className="quick-action-card"
                onClick={() => {
                  if (action.path.startsWith('#')) {
                    const el = document.getElementById(action.path.substring(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate(action.path);
                  }
                }}
              >
                <div className="quick-action-icon-circle" style={{ backgroundColor: action.bg, color: action.color }}>
                  <Icon size={20} />
                </div>
                <div className="quick-action-info">
                  <h4>{action.title}</h4>
                  <p>{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Main Two-Column Layout */}
      <div className="dashboard-grid-layout">
        {/* Left / Main Column */}
        <div className="dashboard-main-col">
          {/* Continue Learning Section */}
          <section id="continue-learning" className="dash-section" style={{ marginTop: 0 }}>
            <div className="section-header-compact">
              <div>
                <h3>Continue Learning</h3>
                <p>Pick up right where you left off</p>
              </div>
              <Link to="/subjects" style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                View All Subjects
              </Link>
            </div>

            <div className="continue-learning-list">
              {continueSubjects.map((sub) => (
                <div key={sub.id} className="continue-subject-card">
                  <div className="continue-subject-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{sub.name}</h4>
                        <span className="badge" style={{ backgroundColor: sub.bgLight, color: sub.accentColor, fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                          {sub.code}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                        Current topic: <strong style={{ color: 'var(--text-main)' }}>{sub.currentTopic}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: sub.accentColor }}>
                        {sub.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="progress-container" style={{ margin: '0.85rem 0 1rem' }}>
                    <div className="progress-track" style={{ height: 8 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${sub.progress}%`, backgroundColor: sub.accentColor }}
                      />
                    </div>
                  </div>

                  <div className="continue-subject-footer">
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Chapter 4 of 6 In Progress
                    </span>
                    <button
                      onClick={() => navigate(sub.name === 'Data Structures' ? '/subjects/data-structures' : sub.name === 'Database Management' ? '/subjects/database-management' : '/subjects/computer-networks')}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.45rem 1.1rem' }}
                    >
                      <span>Continue</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Weekly Study Progress Visual */}
          <section className="dash-section">
            <div className="section-header-compact">
              <div>
                <h3>Weekly Study Activity</h3>
                <p>Monitored hours for the current week</p>
              </div>
              <span className="badge badge-primary">24.5 hrs total</span>
            </div>

            <div className="weekly-chart-card">
              <div className="weekly-bars-container">
                {weeklyData.map((d, index) => (
                  <div key={index} className="weekly-bar-col">
                    <span className="bar-val-label">{d.hours}h</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${d.isHighest ? 'bar-highest' : ''}`}
                        style={{ height: d.height }}
                      />
                    </div>
                    <span className="bar-day-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right / Side Column */}
        <div className="dashboard-side-col">
          {/* AI Study Assistant Card */}
          <div className="ai-assistant-promo-card">
            <div className="ai-promo-top">
              <div className="ai-promo-icon">
                <Sparkles size={20} />
              </div>
              <span className="badge badge-primary" style={{ background: 'white', color: 'var(--primary)' }}>
                AI Powered
              </span>
            </div>

            <h4>Need help with a topic?</h4>
            <p>
              Ask EduMind AI to explain concepts, simplify difficult topics, or help you prepare for your exams.
            </p>

            <button
              onClick={() => navigate('/assistant')}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
            >
              <Bot size={17} />
              <span>Ask EduMind AI</span>
            </button>
          </div>

          {/* Recommended for You */}
          <div className="side-widget-card">
            <div className="section-header-compact" style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Recommended for You</h4>
            </div>

            <div className="recommendations-list">
              {recommendations.map((rec, i) => (
                <div key={i} className="recommendation-item">
                  <div>
                    <span className="rec-type-badge" style={{ backgroundColor: rec.bg, color: rec.accent }}>
                      {rec.type}
                    </span>
                    <h5 style={{ fontSize: '0.86rem', fontWeight: 600, marginTop: '0.35rem' }}>{rec.title}</h5>
                  </div>
                  <button
                    onClick={() => {
                      if (rec.path.startsWith('#')) {
                        const el = document.getElementById(rec.path.substring(1));
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate(rec.path);
                      }
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderColor: rec.accent, color: rec.accent }}
                  >
                    {rec.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="side-widget-card">
            <div className="section-header-compact" style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Recent Activity</h4>
            </div>

            <div className="recent-activity-timeline">
              {recentActivities.map((act) => (
                <div key={act.id} className="activity-timeline-item">
                  <div className="timeline-icon" style={{ backgroundColor: act.iconBg, color: act.iconColor }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="timeline-info">
                    <p className="timeline-title">{act.title}</p>
                    <div className="timeline-meta">
                      <span className="timeline-time">{act.time}</span>
                      <span className="timeline-badge">{act.badge}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
