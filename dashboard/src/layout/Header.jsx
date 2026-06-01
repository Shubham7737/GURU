import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(localStorage.getItem('adminUser') || 'Admin');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('adminProfilePic'));

  useEffect(() => {
    const handleProfileUpdate = () => {
      setAdminUser(localStorage.getItem('adminUser') || 'Admin');
      setProfilePic(localStorage.getItem('adminProfilePic'));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          ☰
        </button>
        <h1 className="page-title">Online Course Platform</h1>
      </div>

      <div className="header-right">
        <div className="user-info" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          {profilePic && profilePic !== 'null' && profilePic !== 'undefined' ? (
            <img src={`http://localhost:3000${profilePic}`} alt="Profile" className="user-avatar-img" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span className="user-avatar">👤</span>
          )}
          <span className="user-name">Welcome, {adminUser}</span>
        </div>
        <div className="header-notifications">
          <button className="notification-btn">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>
      </div>

    </header>
  );
};

export default Header;