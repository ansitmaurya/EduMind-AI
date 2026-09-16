import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Bot,
  Zap,
  BookOpen,
  Calendar,
  Flame,
  ArrowRight,
  Info,
  Layers,
  ChevronDown,
  Check,
  Target
} from 'lucide-react';

// =============================================================================
// DEMO ANALYTICS DATA FOR DIFFERENT TIMEFRAMES
// =============================================================================
const ANALYTICS_DATA = {
  week: {
    studyTime: "24.5 hrs",
    studyTimeSub: "+12% from last week",
    topicsCompleted: "34",
    topicsSub: "6 this week",
    quizzesCompleted: "18",
    quizzesSub: "80% average score",
    streak: "7 Days",
    streakSub: "Keep it going!",
    weeklyBars: [
      { day: "Mon", fullDay: "Monday", hours: 2.5, height: "50%" },
      { day: "Tue", fullDay: "Tuesday", hours: 3.0, height: "60%" },
      { day: "Wed", fullDay: "Wednesday", hours: 4.0, height: "80%" },
      { day: "Thu", fullDay: "Thursday", hours: 2.0, height: "40%" },
      { day: "Fri", fullDay: "Friday", hours: 4.5, height: "90%" },
      { day: "Sat", fullDay: "Saturday", hours: 5.0, height: "100%", isHighest: true },
      { day: "Sun", fullDay: "Sunday", hours: 3.5, height: "70%" }
    ]
  },
  month: {
    studyTime: "98.0 hrs",
    studyTimeSub: "+18% from last month",
    topicsCompleted: "72",
    topicsSub: "28 this month",
    quizzesCompleted: "42",
    quizzesSub: "82% average score",
    streak: "24 Days",
    streakSub: "Excellent consistency!",
    weeklyBars: [
      { day: "W1", fullDay: "Week 1", hours: 22.5, height: "75%" },
      { day: "W2", fullDay: "Week 2", hours: 26.0, height: "88%" },
      { day: "W3", fullDay: "Week 3", hours: 21.0, height: "70%" },
      { day: "W4", fullDay: "Week 4", hours: 28.5, height: "100%", isHighest: true }
    ]
  },
  semester: {
    studyTime: "280.5 hrs",
    studyTimeSub: "On track for finals",
    topicsCompleted: "120",
    topicsSub: "78% syllabus finished",
    quizzesCompleted: "96",
    quizzesSub: "84% average score",
    streak: "65 Days",
    streakSub: "Master Level Streak",
    weeklyBars: [
      { day: "M1", fullDay: "Month 1", hours: 62.0, height: "72%" },
      { day: "M2", fullDay: "Month 2", hours: 78.0, height: "90%" },
      { day: "M3", fullDay: "Month 3", hours: 86.5, height: "100%", isHighest: true },
      { day: "M4", fullDay: "Month 4 (Cur)", hours: 54.0, height: "65%" }
    ]
  }
};

