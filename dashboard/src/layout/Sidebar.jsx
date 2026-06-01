import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Sidebar.css';

const Sidebar = ({ collapsed, onToggle, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/memberships', icon: '💎', label: 'Add Membership' },
    { path: '/classes', icon: '🏫', label: 'Add Class' },
    { path: '/subjects', icon: '📖', label: 'Add Subject' },
    { path: '/courses', icon: '📚', label: 'Add Course' },
    { path: '/clients', icon: '👥', label: 'Clients' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          {!collapsed && <span className="logo-text">Admin Panel</span>}
          <span className="logo-icon">🎓</span>
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;