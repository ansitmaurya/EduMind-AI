import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    branch: 'B.Tech CSE',
    semester: '6th Semester',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error once user modifies input
    if (error) setError(null);
  };

  const validate = () => {
    const { fullName, email, password, confirmPassword, agreeTerms } = formData;

    if (!fullName || fullName.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please provide a valid email address (e.g. name@college.edu).');
      return false;
    }

    if (!password || password.length < 8) {
      setError('Password must contain at least 8 characters for security.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return false;
    }

    if (!agreeTerms) {
      setError('Please agree to the Student Honor Guidelines to register.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    const res = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    if (res.success) {
      setRegisteredSuccess(true);
      setLoading(false);
      // Automatically attempt auto-login for a seamless student experience
      try {
        const loginRes = await login(formData.email, formData.password);
        if (loginRes.success) {
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1200);
        }
      } catch {
        // Fallback to manual login navigation
      }
    } else {
      setLoading(false);
      setError(res.error || 'Registration failed. Please check your information and try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main className="auth-wrapper">
        <div className="auth-card" style={{ maxWidth: '520px' }}>
          <div className="auth-header">
            <div className="brand-icon" style={{ margin: '0 auto 0.75rem', width: 44, height: 44 }}>
              <Sparkles size={22} />
            </div>
            <h2>Create Student Account</h2>
            <p>Join EduMind AI to assess competencies and receive AI-guided training</p>
          </div>

          {/* Success State */}
          {registeredSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                Account Created Successfully!
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Your account for <strong>{formData.email}</strong> is registered. We are preparing your learning dashboard...
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
                  <span>Proceed to Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Validation / Backend Error Alert */}
              {error && (
                <div className="auth-alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Alex Johnson"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email Address */}
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
                      disabled={loading}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Degree & Semester Dropdowns */}
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
                        disabled={loading}
                      >
                        <option value="B.Tech CSE">B.Tech CSE</option>
                        <option value="B.Tech IT">B.Tech IT</option>
                        <option value="B.Tech ECE">B.Tech ECE</option>
                        <option value="MCA / BCA">MCA / BCA</option>
                        <option value="Other">Other Branch</option>
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
                        disabled={loading}
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

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Password <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 400 }}>(minimum 8 characters)</span>
                  </label>
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
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="form-input"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="form-options">
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                    <span>I agree to standard Student Academic Honor Guidelines</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="submit-register-btn"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spinner-icon" />
                      <span>Creating Account & Hashing Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Free Registration</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer">
                Already have an EduMind account?{' '}
                <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary, #4f46e5)' }}>
                  Log in here
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