export default function ProgressPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('week');

  const currentData = ANALYTICS_DATA[timeframe] || ANALYTICS_DATA.week;

  // 4 Subjects Progress Data
  const subjectsProgress = [
    {
      id: 1,
      name: "Data Structures",
      code: "CS301",
      progress: 72,
      status: "In Progress",
      color: "#4f46e5",
      bg: "#eef2ff"
    },
    {
      id: 2,
      name: "Database Management",
      code: "CS303",
      progress: 58,
      status: "In Progress",
      color: "#7c3aed",
      bg: "#f5f3ff"
    },
    {
      id: 3,
      name: "Computer Networks",
      code: "CS304",
      progress: 45,
      status: "In Progress",
      color: "#0ea5e9",
      bg: "#f0f9ff"
    },
    {
      id: 4,
      name: "Operating Systems",
      code: "CS302",
      progress: 64,
      status: "In Progress",
      color: "#10b981",
      bg: "#ecfdf5"
    }
  ];

  // Recent Quiz Scores
  const recentQuizScores = [
    { name: "Quiz 1", topic: "Array Operations", score: 70, color: "#4f46e5" },
    { name: "Quiz 2", topic: "Linked List Basics", score: 82, color: "#4f46e5" },
    { name: "Quiz 3", topic: "SQL Relational Algebra", score: 76, color: "#7c3aed" },
    { name: "Quiz 4", topic: "OS CPU Scheduling", score: 90, color: "#10b981" },
    { name: "Quiz 5", topic: "Computer Networks OSI", score: 85, color: "#0ea5e9" }
  ];

  // Strengths
  const strengthsList = [
    {
      title: "Data Structures",
      desc: "Solid grasp on Linear arrays & linked lists with quick solution speed.",
      icon: CheckCircle2,
      color: "#10b981",
      bg: "#ecfdf5"
    },
    {
      title: "SQL Basics",
      desc: "Strong performance in relational queries, joins, and DDL syntax.",
      icon: CheckCircle2,
      color: "#10b981",
      bg: "#ecfdf5"
    },
    {
      title: "Basic Networking",
      desc: "Clear understanding of the 7-layer OSI model and IP addressing.",
      icon: CheckCircle2,
      color: "#10b981",
      bg: "#ecfdf5"
    }
  ];

  // Areas to Improve
  const areasToImproveList = [
    {
      title: "Binary Trees",
      desc: "Practice recursive traversals, height calculation, and BST insertions.",
      icon: AlertCircle,
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "Database Normalization",
      desc: "Review 2NF & 3NF functional dependencies and decomposition rules.",
      icon: AlertCircle,
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "Operating System Processes",
      desc: "Review process synchronization, semaphores, and deadlock conditions.",
      icon: AlertCircle,
      color: "#f59e0b",
      bg: "#fffbeb"
    }
  ];

  // Achievements List
  const achievements = [
    {
      id: 1,
      title: "Quiz Master",
      desc: "Completed 10+ quizzes with verified scores",
      icon: Award,
      badgeColor: "#4f46e5",
      badgeBg: "#eef2ff"
    },
    {
      id: 2,
      title: "Consistent Learner",
      desc: "Maintained a 7-day continuous study streak",
      icon: Flame,
      badgeColor: "#f59e0b",
      badgeBg: "#fffbeb"
    },
    {
      id: 3,
      title: "Subject Explorer",
      desc: "Enrolled & studied all 4 semester subjects",
      icon: BookOpen,
      badgeColor: "#7c3aed",
      badgeBg: "#f5f3ff"
    },
    {
      id: 4,
      title: "Fast Learner",
      desc: "Completed a major topic ahead of exam schedule",
      icon: Zap,
      badgeColor: "#10b981",
      badgeBg: "#ecfdf5"
    }
  ];

  return (
    <DashboardLayout>
      <div className="progress-page-wrapper">
        {/* ===================================================================
            1. PAGE HEADER & TIMEFRAME FILTER
            =================================================================== */}
        <div className="ai-page-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Your Learning Progress</h1>
              <span className="badge badge-primary">
                <BarChart3 size={13} />
                <span>Analytics Dashboard</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track your study activity, quiz performance, and learning journey.
            </p>
          </div>

          {/* Timeframe Filter Dropdown / Pills */}
          <div className="timeframe-selector-group">
            <button
              className={`timeframe-tab-btn ${timeframe === 'week' ? 'tab-active' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              This Week
            </button>
            <button
              className={`timeframe-tab-btn ${timeframe === 'month' ? 'tab-active' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              This Month
            </button>
            <button
              className={`timeframe-tab-btn ${timeframe === 'semester' ? 'tab-active' : ''}`}
              onClick={() => setTimeframe('semester')}
            >
              This Semester
            </button>
          </div>
        </div>

        {/* ===================================================================
            2. SUMMARY CARDS (4 CARDS)
            =================================================================== */}
        <div className="overview-cards-grid" style={{ marginBottom: '1.75rem' }}>
          {/* Card 1: Study Time */}
          <div className="overview-card">
            <div className="overview-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
              <Clock size={22} />
            </div>
            <div className="overview-details">
              <span className="overview-title">Study Time</span>
              <div className="overview-value-row">
                <span className="overview-value">{currentData.studyTime}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                <TrendingUp size={12} /> {currentData.studyTimeSub}
              </span>
            </div>
          </div>

          {/* Card 2: Topics Completed */}
          <div className="overview-card">
            <div className="overview-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
              <BookOpen size={22} />
            </div>
            <div className="overview-details">
              <span className="overview-title">Topics Completed</span>
              <div className="overview-value-row">
                <span className="overview-value">{currentData.topicsCompleted}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                {currentData.topicsSub}
              </span>
            </div>
          </div>

          {/* Card 3: Quizzes Completed */}
          <div className="overview-card">
            <div className="overview-icon" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
              <Zap size={22} />
            </div>
            <div className="overview-details">
              <span className="overview-title">Quizzes Completed</span>
              <div className="overview-value-row">
                <span className="overview-value">{currentData.quizzesCompleted}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
                {currentData.quizzesSub}
              </span>
            </div>
          </div>

          {/* Card 4: Learning Streak */}
          <div className="overview-card">
            <div className="overview-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <Flame size={22} />
            </div>
            <div className="overview-details">
              <span className="overview-title">Learning Streak</span>
              <div className="overview-value-row">
                <span className="overview-value">{currentData.streak}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
                {currentData.streakSub}
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. WEEKLY STUDY ACTIVITY & SUBJECT PROGRESS (MAIN 2-COL GRID)
            =================================================================== */}
        <div className="progress-main-grid">
          {/* Left Column: Weekly Study Activity Chart */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3>Weekly Study Activity</h3>
                <p>Track your focused revision hours throughout the cycle</p>
              </div>
              <span className="badge badge-primary">{currentData.studyTime} Recorded</span>
            </div>

            <div className="weekly-activity-chart-wrapper">
              <div className="activity-chart-bars-row">
                {currentData.weeklyBars.map((bar, i) => (
                  <div key={i} className="activity-bar-column">
                    <span className="activity-bar-value">{bar.hours}h</span>
                    <div className="activity-bar-track">
                      <div
                        className={`activity-bar-fill ${bar.isHighest ? 'bar-highest-active' : ''}`}
                        style={{ height: bar.height }}
                        title={`${bar.fullDay}: ${bar.hours} hrs`}
                      />
                    </div>
                    <span className="activity-bar-day">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Average Daily Study: <strong>3.5 hrs</strong></span>
              <span>Peak Day: <strong>Saturday (5.0 hrs)</strong></span>
            </div>
          </div>

          {/* Right Column: Subject Progress */}
          <div className="card">
            <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3>Subject Progress</h3>
                <p>Syllabus completion rate by course</p>
              </div>
              <button
                onClick={() => navigate('/subjects')}
                style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View Subjects
              </button>
            </div>

            <div className="subject-progress-bars-list">
              {subjectsProgress.map((sub) => (
                <div key={sub.id} className="subject-progress-item">
                  <div className="subject-progress-header">
                    <div>
                      <span className="subject-prog-name">{sub.name}</span>
                      <span className="badge" style={{ backgroundColor: sub.bg, color: sub.color, marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                        {sub.code}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="subject-prog-status">{sub.status}</span>
                      <span className="subject-prog-percent" style={{ color: sub.color }}>
                        {sub.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="progress-container" style={{ margin: '0.5rem 0 0' }}>
                    <div className="progress-track" style={{ height: 8 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
            4. QUIZ PERFORMANCE ANALYTICS
            =================================================================== */}
        <div className="card" style={{ marginTop: '1.75rem' }}>
          <div className="section-header-compact" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3>Quiz Performance</h3>
              <p>Scores and trends from recent subject practice tests</p>
            </div>
            <button
              onClick={() => navigate('/quizzes')}
              className="btn btn-outline btn-sm"
            >
              <Zap size={14} />
              <span>Take Another Quiz</span>
            </button>
          </div>

          {/* Metrics Trio */}
          <div className="quiz-performance-metrics-strip">
            <div className="quiz-metric-item">
              <span className="metric-val" style={{ color: '#10b981' }}>80%</span>
              <span className="metric-lbl">Average Score</span>
            </div>
            <div className="quiz-metric-item">
              <span className="metric-val" style={{ color: 'var(--primary)' }}>95%</span>
              <span className="metric-lbl">Best Score</span>
            </div>
            <div className="quiz-metric-item">
              <span className="metric-val" style={{ color: '#7c3aed' }}>18</span>
              <span className="metric-lbl">Quizzes Completed</span>
            </div>
          </div>

          {/* Recent Quiz Scores Trend Visual */}
          <div className="recent-quizzes-trend-box">
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Recent Practice Quiz Scores Trend
            </h4>

            <div className="quiz-score-bars-container">
              {recentQuizScores.map((q, idx) => (
                <div key={idx} className="quiz-score-row">
                  <div className="quiz-score-meta">
                    <span className="q-label-tag">{q.name}</span>
                    <span className="q-topic-label">{q.topic}</span>
                  </div>

                  <div className="quiz-score-progress-wrap">
                    <div className="progress-track" style={{ height: 10, background: '#f1f5f9' }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${q.score}%`, backgroundColor: q.color }}
                      />
                    </div>
                  </div>

                  <span className="quiz-score-val-badge" style={{ color: q.color }}>
                    {q.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
            5. STRENGTHS & AREAS TO IMPROVE (2 CARDS SIDE-BY-SIDE)
            =================================================================== */}
        <div className="strengths-weaknesses-grid" style={{ marginTop: '1.75rem' }}>
          {/* Card 1: Your Strengths */}
          <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Your Strengths</h3>
            </div>

            <div className="insight-items-list">
              {strengthsList.map((item, idx) => (
                <div key={idx} className="insight-item">
                  <div className="insight-bullet-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                    <Check size={14} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{item.title}</h5>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.45' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Areas to Improve */}
          <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Areas to Improve</h3>
            </div>

            <div className="insight-items-list">
              {areasToImproveList.map((item, idx) => (
                <div key={idx} className="insight-item">
                  <div className="insight-bullet-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                    <Target size={14} />
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{item.title}</h5>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.45' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
            6. AI-BASED RECOMMENDATION PREVIEW
            =================================================================== */}
        <div className="ai-recommendation-preview-card" style={{ marginTop: '1.75rem' }}>
          <div className="rec-preview-left">
            <div className="brand-icon" style={{ width: 44, height: 44, borderRadius: 12 }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Personalized Learning Recommendation
                </h3>
                <span className="prototype-mode-badge" style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem' }}>
                  Prototype Recommendation
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                Based on your current learning activity, you should spend some time revising <strong>Binary Trees</strong> and <strong>Database Normalization</strong>.
              </p>
            </div>
          </div>

          <div className="rec-preview-actions">
            <button
              onClick={() => navigate('/subjects')}
              className="btn btn-secondary"
            >
              <BookOpen size={16} />
              <span>Study Now</span>
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="btn btn-primary"
            >
              <Bot size={16} />
              <span>Ask EduMind AI</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            7. RECENT ACHIEVEMENTS
            =================================================================== */}
        <div style={{ marginTop: '2rem' }}>
          <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h3>Achievements</h3>
              <p>Milestones earned during your exam preparation</p>
            </div>
            <span className="badge badge-success">4 Badges Earned</span>
          </div>

          <div className="achievements-grid">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div key={ach.id} className="achievement-item-card">
                  <div className="achievement-icon-circle" style={{ backgroundColor: ach.badgeBg, color: ach.badgeColor }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="achievement-title">{ach.title}</h4>
                    <p className="achievement-desc">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
