import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  // If already authenticated, redirect to dashboard or attempted URL
  useEffect(() => {
    if (isAuthenticated) {
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email format (e.g., student@university.edu).');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage('Authentication successful! Opening workspace...');
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setEmail('alex@example.com');
    setPassword('student123');

    setDemoLoading(true);
    const res = await login('alex@example.com', 'student123');
    setDemoLoading(false);

    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.error || 'Demo student authentication failed. Please verify the backend service is running.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="brand-icon" style={{ margin: '0 auto 0.75rem', width: 44, height: 44 }}>
              <Sparkles size={22} />
            </div>
            <h2>Welcome Back to EduMind</h2>
            <p>Enter your student credentials to access your exam workspace</p>
          </div>

          {/* Quick Demo Access for Hackathon / Evaluator */}
          <div className="demo-login-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.4rem' }}>
              <ShieldCheck size={16} color="#4f46e5" />
              <p style={{ margin: 0, fontWeight: 700, color: '#4338ca' }}>Quick Access Demo Account</p>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.6rem', textAlign: 'center' }}>
              Pre-seeded account with uploaded CS notes, generated quizzes, and competency data.
            </p>
            <button
              type="button"
              id="demo-student-login-btn"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', borderColor: '#4f46e5', background: 'white' }}
            >
              {demoLoading ? (
                <>
                  <Loader2 size={15} className="spinner-icon" />
                  <span>Signing In as Demo Student...</span>
                </>
              ) : (
                <span>Sign In as Demo Student (Alex)</span>
              )}
            </button>
          </div>

          {/* Alert Banners */}
          {error && (
            <div className="auth-alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert-success" role="status" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">College Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || demoLoading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              </div>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || demoLoading}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              id="submit-login-btn"
              disabled={loading || demoLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an EduMind account?{' '}
            <Link to="/signup" style={{ fontWeight: 600, color: 'var(--primary, #4f46e5)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
