import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Description */}
          <div className="footer-brand">
            <div className="brand-logo" style={{ marginBottom: '0.6rem' }}>
              <div className="brand-icon">
                <Sparkles size={20} />
              </div>
              <span>EduMind <span className="gradient-text">AI</span></span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '300px' }}>
              Your AI-powered companion for smarter exam preparation.
            </p>
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#4f46e5', background: '#eef2ff', padding: '0.35rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
              <GraduationCap size={15} /> Academic Project Prototype
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#hero">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#about">About</a></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="footer-col">
            <h4>Features</h4>
            <ul className="footer-links">
              <li><a href="#features">AI Study Assistant</a></li>
              <li><a href="#features">Smart Quiz</a></li>
              <li><a href="#features">Progress Tracking</a></li>
              <li><a href="#features">Personalized Learning</a></li>
            </ul>
          </div>

          {/* Contact / Project Info */}
          <div className="footer-col">
            <h4>Project Info</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
              Designed and developed for academic presentation and student exam preparation.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Department:</strong> Computer Science & Engineering
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EduMind AI. All rights reserved.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            College Project Presentation Prototype
          </p>
        </div>
      </div>
    </footer>
  );
}
