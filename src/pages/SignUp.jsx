import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    branch: 'Computer Science & Engineering',
    semester: '6th Semester',
    password: '',
    agreeTerms: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate straight to dashboard for prototype preview
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: '500px' }}>
          <div className="auth-header">
            <div className="brand-icon" style={{ margin: '0 auto 0.75rem', width: 44, height: 44 }}>
              <Sparkles size={22} />
            </div>
            <h2>Create Student Account</h2>
            <p>Join EduMind AI to supercharge your exam preparation</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">College Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="student@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="branch">Degree & Branch</label>
                <div className="input-with-icon">
                  <GraduationCap size={18} />
                  <select
                    id="branch"
                    name="branch"
                    className="form-select"
                    value={formData.branch}
                    onChange={handleChange}
                  >
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="B.Tech IT">B.Tech IT</option>
                    <option value="B.Tech ECE">B.Tech ECE</option>
                    <option value="MCA / BCA">MCA / BCA</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="semester">Current Semester</label>
                <div className="input-with-icon">
                  <BookOpen size={18} />
                  <select
                    id="semester"
                    name="semester"
                    className="form-select"
                    value={formData.semester}
                    onChange={handleChange}
                  >
                    <option value="4th Semester">4th Sem</option>
                    <option value="5th Semester">5th Sem</option>
                    <option value="6th Semester">6th Sem</option>
                    <option value="7th Semester">7th Sem</option>
                    <option value="8th Semester">8th Sem</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Create Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <span>I agree to standard Student Honor Guidelines</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              <span>Complete Free Registration</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Log in here</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
