import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Frontend prototype navigation only
    navigate('/dashboard');
  };

  const handleDemoLogin = () => {
    setEmail('alex@example.com');
    setPassword('student123');
    navigate('/dashboard');
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

          {/* Prototype Demo Shortcut Box */}
          <div className="demo-login-box">
            <p>🚀 College Presentation Quick Access</p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', borderColor: '#4f46e5', background: 'white' }}
            >
              Sign In as Demo Student (Alex)
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">College Email or Roll Number</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                <a href="#forgot" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 500 }}>
                  Forgot password?
                </a>
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
                  required
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            Don't have an EduMind account?{' '}
            <Link to="/signup">Create one here</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
