import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AdminProfile.css';

const AdminProfile = ({ isModal = false }) => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/admin/auth/profile');
      if (response.data.success) {
        setProfile(response.data.data);
        if (response.data.data.name) setName(response.data.data.name);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    if (name) formData.append('name', name);
    if (password) formData.append('password', password);
    if (profilePic) formData.append('profile_pic', profilePic);

    try {
      const response = await axios.put('http://localhost:3000/api/v1/admin/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        const updatedData = response.data.data;
        localStorage.setItem('adminProfilePic', updatedData.profile_pic);
        localStorage.setItem('adminUser', updatedData.name || updatedData.username);
        setProfile(updatedData);
        setPassword('');
        setConfirmPassword('');
        
        // Dispatch event so Header updates instantly
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        setMessage({ text: response.data.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'An error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return <div className="loading">Loading profile...</div>;

  return (
    <div className={isModal ? 'admin-profile-container modal-mode' : 'admin-profile-container'}>
      {!isModal && <h2>Admin Profile</h2>}
      <div className="profile-card">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-header">
            <div className="profile-pic-container">
              <img 
                src={preview || (profile.profile_pic ? `http://localhost:3000${profile.profile_pic}` : '/default-avatar.png')} 
                alt="Profile" 
                className="profile-pic-preview"
                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Admin&background=random'; }}
              />
              <label htmlFor="profile_pic" className="upload-btn">
                Change Picture
              </label>
              <input 
                type="file" 
                id="profile_pic" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-info-display">
              <h3>{profile.name || profile.username}</h3>
              <p>Administrator</p>
            </div>
          </div>

          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
          </div>

          <div className="form-group">
            <label>Username / Email</label>
            <input type="text" value={profile.username} disabled autoComplete="username" />
          </div>

          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="save-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
