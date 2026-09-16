import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Zap,
  BarChart3,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Layers,
  HelpCircle,
  Clock,
  Compass,
  FileCheck,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AiChatModal from '../components/AiChatModal';

export default function Landing() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main>
        {/* =================================================================
            1. HERO SECTION
            ================================================================= */}
        <section id="hero" className="hero-wrapper">
          <div className="container">
            <div className="hero-grid">
              {/* Left Column: Headings, Supporting Text, and Action Buttons */}
              <div className="hero-left">
                <div className="badge badge-primary">
                  <Sparkles size={14} />
                  <span>AI-Powered Exam Preparation</span>
                </div>

                <h1 className="hero-title">
                  Study Smarter.{' '}
                  <span className="gradient-text">Prepare Better.</span>
                </h1>

                <p className="hero-subtitle">
                  EduMind AI helps students organize their study, practice with smart quizzes, track their progress, and get AI-powered learning assistance.
                </p>

                <div className="hero-buttons">
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </Link>

                  <a href="#features" className="btn btn-secondary btn-lg">
                    <span>Explore Features</span>
                  </a>

                  <Link to="/dashboard" className="btn btn-outline btn-lg" style={{ background: 'white' }}>
                    <LayoutDashboard size={18} />
                    <span>View Dashboard</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Realistic AI Education Assistant & Dashboard UI */}
              <div className="hero-mockup-card">
                <div className="mockup-bar">
                  <div className="mockup-controls">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', display: 'inline-block' }}></span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }}></span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    EduMind AI Study Session
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
                    Live Demo
                  </span>
                </div>

                <div className="mockup-body-inner">
                  {/* AI Assistant Chat Query Box */}
                  <div className="mockup-ai-card">
                    <div className="mockup-ai-header">
                      <div className="mockup-ai-title">
                        <div className="brand-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
                          <Bot size={15} />
                        </div>
                        <span>AI Study Assistant</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operating Systems</span>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.75rem 0.9rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: '0.6rem', borderLeft: '3px solid var(--primary)' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8rem' }}>Question:</p>
                      <p style={{ color: 'var(--text-secondary)' }}>"What is the difference between Preemptive and Non-Preemptive scheduling?"</p>
                    </div>

                    <div style={{ background: '#eef2ff', padding: '0.75rem 0.9rem', borderRadius: 8, fontSize: '0.83rem', color: '#334155', lineHeight: '1.5' }}>
                      <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.2rem' }}>💡 AI Concept Breakdown:</p>
                      • <strong>Preemptive:</strong> CPU can be allocated to higher priority processes mid-execution (e.g. Round Robin, SRTF).<br />
                      • <strong>Non-Preemptive:</strong> Once CPU is allocated, process holds it until termination or I/O wait (e.g. FCFS).
                    </div>
                  </div>

                  {/* Subject Progress Previews */}
                  <div className="mockup-subject-row">
                    <div className="mockup-subject-pill">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                        <span>Data Structures</span>
                        <span style={{ color: 'var(--primary)' }}>75%</span>
                      </div>
                      <div className="progress-track" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: '75%', background: 'var(--primary)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                        18 of 24 Topics Mastered
                      </span>
                    </div>

                    <div className="mockup-subject-pill">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                        <span>DBMS & SQL</span>
                        <span style={{ color: '#7c3aed' }}>88%</span>
                      </div>
                      <div className="progress-track" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: '88%', background: '#7c3aed' }}></div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                        22 of 25 Topics Mastered
                      </span>
                    </div>
                  </div>

                  {/* Interactive Trigger Button */}
                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', justifyContent: 'center', background: 'white' }}
                  >
                    <Sparkles size={14} />
                    <span>Try Interactive AI Doubt Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            2. SMALL STATS / HIGHLIGHTS (No fake statistical claims)
            ================================================================= */}
        <section className="highlights-section">
          <div className="container">
            <div className="highlights-grid">
              <div className="highlight-item">
                <div className="highlight-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  <BrainCircuit size={22} />
                </div>
                <div className="highlight-text">
                  <h4>Smart Learning</h4>
                  <p>Step-by-step conceptual breakdowns and structured study modules.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Zap size={22} />
                </div>
                <div className="highlight-text">
                  <h4>Interactive Quizzes</h4>
                  <p>Chapter-wise practice questions designed for exam readiness.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                  <BarChart3 size={22} />
                </div>
                <div className="highlight-text">
                  <h4>Progress Tracking</h4>
                  <p>Clear visual progress bars and syllabus completion indicators.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="highlight-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <Bot size={22} />
                </div>
                <div className="highlight-text">
                  <h4>AI Assistance</h4>
                  <p>On-demand study assistance to explain challenging questions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            3. FEATURES SECTION
            ================================================================= */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <span className="badge badge-primary">Core Capabilities</span>
              <h2 className="section-title">Everything You Need for Better Preparation</h2>
              <p className="section-desc">
                EduMind AI combines structured course review, quiz practice, and AI assistance into one streamlined workspace.
              </p>
            </div>

            <div className="features-grid">
              {/* Feature 1: AI Study Assistant */}
              <div className="feature-card">
                <div className="feature-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  <BrainCircuit size={26} />
                </div>
                <h3>AI Study Assistant</h3>
                <p>Helps students understand difficult topics.</p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> Clear Explanations
                  </span>
                </div>
              </div>

              {/* Feature 2: Smart Quiz */}
              <div className="feature-card">
                <div className="feature-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                  <Zap size={26} />
                </div>
                <h3>Smart Quiz</h3>
                <p>Practice questions and test preparation.</p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> Self-Assessment
                  </span>
                </div>
              </div>

              {/* Feature 3: Progress Tracking */}
              <div className="feature-card">
                <div className="feature-icon-box" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                  <BarChart3 size={26} />
                </div>
                <h3>Progress Tracking</h3>
                <p>Monitor learning progress and completed topics.</p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#0ea5e9', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> Real-time Metrics
                  </span>
                </div>
              </div>

              {/* Feature 4: Personalized Learning */}
              <div className="feature-card">
                <div className="feature-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <Sparkles size={26} />
                </div>
                <h3>Personalized Learning</h3>
                <p>Future AI functionality will provide learning suggestions based on student activity.</p>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={14} /> Adaptive Roadmap
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            4. HOW IT WORKS SECTION
            ================================================================= */}
        <section id="how-it-works" className="how-it-works-section">
          <div className="container">
            <div className="section-header">
              <span className="badge badge-primary">Study Workflow</span>
              <h2 className="section-title">How It Works</h2>
              <p className="section-desc">
                A structured four-step path designed to make everyday study consistent and exam-focused.
              </p>
            </div>

            <div className="steps-grid">
              {/* Step 1 */}
              <div className="step-card">
                <span className="step-number-tag">01 — Sign Up</span>
                <h3>Create Profile</h3>
                <p>Create your student profile and set up your academic preferences.</p>
              </div>

              {/* Step 2 */}
              <div className="step-card">
                <span className="step-number-tag" style={{ color: '#7c3aed', background: '#f5f3ff' }}>
                  02 — Choose Subject
                </span>
                <h3>Select Subject</h3>
                <p>Select what you want to study from your enrolled semester subjects.</p>
              </div>

              {/* Step 3 */}
              <div className="step-card">
                <span className="step-number-tag" style={{ color: '#0ea5e9', background: '#f0f9ff' }}>
                  03 — Learn & Practice
                </span>
                <h3>Learn & Practice</h3>
                <p>Use study material and quizzes to master concepts and test your memory.</p>
              </div>

              {/* Step 4 */}
              <div className="step-card">
                <span className="step-number-tag" style={{ color: '#10b981', background: '#ecfdf5' }}>
                  04 — Track Progress
                </span>
                <h3>Track Progress</h3>
                <p>Review your performance and improve before exam day.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            5. ABOUT SECTION
            ================================================================= */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="about-card">
              <div className="about-grid">
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
                    Project Overview
                  </span>
                  <h3>About EduMind AI</h3>
                  <p>
                    EduMind AI is designed as a student-first academic companion that bridges the gap between university syllabus textbooks and actual exam preparation.
                  </p>
                  <p>
                    By providing structured subject tracks, immediate interactive testing, and AI-assisted doubt resolution, it helps college students stay consistent throughout the semester.
                  </p>
                  <div style={{ marginTop: '1.25rem' }}>
                    <Link to="/dashboard" className="btn btn-secondary btn-sm">
                      <span>Explore Live Dashboard Demo</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                    Key Project Pillars
                  </h4>
                  <ul className="about-checklist">
                    <li>
                      <CheckCircle2 size={18} color="#4f46e5" />
                      <span>Modular chapter-by-chapter navigation</span>
                    </li>
                    <li>
                      <CheckCircle2 size={18} color="#4f46e5" />
                      <span>Interactive question practice environment</span>
                    </li>
                    <li>
                      <CheckCircle2 size={18} color="#4f46e5" />
                      <span>Visual progress and syllabus indicators</span>
                    </li>
                    <li>
                      <CheckCircle2 size={18} color="#4f46e5" />
                      <span>Optimized for presentation and student utility</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            6. FINAL CTA
            ================================================================= */}
        <section className="cta-banner-section">
          <div className="container">
            <div className="cta-banner-card">
              <h2>Ready to make your preparation smarter?</h2>
              <p>Start exploring EduMind AI and build a better study routine.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn btn-light btn-lg">
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }}>
                  <span>Student Login</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <Footer />

      {/* Interactive AI Assistant Modal */}
      <AiChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
