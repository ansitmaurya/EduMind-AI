import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LearningMaterialsManager from '../components/LearningMaterialsManager';
import { FileText, Sparkles } from 'lucide-react';

export default function MaterialsPage() {
  return (
    <DashboardLayout>
      <div className="materials-page-container" style={{ paddingBottom: '2rem' }}>
        {/* Page Header */}
        <div className="ai-page-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Document Library</h1>
              <span className="badge badge-primary">
                <FileText size={13} />
                <span>Text Extraction</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Upload your syllabus, lecture notes, and PDFs to extract concepts and power personalized quizzes.
            </p>
          </div>
        </div>

        {/* Manager Component */}
        <LearningMaterialsManager />
      </div>
    </DashboardLayout>
  );
}
