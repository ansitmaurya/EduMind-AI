import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  BookOpen,
  Layers,
  BrainCircuit,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  PlayCircle,
  Search,
  Sparkles,
  Bot,
  FileText,
  HelpCircle,
  Cpu,
  Calculator,
  Compass,
  Clock
} from 'lucide-react';

// =============================================================================
// SUBJECTS MOCK DATA DEFINITION (6 B.Tech Subjects with Chapter Curricula)
// =============================================================================
const SUBJECTS_DATA = [
  {
    id: "data-structures",
    name: "Data Structures",
    code: "CS301",
    progress: 72,
    currentTopic: "Linked Lists",
    status: "In Progress",
    statusKey: "in-progress",
    description: "Linear and non-linear data structures, arrays, linked lists, stacks, queues, trees, and sorting techniques.",
    icon: Layers,
    color: "#4f46e5",
    bg: "#eef2ff",
    chapters: [
      { id: 1, title: "Introduction to Data Structures", status: "completed", duration: "45 mins" },
      { id: 2, title: "Arrays", status: "completed", duration: "1.2 hrs" },
      { id: 3, title: "Stacks & Queues", status: "completed", duration: "1.5 hrs" },
      { id: 4, title: "Linked Lists", status: "current", duration: "2.0 hrs" },
      { id: 5, title: "Trees", status: "locked", duration: "2.5 hrs" },
      { id: 6, title: "Searching & Sorting", status: "locked", duration: "3.0 hrs" }
    ]
  },
  {
    id: "database-management",
    name: "Database Management",
    code: "CS303",
    progress: 58,
    currentTopic: "SQL Basics",
    status: "In Progress",
    statusKey: "in-progress",
    description: "Relational database concepts, ER modeling, SQL querying, Normalization, and transaction management.",
    icon: BookOpen,
    color: "#7c3aed",
    bg: "#f5f3ff",
    chapters: [
      { id: 1, title: "Introduction to DBMS", status: "completed", duration: "1.0 hr" },
      { id: 2, title: "Entity-Relationship (ER) Modeling", status: "completed", duration: "1.5 hrs" },
      { id: 3, title: "SQL Basics", status: "current", duration: "2.0 hrs" },
      { id: 4, title: "Joins, Subqueries & Views", status: "locked", duration: "1.8 hrs" },
      { id: 5, title: "Database Normalization (1NF - BCNF)", status: "locked", duration: "2.5 hrs" },
      { id: 6, title: "Transaction & Concurrency Control", status: "locked", duration: "2.2 hrs" }
    ]
  },
  {
    id: "computer-networks",
    name: "Computer Networks",
    code: "CS305",
    progress: 45,
    currentTopic: "Network Fundamentals",
    status: "In Progress",
    statusKey: "in-progress",
    description: "Layered architecture, OSI and TCP/IP models, data link framing, routing algorithms, and transport protocols.",
    icon: Zap,
    color: "#0ea5e9",
    bg: "#f0f9ff",
    chapters: [
      { id: 1, title: "Network Fundamentals", status: "current", duration: "1.5 hrs" },
      { id: 2, title: "OSI vs TCP/IP Layer Models", status: "locked", duration: "1.8 hrs" },
      { id: 3, title: "Data Link Layer & Error Detection", status: "locked", duration: "2.0 hrs" },
      { id: 4, title: "Network Layer & IP Addressing", status: "locked", duration: "2.5 hrs" },
      { id: 5, title: "Transport Layer: TCP & UDP", status: "locked", duration: "2.0 hrs" },
      { id: 6, title: "Application Protocols & Security", status: "locked", duration: "1.5 hrs" }
    ]
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    code: "CS304",
    progress: 64,
    currentTopic: "Process Management",
    status: "In Progress",
    statusKey: "in-progress",
    description: "Process synchronization, CPU scheduling algorithms, deadlock prevention, and virtual memory management.",
    icon: BrainCircuit,
    color: "#10b981",
    bg: "#ecfdf5",
    chapters: [
      { id: 1, title: "Introduction to Operating Systems", status: "completed", duration: "1.0 hr" },
      { id: 2, title: "Processes & Threads", status: "completed", duration: "1.5 hrs" },
      { id: 3, title: "Process Management & CPU Scheduling", status: "current", duration: "2.0 hrs" },
      { id: 4, title: "Process Synchronization & Semaphores", status: "locked", duration: "2.2 hrs" },
      { id: 5, title: "Deadlocks & Banker's Algorithm", status: "locked", duration: "1.8 hrs" },
      { id: 6, title: "Virtual Memory & Paging", status: "locked", duration: "2.5 hrs" }
    ]
  },
  {
    id: "computer-organization",
    name: "Computer Organization",
    code: "CS302",
    progress: 100,
    currentTopic: "All Topics Completed",
    status: "Completed",
    statusKey: "completed",
    description: "Instruction set architecture (ISA), computer arithmetic, ALU design, memory hierarchy, cache, and pipelining.",
    icon: Cpu,
    color: "#059669",
    bg: "#ecfdf5",
    chapters: [
      { id: 1, title: "Digital Logic & Data Representation", status: "completed", duration: "1.2 hrs" },
      { id: 2, title: "Register Transfer & Micro-operations", status: "completed", duration: "1.5 hrs" },
      { id: 3, title: "Basic Computer Organization & Design", status: "completed", duration: "2.0 hrs" },
      { id: 4, title: "Central Processing Unit & Pipelining", status: "completed", duration: "2.5 hrs" },
      { id: 5, title: "Memory Hierarchy & Cache Mapping", status: "completed", duration: "2.0 hrs" },
      { id: 6, title: "Input-Output Organization (DMA & Interrupts)", status: "completed", duration: "1.5 hrs" }
    ]
  },
  {
    id: "mathematics",
    name: "Mathematics",
    code: "MA301",
    progress: 30,
    currentTopic: "Differential Equations",
    status: "In Progress",
    statusKey: "in-progress",
    description: "Higher engineering mathematics including differential equations, linear algebra, matrices, and probability.",
    icon: Calculator,
    color: "#d97706",
    bg: "#fffbeb",
    chapters: [
      { id: 1, title: "Matrices & Linear Equations", status: "completed", duration: "2.0 hrs" },
      { id: 2, title: "Differential Equations", status: "current", duration: "2.5 hrs" },
      { id: 3, title: "Partial Differential Equations", status: "locked", duration: "2.0 hrs" },
      { id: 4, title: "Multiple Integrals & Vector Calculus", status: "locked", duration: "3.0 hrs" },
      { id: 5, title: "Fourier Series & Transforms", status: "locked", duration: "2.8 hrs" },
      { id: 6, title: "Probability & Statistics", status: "locked", duration: "2.5 hrs" }
    ]
  }
];

