import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser, getCurrentUser, logoutUser, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'edumind_token';
const USER_KEY = 'edumind_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Synchronize and verify session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser();
        if (isMounted) {
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data));
          } else {
            // Invalid / expired session
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Network or server issue; preserve cached user if available
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifySession();

    // Listen for 401 unauthorized events emitted by API client
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    };

    window.addEventListener('edumind:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('edumind:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await loginUser({ email: email.trim().toLowerCase(), password });
      if (res.success && res.data) {
        const { access_token, user: userData } = res.data;
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(access_token);
        setUser(userData);
        return { success: true, user: userData };
      }
      return {
        success: false,
        error: res.error || 'Invalid email or password.'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Unable to sign in at this time. Please try again.'
      };
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      const payload = {
        full_name: formData.full_name?.trim() || formData.fullName?.trim(),
        email: formData.email?.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password || formData.confirmPassword
      };

      const res = await registerUser(payload);
      if (res.success && res.data) {
        return { success: true, user: res.data };
      }
      return {
        success: false,
        error: res.error || 'Registration failed. Please check your details.'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Unable to register at this time. Please try again.'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Route protection wrapper.
 * Redirects unauthenticated users to /login and handles session loading smoothly.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-main, #f8fafc)',
        color: 'var(--primary, #4f46e5)',
        fontSize: '1rem',
        fontWeight: 600,
        gap: '0.75rem'
      }}>
        <div style={{
          width: 24,
          height: 24,
          border: '3px solid #e0e7ff',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>Authenticating session...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
