import React from 'react';
import { ArrowRight, CheckCircle2, Clock, BookOpen } from 'lucide-react';

export default function SubjectCard({
  title,
  code,
  completedTopics,
  totalTopics,
  progressPercentage,
  accentColor = '#4f46e5',
  bgLight = '#eef2ff',
  icon: Icon = BookOpen,
  onOpenTopic
}) {
  return (
    <div className="subject-card">
      <div>
        <div className="subject-top">
          <div
            className="subject-icon-wrap"
            style={{ backgroundColor: bgLight, color: accentColor }}
          >
            <Icon size={22} />
          </div>
          <span className="badge" style={{ backgroundColor: bgLight, color: accentColor }}>
            {code}
          </span>
        </div>

        <h3>{title}</h3>
        <p className="subject-meta">
          {completedTopics} of {totalTopics} chapters completed
        </p>

        <div className="progress-container">
          <div className="progress-labels">
            <span>Syllabus Covered</span>
            <span style={{ color: accentColor }}>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: accentColor
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={14} /> Exam in 14 days
        </span>
        <button
          onClick={onOpenTopic}
          className="btn btn-outline btn-sm"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <span>Continue</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