export default function SubjectsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'In Progress' | 'Completed' | 'Not Started'

  // If a slug is present in the route, locate the active subject detail
  const selectedSubject = useMemo(() => {
    if (!slug) return null;
    return SUBJECTS_DATA.find((s) => s.id === slug) || null;
  }, [slug]);

  // Filter and search subjects
  const filteredSubjects = useMemo(() => {
    return SUBJECTS_DATA.filter((subject) => {
      // 1. Text Search Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        subject.name.toLowerCase().includes(q) ||
        subject.code.toLowerCase().includes(q) ||
        subject.description.toLowerCase().includes(q) ||
        subject.currentTopic.toLowerCase().includes(q);

      // 2. Category Tab Filter
      let matchesFilter = true;
      if (activeFilter === 'In Progress') {
        matchesFilter = subject.statusKey === 'in-progress';
      } else if (activeFilter === 'Completed') {
        matchesFilter = subject.statusKey === 'completed';
      } else if (activeFilter === 'Not Started') {
        matchesFilter = subject.statusKey === 'not-started';
      }

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  // Open Subject Detail View
  const handleOpenSubject = (subjectId) => {
    navigate(`/subjects/${subjectId}`);
  };

  // Back to Subject Cards List
  const handleBackToList = () => {
    navigate('/subjects');
  };

  return (
    <DashboardLayout>
      <div className="subjects-page-wrapper">
        {/* ===================================================================
            VIEW 1: SUBJECT DETAILS VIEW (When slug matches a subject)
            =================================================================== */}
        {selectedSubject ? (
          <div className="subject-detail-view-container">
            {/* Top Navigation Back Button */}
            <button onClick={handleBackToList} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }}>
              <ArrowLeft size={16} />
              <span>Back to All Subjects</span>
            </button>

            {/* Subject Detail Hero Banner */}
            <div className="subject-detail-hero-card">
              <div className="detail-hero-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.6rem' }}>
                  <div className="brand-icon" style={{ width: 44, height: 44, backgroundColor: selectedSubject.bg, color: selectedSubject.color }}>
                    <selectedSubject.icon size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>{selectedSubject.name}</h1>
                      <span className="badge" style={{ backgroundColor: selectedSubject.bg, color: selectedSubject.color, fontSize: '0.78rem' }}>
                        {selectedSubject.code}
                      </span>
                    </div>
                    <span className={`badge ${selectedSubject.statusKey === 'completed' ? 'badge-success' : 'badge-primary'}`} style={{ marginTop: '0.3rem', fontSize: '0.72rem' }}>
                      {selectedSubject.status}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '680px', lineHeight: '1.55' }}>
                  {selectedSubject.description}
                </p>
              </div>

              {/* Progress Box */}
              <div className="detail-hero-progress-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Subject Progress</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedSubject.color }}>
                    {selectedSubject.progress}%
                  </span>
                </div>

                <div className="progress-track" style={{ height: 10, background: '#e2e8f0' }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${selectedSubject.progress}%`, backgroundColor: selectedSubject.color }}
                  />
                </div>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
                  Current Topic: <strong>{selectedSubject.currentTopic}</strong>
                </span>
              </div>
            </div>

            {/* Course Content / Syllabus Chapters */}
            <div className="card" style={{ marginTop: '1.75rem' }}>
              <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Course Content</h3>
                  <p>Structured syllabus breakdown and chapter progression</p>
                </div>
                <span className="badge badge-primary">{selectedSubject.chapters.length} Chapters</span>
              </div>

              <div className="chapters-timeline-list">
                {selectedSubject.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className={`chapter-row-item ${ch.status === 'current' ? 'chapter-current' : ''}`}
                  >
                    <div className="chapter-left-col">
                      {/* Status Icon Indicator */}
                      <div className="chapter-status-icon">
                        {ch.status === 'completed' && (
                          <div className="icon-circle-comp" title="Completed">
                            <CheckCircle2 size={18} color="#10b981" />
                          </div>
                        )}
                        {ch.status === 'current' && (
                          <div className="icon-circle-curr" title="Current Topic">
                            <PlayCircle size={18} color="var(--primary)" />
                          </div>
                        )}
                        {ch.status === 'locked' && (
                          <div className="icon-circle-lock" title="Locked">
                            <Lock size={16} color="var(--text-muted)" />
                          </div>
                        )}
                      </div>

                      {/* Chapter Title & Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <h4 className="chapter-title-text">
                            Chapter {ch.id} — {ch.title}
                          </h4>
                          {ch.status === 'completed' && (
                            <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                              ✓ Completed
                            </span>
                          )}
                          {ch.status === 'current' && (
                            <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                              → Current
                            </span>
                          )}
                          {ch.status === 'locked' && (
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-muted)', fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                              🔒 Locked
                            </span>
                          )}
                        </div>
                        <span className="chapter-duration-text">
                          <Clock size={12} /> {ch.duration} estimated study time
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {ch.status === 'current' ? (
                        <button
                          onClick={() => navigate('/assistant')}
                          className="btn btn-primary btn-sm"
                        >
                          <span>Continue Chapter</span>
                          <ArrowRight size={14} />
                        </button>
                      ) : ch.status === 'completed' ? (
                        <button
                          onClick={() => navigate('/assistant')}
                          className="btn btn-outline btn-sm"
                        >
                          <span>Review</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="btn btn-secondary btn-sm"
                          style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        >
                          <Lock size={13} />
                          <span>Locked</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Resource Cards / Recommended Resources */}
            <div style={{ marginTop: '2rem' }}>
              <div className="section-header-compact" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>Recommended Resources</h3>
                  <p>Study materials and practice modules to reinforce your understanding</p>
                </div>
              </div>

              <div className="resources-cards-grid">
                {/* 1. Concept Notes */}
                <div className="resource-card">
                  <div className="resource-icon-box" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                    <FileText size={22} />
                  </div>
                  <h4>Concept Notes</h4>
                  <p>Concise chapter summaries, revision points, and formula sheets.</p>
                  <button
                    onClick={() => navigate('/assistant')}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                  >
                    <span>Read Notes</span>
                  </button>
                </div>

                {/* 2. Practice Questions */}
                <div className="resource-card">
                  <div className="resource-icon-box" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
                    <Zap size={22} />
                  </div>
                  <h4>Practice Questions</h4>
                  <p>University exam problems, solved examples, and code exercises.</p>
                  <button
                    onClick={() => navigate('/quizzes')}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                  >
                    <span>Practice</span>
                  </button>
                </div>

                {/* 3. Quiz */}
                <div className="resource-card">
                  <div className="resource-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                    <PlayCircle size={22} />
                  </div>
                  <h4>Quiz</h4>
                  <p>Test your knowledge with quick interactive practice questions.</p>
                  <button
                    onClick={() => navigate('/quizzes')}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                  >
                    <span>Start Quiz</span>
                  </button>
                </div>

                {/* 4. Ask EduMind AI */}
                <div className="resource-card" style={{ border: '1.5px solid #c7d2fe', background: 'linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%)' }}>
                  <div className="resource-icon-box" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                    <Bot size={22} />
                  </div>
                  <h4>Ask EduMind AI</h4>
                  <p>Ask doubts, get step-by-step solutions, and clarify tricky topics.</p>
                  <button
                    onClick={() => navigate('/assistant')}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', marginTop: 'auto', justifyContent: 'center' }}
                  >
                    <Sparkles size={14} />
                    <span>Ask EduMind AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===================================================================
             VIEW 2: ALL SUBJECTS GRID (With Search and Category Filters)
             =================================================================== */
          <div>
            {/* Header */}
            <div className="ai-page-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>My Subjects</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                  Choose a subject and continue learning at your own pace.
                </p>
              </div>
            </div>

            {/* Search Bar & Category Filters Toolbar */}
            <div className="subjects-filter-toolbar">
              {/* Functional Search Field */}
              <div className="subjects-search-wrapper">
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  className="subjects-search-input"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Functional Category Filter Buttons */}
              <div className="subjects-category-tabs">
                {['All', 'In Progress', 'Completed', 'Not Started'].map((filterName) => (
                  <button
                    key={filterName}
                    className={`category-tab-btn ${activeFilter === filterName ? 'tab-selected' : ''}`}
                    onClick={() => setActiveFilter(filterName)}
                  >
                    {filterName}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects Cards (6 realistic B.Tech subjects) */}
            {filteredSubjects.length > 0 ? (
              <div className="subjects-catalog-grid">
                {filteredSubjects.map((sub) => {
                  const Icon = sub.icon;
                  const isCompleted = sub.statusKey === 'completed';

                  return (
                    <div key={sub.id} className="subject-catalog-card">
                      <div>
                        {/* Top Code & Status */}
                        <div className="sub-card-top-row">
                          <div className="sub-icon-box" style={{ backgroundColor: sub.bg, color: sub.color }}>
                            <Icon size={22} />
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <span className="badge" style={{ backgroundColor: sub.bg, color: sub.color, fontSize: '0.72rem' }}>
                              {sub.code}
                            </span>
                            <span
                              className={`badge ${isCompleted ? 'badge-success' : 'badge-primary'}`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {sub.status}
                            </span>
                          </div>
                        </div>

                        {/* Subject Title & Description */}
                        <h3 className="sub-card-title">{sub.name}</h3>
                        <p className="sub-card-desc">{sub.description}</p>

                        {/* Progress Bar & Percentage */}
                        <div className="sub-card-progress-section">
                          <div className="sub-card-progress-labels">
                            <span>Progress</span>
                            <span style={{ fontWeight: 800, color: sub.color }}>{sub.progress}%</span>
                          </div>
                          <div className="progress-track" style={{ height: 8 }}>
                            <div
                              className="progress-fill"
                              style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}
                            />
                          </div>
                        </div>

                        {/* Current Topic Meta (if present) */}
                        {sub.currentTopic && !isCompleted && (
                          <div className="sub-card-topic-meta">
                            <span style={{ color: 'var(--text-muted)' }}>Current Topic:</span>
                            <strong>{sub.currentTopic}</strong>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="sub-card-topic-meta">
                            <span style={{ color: 'var(--success)' }}>✓ Complete</span>
                            <strong>All Chapters Done</strong>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="sub-card-footer">
                        <button
                          onClick={() => handleOpenSubject(sub.id)}
                          className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <span>{isCompleted ? 'Review' : 'Continue Learning'}</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Search State */
              <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', marginTop: '1.5rem' }}>
                <div className="brand-icon" style={{ width: 52, height: 52, margin: '0 auto 1rem', backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }}>
                  <Search size={24} />
                </div>
                <h3>No subjects found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.4rem auto 1.5rem' }}>
                  No subjects match your search "{searchQuery}" or selected category filter.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                  className="btn btn-secondary btn-sm"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

