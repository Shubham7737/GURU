import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  PlayCircle, 
  User, 
  CreditCard, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Clock,
  Award,
  CheckCircle,
  Lock,
  Menu
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SessionCard from '../components/SessionCard';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Fetch public courses for now to populate the dashboard catalog
    fetch('http://localhost:3000/api/v1/public/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCourses(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch courses:', err))
      .finally(() => setCoursesLoading(false));

  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchCourseSessions = (courseId) => {
    setSessions([
      { id: 1, title: 'Introduction to the Course', isLocked: false, progress: 100 },
      { id: 2, title: 'Core Concepts', isLocked: false, progress: 50 },
      { id: 3, title: 'Advanced Patterns', isLocked: true, progress: 0 },
      { id: 4, title: 'Final Project', isLocked: true, progress: 0 }
    ]);
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { icon: <BookOpen size={20} />, label: 'My Courses' },
    { icon: <Video size={20} />, label: 'Live Classes' },
    { icon: <PlayCircle size={20} />, label: 'Recorded Classes' },
    { icon: <User size={20} />, label: 'Profile' },
    { icon: <CreditCard size={20} />, label: 'Subscription' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  const renderContent = () => {
    if (coursesLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
          <div className="spinner"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'My Courses':
        return (
          <div className="courses-grid-view">
            {courses.map((course) =>                <div key={course.id} className="course-card-modern" onClick={() => {
                  setSelectedCourse(course);
                  fetchCourseSessions(course.id);
                  setActiveTab('Course Detail');
                }} style={{ cursor: 'pointer' }}>
                  <div className="thumb-wrap">
                    <img src={course.intro_video ? `http://localhost:3000/uploads/${course.intro_video}` : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=300&auto=format&fit=crop"} alt={course.course_title} />
                  </div>
                  <div className="card-info">
                    <h4>{course.course_title}</h4>
                    <div className="instructor-wrap">by GuruEdu Faculty</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', margin: '0.5rem 0' }}>
                      {course.subject_name || 'Programming'} • {course.class_name || 'All Classes'}
                    </div>
                    <button className="btn btn-primary btn-sm btn-block" onClick={(e) => { e.stopPropagation(); navigate(`/learn/${course.id}`); }}>
                      Continue Learning
                    </button>
                  </div>
                </div>
            )}
            {courses.length === 0 && (
              <div className="cc-empty-state" style={{ textAlign: 'center', gridColumn: '1/-1', padding: '4rem 1rem' }}>
                <p>No courses found. Launch courses in the Admin Dashboard to populate this catalog!</p>
              </div>
            )}
          </div>
        );
      case 'Live Classes':
        return (
          <div className="live-classes-view">
            <div className="live-hero-card">
              <div className="live-badge">LIVE NOW</div>
              <h2>Advanced React Patterns</h2>
              <p>Learn HOCs, Render Props, and Compound Components with Sarah Jenkins.</p>
              <button className="btn btn-primary" onClick={() => navigate('/live-session/1')}>Join Session Now</button>
            </div>
          </div>
        );
      case 'Recorded Classes':
        return (
          <div className="courses-grid-view">
            {courses.slice(0, 2).map((course, i) => (
              <div key={i} className="course-card-modern">
                <div className="thumb-wrap">
                  <img src={course.intro_video ? `http://localhost:3000/uploads/${course.intro_video}` : "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=300&auto=format&fit=crop"} alt={course.course_title} />
                </div>
                <div className="card-info">
                  <h4>{course.course_title}</h4>
                  <div className="instructor-wrap">by GuruEdu Faculty</div>
                  <div className="progress-mini">
                    <Clock size={14} /> <span>{course.course_duration || '3 Months'}</span>
                  </div>
                  <button className="btn btn-primary btn-sm btn-block" style={{ marginTop: '1rem' }} onClick={() => navigate(`/learn/${course.id}`)}>Watch Now</button>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', width: '100%' }}>No recorded lectures cataloged.</div>
            )}
          </div>
        );
      case 'Course Detail':
        return (
          <div className="course-detail-view">
            <button className="btn btn-link" onClick={() => { setSelectedCourse(null); setActiveTab('My Courses'); }}>
              ← Back to Courses
            </button>
            <h2>{selectedCourse?.course_title} – Sessions</h2>
            {sessionsLoading ? (
              <div className="spinner" />
            ) : (
              <div className="sessions-grid">
                {sessions.map((sess) => (
                  <SessionCard
                    key={sess.id}
                    title={sess.title}
                    isLocked={sess.isLocked}
                    progress={sess.progress || 0}
                    onClick={() => {
                      if (!sess.isLocked) navigate(`/learn/${selectedCourse.id}/session/${sess.id}`);
                    }}
                  />
                ))}
                {sessions.length === 0 && <p>No sessions available.</p>}
              </div>
            )}
          </div>
        );
      case 'Subscription':
        return (
          <div className="subscription-view">
            <div className="plan-card active">
               <div className="plan-header">
                  <div>
                    <h3>Premium Academic Tier</h3>
                    <span>Active Lifetime Access</span>
                  </div>
                  <div className="plan-price">₹4,999</div>
               </div>
               <ul className="plan-features">
                  <li><CheckCircle size={16} color="var(--success)" /> Unlimited access to all courses</li>
                  <li><CheckCircle size={16} color="var(--success)" /> All Progression Gating Quizzes</li>
                  <li><CheckCircle size={16} color="var(--success)" /> Automated Industry Certification</li>
               </ul>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="settings-view">
            <div className="settings-section">
               <h3>Notifications</h3>
               <div className="toggle-group">
                  <div className="toggle-info">
                    <strong>Email Notifications</strong>
                    <span>Get updates about your course progress via email.</span>
                  </div>
                  <input type="checkbox" defaultChecked />
               </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon bg-primary"><BookOpen size={24} /></div>
                <div className="stat-data">
                  <h3>{courses.length}</h3>
                  <span>Total Tracks</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-success"><Award size={24} /></div>
                <div className="stat-data">
                  <h3>Automated</h3>
                  <span>Certifications</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-warning"><Clock size={24} /></div>
                <div className="stat-data">
                  <h3>Sequential</h3>
                  <span>Step Gating</span>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="recent-courses">
                <div className="section-title">
                  <h2>Continue Learning</h2>
                </div>
                <div className="course-list">
                  {courses.slice(0, 2).map((course, i) => (
                    <div key={course.id} className="mini-course-card">
                      <img src={course.intro_video ? `http://localhost:3000/uploads/${course.intro_video}` : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=300&auto=format&fit=crop"} alt={course.course_title} />
                      <div className="mini-info">
                        <h4>{course.course_title}</h4>
                        <span>Track Duration: {course.course_duration || '3 Months'}</span>
                      </div>
                      <button className="play-btn" onClick={() => navigate(`/learn/${course.id}`)}><PlayCircle size={24} /></button>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No curriculum tracks launched yet.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="brand-logo">G</div>
          <span>GuruEdu</span>
        </Link>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button 
              key={item.label}
              className={`nav-item ${activeTab === item.label ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
              {activeTab === item.label && <motion.div layoutId="active-pill" className="active-pill" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <button className="dash-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="search-wrapper">
            <Search size={18} />
            <input type="text" placeholder="Search your courses..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="user-profile">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=4F46E5&color=fff`} alt="User" />
              <div className="user-info">
                <strong>{user?.name || 'Student User'}</strong>
                <span>Student</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="tab-header">
            <h1>{activeTab}</h1>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
