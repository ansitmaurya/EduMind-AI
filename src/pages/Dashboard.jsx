import React, { useState, useEffect } from 'react';
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
  Calendar,
  FileText,
  Target,
  AlertTriangle,
  Info
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LearningMaterialsManager from '../components/LearningMaterialsManager';
import { getCompetencies, getRecommendations } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // Live Backend Data States for Competency Analysis & Recommendations
  const [competencies, setCompetencies] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const [compRes, recRes] = await Promise.all([
        getCompetencies('student_default'),
        getRecommendations('student_default')
      ]);
      if (compRes.success && compRes.data) {
        setCompetencies(compRes.data);
      }
      if (recRes.success && recRes.data) {
        setRecommendations(recRes.data);
      }
    }
    fetchStats();
  }, []);

  // 1. Overview Summary Cards (Live metrics from backend SQLite if available)
  const hasAttemptData = Boolean(competencies && competencies.has_data);
  const quizCount = hasAttemptData ? competencies.total_quizzes_taken : 0;
  const overallAcc = hasAttemptData ? `${Math.round(competencies.overall_accuracy_percentage)}%` : "—";

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
      value: quizCount.toString(),
      subtitle: hasAttemptData ? "Evaluated" : "No attempts yet",
      icon: Zap,
      iconBg: "#f0f9ff",
      iconColor: "#0ea5e9"
    },
    {
      title: "Competency Score",
      value: overallAcc,
      subtitle: hasAttemptData ? "Verified Accuracy" : "Take a quiz",
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
      title: "Competency Hub",
      desc: "Analyze skill gaps",
      icon: Target,
      path: "/progress",
      bg: "#ecfdf5",
      color: "#10b981"
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
      title: "Upload Notes",
      desc: "Extract text from PDF/DOCX",
      icon: FileText,
      path: "/materials",
      bg: "#fffbeb",
      color: "#d97706"
    },
    {
      title: "Study Subjects",
      desc: "Resume current syllabus",
      icon: BookOpen,
      path: "/subjects",
      bg: "#f0f9ff",
      color: "#0ea5e9"
    }
  ];

  // 4. Recent Activity Items
  const recentActivities = [
    {
      id: 1,
      title: "Completed \"Binary Trees\" assessment",
      time: "Today",
      iconBg: "#ecfdf5",
      iconColor: "#10b981",
      badge: "Evaluated in DB"
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
      title: "Asked AI about Tree Traversals",
      time: "Yesterday",
      iconBg: "#f5f3ff",
      iconColor: "#7c3aed",
      badge: "AI Summary"
    },
    {
      id: 4,
      title: "Uploaded OS Lecture Notes (PDF)",
      time: "2 days ago",
      iconBg: "#f0f9ff",
      iconColor: "#0ea5e9",
      badge: "Material Ready"
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
          {/* ===================================================================
              NEW STEP 5: COMPETENCY GAP ANALYSIS DASHBOARD SECTION
              =================================================================== */}
          <section className="dash-section" style={{ marginTop: 0 }}>
            <div className="card" style={{ padding: '1.4rem' }}>
              <div className="section-header-compact" style={{ marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={18} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                      Competency Assessment & Gap Analysis
                    </h3>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      Step 5 Engine
                    </span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Calculated from actual submitted quiz answers and topic tags in SQLite.
                  </p>
                </div>

                <Link
                  to="/progress"
                  style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>Full Report</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Methodology Explanation */}
              <div style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderLeft: '3px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Info size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>
                  Topics evaluated across ≥ 3 questions are classified as: <strong>Mastered</strong> (≥ 75%), <strong>Developing</strong> (50%–74%), or <strong>Needs Improvement</strong> (&lt; 50%).
                </span>
              </div>

              {competencies && competencies.has_data ? (
                <div>
                  {/* Topic Mastery Summary Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                        Good Understanding ({competencies.strengths.length})
                      </span>
                      <p style={{ margin: '0.25rem 0 0', fontWeight: 700, fontSize: '0.88rem', color: '#047857' }}>
                        {competencies.strengths.length > 0
                          ? competencies.strengths.map(s => s.topic).slice(0, 2).join(', ')
                          : 'Complete more quizzes to master topics'}
                      </p>
                    </div>

                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: competencies.gaps.length > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${competencies.gaps.length > 0 ? '#fecaca' : 'var(--border-light)'}` }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: competencies.gaps.length > 0 ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Needs Improvement ({competencies.gaps.length})
                      </span>
                      <p style={{ margin: '0.25rem 0 0', fontWeight: 700, fontSize: '0.88rem', color: competencies.gaps.length > 0 ? '#b91c1c' : 'var(--text-muted)' }}>
                        {competencies.gaps.length > 0
                          ? competencies.gaps.map(g => g.topic).slice(0, 2).join(', ')
                          : 'No critical gaps identified!'}
                      </p>
                    </div>
                  </div>

                  {/* Top 3 Topics Accuracy Progress */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {competencies.all_topics.slice(0, 3).map((t, idx) => {
                      const isMastered = t.status === 'mastered';
                      const isGap = t.status === 'needs_review';
                      const isInsufficient = t.status === 'insufficient_data';
                      const color = isMastered ? '#10b981' : isGap ? '#ef4444' : isInsufficient ? '#94a3b8' : '#f59e0b';

                      return (
                        <div key={idx} style={{ padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.topic}</span>
                            <span style={{ fontWeight: 800, color }}>
                              {isInsufficient ? 'Awaiting Data' : `${Math.round(t.accuracy_percentage)}% (${t.correct_count}/${t.total_questions})`}
                            </span>
                          </div>
                          <div className="progress-container" style={{ margin: 0 }}>
                            <div className="progress-track" style={{ height: 6, backgroundColor: '#e2e8f0' }}>
                              <div
                                className="progress-fill"
                                style={{
                                  width: isInsufficient ? '0%' : `${t.accuracy_percentage}%`,
                                  backgroundColor: color
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1.25rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    No quiz attempts recorded yet. Attempt an assessment to identify your competency strengths and gaps!
                  </p>
                  <Link to="/quizzes" className="btn btn-primary btn-sm">
                    Start a Practice Quiz
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Continue Learning Section */}
          <section id="continue-learning" className="dash-section">
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

          {/* Learning Materials & Document Processing (Phase 2) */}
          <LearningMaterialsManager />

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

          {/* ===================================================================
              RECOMMENDED FOR YOU: TIED TO REAL COMPETENCY GAPS (STEP 5)
              =================================================================== */}
          <div className="side-widget-card">
            <div className="section-header-compact" style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Personalized Recommendations</h4>
              </div>
            </div>

            {recommendations && recommendations.recommendations.length > 0 ? (
              <div className="recommendations-list">
                {recommendations.recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="recommendation-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="rec-type-badge" style={{
                        backgroundColor: rec.priority === 'high' ? '#fef2f2' : '#fffbeb',
                        color: rec.priority === 'high' ? '#991b1b' : '#92400e',
                        border: `1px solid ${rec.priority === 'high' ? '#fca5a5' : '#fde68a'}`
                      }}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rec.subject_code}</span>
                    </div>

                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0.1rem 0' }}>
                      {rec.title}
                    </h5>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                      {rec.action_step}
                    </p>

                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', width: '100%' }}>
                      {rec.has_matching_material && (
                        <button
                          onClick={() => navigate('/materials')}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
                        >
                          <FileText size={12} />
                          <span>Notes</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/quizzes')}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      >
                        <Zap size={12} />
                        <span>Practice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Take quizzes on your uploaded notes to unlock targeted recommendations!
                </p>
              </div>
            )}
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
