"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GoogleSignIn from '../../../src/components/GoogleSignIn';
import { motion } from 'framer-motion';
import { useAuth } from '../../../src/context/AuthContext';
import '../../../src/styles/Auth.css';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your GuruEdu account</p>
        </div>

        {error && <div className="auth-error-banner" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Forgot?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Account'}
          </button>
        </form>

        <div className="social-login">
          <p>OR CONTINUE WITH</p>
          <div className="social-btns">
            <GoogleSignIn className="google-btn" />
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link href="/signup">Create account</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
