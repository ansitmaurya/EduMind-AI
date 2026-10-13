import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlayCircle,
  Eye,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  HelpCircle,
  Layers,
  FileText
} from 'lucide-react';
import { getMaterials, generateQuiz, getQuizzes, getQuizById } from '../services/api';

export default function QuizGeneratorSection({ onStartQuiz }) {
  const [materials, setMaterials] = useState([]);
  const [generatedQuizzes, setGeneratedQuizzes] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form inputs
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  // Review modal state
  const [reviewQuiz, setReviewQuiz] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingDocs(true);
    setLoadingQuizzes(true);
    setError(null);

    const [matRes, quizRes] = await Promise.all([
      getMaterials(),
      getQuizzes()
    ]);

    setLoadingDocs(false);
    setLoadingQuizzes(false);

    if (matRes.success && Array.isArray(matRes.data)) {
      setMaterials(matRes.data);
      // Auto-select first usable material
      const usable = matRes.data.find(m => m.status === 'ready' && m.extracted_char_count >= 100);
      if (usable && !selectedMaterialId) {
        setSelectedMaterialId(usable.id.toString());
        setQuizTitle(`${usable.title} Assessment`);
        setQuizTopic(usable.title);
      }
    } else {
      setError(matRes.error || 'Unable to connect to backend.');
    }

    if (quizRes.success && Array.isArray(quizRes.data)) {
      setGeneratedQuizzes(quizRes.data);
    }
  };

  const handleMaterialChange = (e) => {
    const id = e.target.value;
    setSelectedMaterialId(id);
    const doc = materials.find(m => m.id.toString() === id);
    if (doc) {
      setQuizTitle(`${doc.title} Assessment`);
      setQuizTopic(doc.title);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId) {
      setError('Please select an uploaded document.');
      return;
    }

    const doc = materials.find(m => m.id.toString() === selectedMaterialId);
    if (doc && doc.extracted_char_count < 100) {
      setError(`"${doc.title}" has insufficient text (${doc.extracted_char_count} chars). Please upload a document with at least 100 characters.`);
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      material_id: parseInt(selectedMaterialId, 10),
      title: quizTitle.trim() || undefined,
      topic: quizTopic.trim() || undefined,
      num_questions: parseInt(numQuestions, 10),
      difficulty: difficulty
    };

    const res = await generateQuiz(payload);
    setGenerating(false);

    if (res.success && res.data) {
      const modeLabel = res.data.generation_mode === 'ai' ? 'AI Model' : 'Knowledge-Engine Fallback';
      setSuccessMessage(
        `Successfully generated "${res.data.title}" with ${res.data.total_questions} questions via ${modeLabel}!`
      );
      // Refresh quizzes list
      const qListRes = await getQuizzes();
      if (qListRes.success && Array.isArray(qListRes.data)) {
        setGeneratedQuizzes(qListRes.data);
      }
    } else {
      setError(res.error || 'Quiz generation failed.');
    }
  };

  const handleOpenReview = async (quizId) => {
    setLoadingReview(true);
    setReviewQuiz(null);
    const res = await getQuizById(quizId);
    setLoadingReview(false);
    if (res.success && res.data) {
      setReviewQuiz(res.data);
    } else {
      setError(res.error || 'Failed to load quiz details.');
    }
  };

  const handleLaunchQuiz = (quizId) => {
    if (onStartQuiz) {
      onStartQuiz(quizId);
    }
  };


  const usableMaterials = materials.filter(m => m.status === 'ready' && m.extracted_char_count >= 100);

  return (
    <div className="quiz-generator-container" style={{ marginBottom: '2.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>AI Quiz Generator</h3>
            <span className="badge badge-primary">
              <Sparkles size={12} />
              <span>Step 3 Engine</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Generate grounded 4-option MCQs from your uploaded syllabus notes, PDFs, or lecture files.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loadingDocs || loadingQuizzes}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          title="Refresh documents and quizzes"
        >
          <RefreshCw size={14} className={(loadingDocs || loadingQuizzes) ? 'spin-anim' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Grid: Generator Form + Saved Generated Quizzes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Form Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span>Generate New Quiz</span>
          </h4>

          {loadingDocs ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <RefreshCw size={20} className="spin-anim" style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
              Loading uploaded document library...
            </div>
          ) : usableMaterials.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              border: '1px dashed var(--border-light)'
            }}>
              <FileText size={28} style={{ color: 'var(--text-light)', margin: '0 auto 0.5rem', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.35rem' }}>No Suitable Documents Found</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
                You need at least one uploaded document with extractable text (minimum 100 characters).
              </p>
              <a href="/materials" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                Upload Study Material
              </a>
            </div>
          ) : (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Select Document */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Source Document <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={handleMaterialChange}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                  required
                >
                  {usableMaterials.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} ({doc.file_type?.toUpperCase()} • {doc.extracted_char_count?.toLocaleString()} chars)
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Quiz Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Binary Search Trees Mastery Quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Topic */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  Topic Focus (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tree Traversals & BST"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Number of Questions + Difficulty (2 Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Questions
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value={5}>5 Questions (Quick)</option>
                    <option value={10}>10 Questions (Standard)</option>
                    <option value={15}>15 Questions (In-depth)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={generating || !selectedMaterialId}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {generating ? (
                  <>
                    <RefreshCw size={16} className="spin-anim" />
                    <span>Synthesizing MCQs from Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Quiz Now</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Saved Quizzes Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} style={{ color: 'var(--primary)' }} />
              <span>Generated Assessment Sets ({generatedQuizzes.length})</span>
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Stored in SQLite
            </span>
          </div>

          {loadingQuizzes ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <RefreshCw size={20} className="spin-anim" style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--primary)' }} />
              Loading quizzes...
            </div>
          ) : generatedQuizzes.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              margin: 'auto 0'
            }}>
              <HelpCircle size={30} style={{ color: 'var(--text-light)', margin: '0 auto 0.5rem', display: 'block' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 0.25rem' }}>No generated quizzes yet</p>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                Select an uploaded document on the left to generate your first assessment set!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '420px', paddingRight: '0.2rem' }}>
              {generatedQuizzes.map((quiz) => {
                const isAI = quiz.generation_mode === 'ai';
                return (
                  <div
                    key={quiz.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    {/* Left: Info */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.15rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                          {quiz.title}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: isAI ? '#ecfdf5' : '#eef2ff',
                          color: isAI ? '#059669' : '#4f46e5',
                          border: `1px solid ${isAI ? '#a7f3d0' : '#c7d2fe'}`
                        }}>
                          {isAI ? 'AI Model' : 'Knowledge Fallback'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{quiz.total_questions} Questions</span>
                        <span>•</span>
                        <span>{quiz.difficulty}</span>
                        <span>•</span>
                        <span>{quiz.subject_code}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleOpenReview(quiz.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Review Question Set and Explanations"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>

                      <button
                        onClick={() => handleLaunchQuiz(quiz.id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Launch in Quiz Player"
                      >
                        <PlayCircle size={13} />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal (Displays All Questions, Options, and Detailed Explanations) */}
      {reviewQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '740px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-main)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    {reviewQuiz.title}
                  </h3>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: reviewQuiz.generation_mode === 'ai' ? '#ecfdf5' : '#eef2ff',
                    color: reviewQuiz.generation_mode === 'ai' ? '#059669' : '#4f46e5'
                  }}>
                    {reviewQuiz.generation_mode === 'ai' ? 'AI Model Grounded' : 'Knowledge Engine Fallback'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {reviewQuiz.total_questions} Questions • Difficulty: {reviewQuiz.difficulty} • Subject: {reviewQuiz.subject_code}
                </p>
              </div>
              <button
                onClick={() => setReviewQuiz(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Question List */}
            <div style={{
              padding: '1.25rem 1.5rem',
              overflowY: 'auto',
              flex: 1,
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {(reviewQuiz.questions || []).map((q, qIdx) => (
                <div
                  key={q.id || qIdx}
                  style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    backgroundColor: 'var(--bg-main)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-light)',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {qIdx + 1}
                    </span>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {q.question_text}
                    </p>
                  </div>

                  {/* 4 Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.45rem', marginBottom: '0.65rem' }}>
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correct_index;
                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${isCorrect ? '#10b981' : 'var(--border-light)'}`,
                            backgroundColor: isCorrect ? '#ecfdf5' : 'var(--bg-surface)',
                            color: isCorrect ? '#065f46' : 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: isCorrect ? 600 : 400
                          }}
                        >
                          <span style={{ fontWeight: 700, color: isCorrect ? '#10b981' : 'var(--text-light)' }}>
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span style={{ flex: 1 }}>{opt}</span>
                          {isCorrect && <Check size={14} style={{ color: '#10b981' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#f8fafc',
                      borderLeft: '3px solid var(--primary)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong style={{ color: 'var(--text-main)' }}>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.9rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-main)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Correct answers are revealed in Review Mode only.
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setReviewQuiz(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const id = reviewQuiz.id;
                    setReviewQuiz(null);
                    handleLaunchQuiz(id);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <PlayCircle size={14} />
                  <span>Take This Quiz</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
