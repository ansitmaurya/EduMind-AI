import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Check,
  Target,
  RefreshCw,
  AlertTriangle,
  FileText,
  FileQuestion,
  HelpCircle
} from 'lucide-react';
import { getCompetencies, getRecommendations } from '../services/api';

export default function ProgressPage() {
  const navigate = useNavigate();

  // Live Backend Data States
  const [competencies, setCompetencies] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'gaps' | 'strengths' | 'developing'

  useEffect(() => {
    loadCompetencyData();
  }, []);

  const loadCompetencyData = async () => {
    setLoading(true);
    setError(null);

    const [compRes, recRes] = await Promise.all([
      getCompetencies(),
      getRecommendations()
    ]);

    setLoading(false);

    if (compRes.success && compRes.data) {
      setCompetencies(compRes.data);
    } else {
      setError(compRes.error || 'Failed to load competency analysis.');
    }

    if (recRes.success && recRes.data) {
      setRecommendations(recRes.data);
    }
  };

  const hasData = competencies && competencies.has_data;

  // Filter topics based on active pill
  const filteredTopics = () => {
    if (!competencies || !competencies.all_topics) return [];
    if (activeTab === 'gaps') return competencies.gaps || [];
    if (activeTab === 'strengths') return competencies.strengths || [];
    if (activeTab === 'developing') return competencies.developing || [];
    return competencies.all_topics;
  };

  return (
    <DashboardLayout>
      <div className="progress-page-wrapper">
        {/* ===================================================================
            1. PAGE HEADER & REFRESH ACTION
            =================================================================== */}
        <div className="ai-page-header" style={{ marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Competency Analysis & Recommendations</h1>
              <span className="badge badge-primary">
                <Target size={13} />
                <span>Step 5 AI Engine</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Objective gap analysis evaluated from your submitted quiz attempts and tailored study next steps.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadCompetencyData}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
              <span>Refresh Analytics</span>
            </button>

            <button
              onClick={() => navigate('/quizzes')}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Zap size={14} />
              <span>Take a Quiz</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.9rem' }}>{error}</div>
            <button onClick={loadCompetencyData} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton State */}
        {loading && (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-anim" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 0.35rem' }}>Analyzing Quiz Responses & Mapping Competencies...</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>Correlating question topic tags and calculating mastery distributions from SQLite.</p>
          </div>
        )}

        {/* ===================================================================
            2. EMPTY STATE: LEARNER HAS NO ATTEMPTS YET
            =================================================================== */}
        {!loading && !error && !hasData && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <FileQuestion size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              No Competency Data Available Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              EduMind AI never invents fake performance statistics. Complete your first practice quiz or generate an assessment from your uploaded notes to unlock your personal competency profile!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
                <Zap size={16} />
                <span>Attempt Your First Quiz</span>
              </button>
              <button onClick={() => navigate('/materials')} className="btn btn-secondary">
                <FileText size={16} />
                <span>Upload Study Materials</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            3. MAIN COMPETENCY DASHBOARD (WITH REAL BACKEND DATA)
            =================================================================== */}
        {!loading && !error && hasData && (
          <div>
            {/* 4 Summary Stat Cards */}
            <div className="overview-cards-grid" style={{ marginBottom: '1.75rem' }}>
              {/* Card 1: Overall Accuracy */}
              <div className="overview-card">
                <div className="overview-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <TrendingUp size={22} />
                </div>
                <div className="overview-details">
                  <span className="overview-title">Overall Accuracy</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{Math.round(competencies.overall_accuracy_percentage)}%</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                    {competencies.total_correct_answers} / {competencies.total_questions_evaluated} Correct
                  </span>
                </div>
              </div>

              {/* Card 2: Identified Competency Gaps */}
              <div className="overview-card">
                <div className="overview-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                  <AlertCircle size={22} />
                </div>
                <div className="overview-details">
                  <span className="overview-title">Competency Gaps</span>
                  <div className="overview-value-row">
                    <span className="overview-value" style={{ color: competencies.gaps.length > 0 ? '#b45309' : '#10b981' }}>
                      {competencies.gaps.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    {competencies.gaps.length > 0 ? 'Topics below 50% threshold' : 'No critical gaps!'}
                  </span>
                </div>
              </div>

              {/* Card 3: Mastered Strengths */}
              <div className="overview-card">
                <div className="overview-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div className="overview-details">
                  <span className="overview-title">Mastered Topics</span>
                  <div className="overview-value-row">
                    <span className="overview-value" style={{ color: '#4f46e5' }}>
                      {competencies.strengths.length}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem', display: 'block' }}>
                    Topics with ≥ 75% accuracy
                  </span>
                </div>
              </div>

              {/* Card 4: Quizzes Completed */}
              <div className="overview-card">
                <div className="overview-icon" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
                  <Zap size={22} />
                </div>
                <div className="overview-details">
                  <span className="overview-title">Quizzes Evaluated</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{competencies.total_quizzes_taken}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                    Persistent SQLite history
                  </span>
                </div>
              </div>
            </div>

            {/* Transparent Methodology Banner */}
            <div style={{
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-light)',
              borderLeft: '4px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
                  How EduMind AI Identifies Competency Gaps:
                </strong>
                {competencies.methodology_explanation}
              </div>
            </div>

            {/* ===============================================================
                4. PERSONALIZED LEARNING RECOMMENDATIONS SECTION
                =============================================================== */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                      Personalized Learning Recommendations
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {recommendations ? recommendations.summary_message : 'Tailored study steps based on actual performance.'}
                  </p>
                </div>

                {recommendations && recommendations.has_gaps && (
                  <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                    <AlertTriangle size={13} />
                    <span>Action Required</span>
                  </span>
                )}
              </div>

              {recommendations && recommendations.recommendations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recommendations.recommendations.map((rec, idx) => {
                    const isHigh = rec.priority === 'high';
                    const isMed = rec.priority === 'medium';

                    return (
                      <div
                        key={idx}
                        style={{
                          border: `1px solid ${isHigh ? '#fecaca' : isMed ? '#fde68a' : 'var(--border-light)'}`,
                          backgroundColor: isHigh ? '#fffbfb' : isMed ? '#fffdf7' : 'var(--bg-main)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.15rem 1.25rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: isHigh ? '#fef2f2' : isMed ? '#fffbeb' : '#f0fdf4',
                              color: isHigh ? '#991b1b' : isMed ? '#92400e' : '#166534',
                              border: `1px solid ${isHigh ? '#fca5a5' : isMed ? '#fcd34d' : '#86efac'}`
                            }}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </span>

                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)'
                            }}>
                              {rec.subject_code}
                            </span>

                            {rec.has_matching_material ? (
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                <FileText size={12} />
                                <span>Note Matched: {rec.matched_material_title}</span>
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: '#f1f5f9',
                                color: 'var(--text-muted)',
                                border: '1px solid #e2e8f0'
                              }}>
                                No Matched Notes
                              </span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text-main)' }}>
                            {rec.title}
                          </h4>

                          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem', lineHeight: 1.45 }}>
                            {rec.description}
                          </p>

                          <div style={{
                            padding: '0.65rem 0.85rem',
                            backgroundColor: 'var(--bg-surface)',
                            borderLeft: '3px solid var(--primary)',
                            borderRadius: '4px',
                            fontSize: '0.82rem',
                            color: 'var(--text-main)'
                          }}>
                            <strong>👉 Practical Next Step:</strong> {rec.action_step}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                          {rec.has_matching_material ? (
                            <button
                              onClick={() => navigate('/materials')}
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              <FileText size={14} />
                              <span>Open Notes</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate('/materials')}
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              <FileText size={14} />
                              <span>Upload Material</span>
                            </button>
                          )}

                          <button
                            onClick={() => navigate('/quizzes')}
                            className="btn btn-outline btn-sm"
                            style={{ width: '100%', justifyContent: 'center' }}
                          >
                            <Zap size={14} />
                            <span>Retake Quiz</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#ecfdf5',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #a7f3d0'
                }}>
                  <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem', display: 'block' }} />
                  <p style={{ fontWeight: 700, fontSize: '0.98rem', color: '#065f46', margin: '0 0 0.25rem' }}>
                    Zero Competency Gaps Detected!
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>
                    All evaluated topics have achieved high accuracy. Challenge yourself with advanced difficulty assessments!
                  </p>
                </div>
              )}
            </div>

            {/* ===============================================================
                5. TOPIC MASTERY BREAKDOWN & ACCURACY VISUALIZATION
                =============================================================== */}
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
                    <span>Topic Mastery Breakdown</span>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                    Accuracy rates and question volume across all evaluated syllabus concepts.
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('all')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeTab === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                      backgroundColor: activeTab === 'all' ? 'var(--primary-light)' : 'transparent',
                      color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                  >
                    All Topics ({competencies.all_topics.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('gaps')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeTab === 'gaps' ? '1px solid #ef4444' : '1px solid var(--border-light)',
                      backgroundColor: activeTab === 'gaps' ? '#fef2f2' : 'transparent',
                      color: activeTab === 'gaps' ? '#ef4444' : 'var(--text-secondary)'
                    }}
                  >
                    Gaps ({competencies.gaps.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('developing')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeTab === 'developing' ? '1px solid #f59e0b' : '1px solid var(--border-light)',
                      backgroundColor: activeTab === 'developing' ? '#fffbeb' : 'transparent',
                      color: activeTab === 'developing' ? '#d97706' : 'var(--text-secondary)'
                    }}
                  >
                    Developing ({competencies.developing.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('strengths')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeTab === 'strengths' ? '1px solid #10b981' : '1px solid var(--border-light)',
                      backgroundColor: activeTab === 'strengths' ? '#ecfdf5' : 'transparent',
                      color: activeTab === 'strengths' ? '#10b981' : 'var(--text-secondary)'
                    }}
                  >
                    Mastered ({competencies.strengths.length})
                  </button>
                </div>
              </div>

              {/* Topics List with Visual Accuracy Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredTopics().map((t, idx) => {
                  const pct = Math.round(t.accuracy_percentage);
                  const isGap = t.status === 'needs_review';
                  const isMastered = t.status === 'mastered';
                  const isInsufficient = t.status === 'insufficient_data';
                  const barColor = isMastered ? '#10b981' : isGap ? '#ef4444' : isInsufficient ? '#94a3b8' : '#f59e0b';

                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem 1.15rem',
                        backgroundColor: 'var(--bg-main)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {t.topic}
                            </h4>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                              {t.subject_code}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {t.correct_count} correct • {t.incorrect_count} incorrect • {t.unanswered_count} skipped across {t.attempts_count} attempt(s)
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isMastered ? '#ecfdf5' : isGap ? '#fef2f2' : isInsufficient ? '#f1f5f9' : '#fffbeb',
                            color: isMastered ? '#059669' : isGap ? '#dc2626' : isInsufficient ? '#64748b' : '#b45309',
                            border: `1px solid ${isMastered ? '#a7f3d0' : isGap ? '#fecaca' : isInsufficient ? '#cbd5e1' : '#fde68a'}`
                          }}>
                            {t.status_label}
                          </span>

                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: barColor, minWidth: '48px', textAlign: 'right' }}>
                            {isInsufficient ? 'N/A' : `${pct}%`}
                          </span>
                        </div>
                      </div>

                      {/* Accuracy Visual Track */}
                      <div className="progress-container" style={{ margin: 0 }}>
                        <div className="progress-track" style={{ height: 8, backgroundColor: '#e2e8f0' }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: isInsufficient ? '0%' : `${pct}%`,
                              backgroundColor: barColor
                            }}
                          />
                        </div>
                      </div>

                      {isInsufficient && (
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          ⚠️ Only {t.total_questions} question(s) evaluated. Complete {3 - t.total_questions} more question(s) on this topic to calibrate mastery status.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insufficient Data Guidance Card (if any topics exist with < 3 questions) */}
            {competencies.insufficient_data_topics.length > 0 && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px dashed var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HelpCircle size={22} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.92rem', fontWeight: 700 }}>
                      {competencies.insufficient_data_topics.length} Topic(s) Awaiting Additional Calibration
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      To prevent premature conclusions, topics require at least 3 evaluated questions before flagging mastery or gaps.
                    </p>
                  </div>
                </div>

                <button onClick={() => navigate('/quizzes')} className="btn btn-secondary btn-sm">
                  <span>Take Assessment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
