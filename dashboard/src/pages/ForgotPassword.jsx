import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css'; // Reuse Login.css for consistent styling

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:3000/api/v1/admin/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage({ text: 'OTP sent to your email successfully!', type: 'success' });
        setStep(2);
      } else {
        setMessage({ text: response.data.message || 'Failed to send OTP', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setMessage({ text: 'Please fill all fields', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:3000/api/v1/admin/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      if (response.data.success) {
        setMessage({ text: 'Password reset successfully! Redirecting to login...', type: 'success' });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setMessage({ text: response.data.message || 'Failed to reset password', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Forgot Password</h1>
          <p>{step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}</p>
        </div>

        {message.text && (
          <div className={`error-message ${message.type === 'success' ? 'success-message' : 'general-error'}`} style={message.type === 'success' ? { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '5px', marginBottom: '15px' } : {}}>
            {message.text}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Admin Email / Username</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@guruedu.com"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <div className="loading-spinner"></div> : 'Send OTP'}
            </button>
            <div className="forgot-password-link" style={{ textAlign: 'center', marginTop: '15px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Back to Login</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <div className="loading-spinner"></div> : 'Reset Password'}
            </button>
            <div className="forgot-password-link" style={{ textAlign: 'center', marginTop: '15px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Back to Login</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
