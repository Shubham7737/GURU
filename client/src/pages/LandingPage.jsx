import React from 'react';
import { Play, Star, Users, Award, BookOpen, Clock, ArrowRight, CheckCircle2, CheckCircle, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [courses, setCourses] = React.useState([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/v1/public/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCourses(data.data.slice(0, 6)); // Display up to 6 latest courses
        }
      })
      .catch(err => console.error('Failed to fetch public courses:', err));
  }, []);

  const handleEnroll = (courseId) => {
    navigate(`/course/${courseId}`);
  };
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge">🚀 Experience the Future of Learning</span>
            <h1>Guru<span className="text-gradient">Edu</span> – Learn Skills with Live Online Classes</h1>
            <p className="subtitle">
              Empower your career with industry-leading courses. Join 10,000+ students 
              learning from expert mentors in real-time sessions.
            </p>
            <div className="hero-btns">
              <button className="btn btn-primary btn-lg" onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup')}>
                {isLoggedIn ? 'Go to Dashboard' : 'Explore Courses'} <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline btn-lg">
                <Play size={18} fill="currentColor" /> Watch Demo
              </button>
            </div>
            {/* <div className="hero-stats">
              <div className="stat">
                <strong>10k+</strong>
                <span>Students</span>
              </div>
              <div className="stat">
                <strong>200+</strong>
                <span>Courses</span>
              </div>
              <div className="stat">
                <strong>4.9/5</strong>
                <span>Rating</span>
              </div>
            </div> */}

          </motion.div>

          <motion.div 
            className="hero-image-wrapper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="floating-card card-1">
              <Users color="var(--primary)" />
              <span>500+ Live Now</span>
            </div>
            <div className="floating-card card-2">
              <Star color="#F59E0B" fill="#F59E0B" />
              <span>Top Rated Mentors</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
              alt="Students learning" 
              className="hero-main-img"
            />
            <div className="hero-blob"></div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us - Auto Slider */}
      <section className="features-slider">
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '3rem' }}>
            <h2>Why Choose GuruEdu?</h2>
            <p>We provide the best tools and teachers to help you excel in your journey.</p>
          </div>
        </div>
        
        <div className="slider-wrapper">
          <motion.div 
            className="slider-track"
            animate={{ x: [0, -1000] }}
            transition={{ 
              x: { repeat: Infinity, repeatType: "loop", duration: 25, ease: "linear" }
            }}
          >
            {[
              { icon: <Play />, title: "Live Classes", desc: "Interactive sessions with real-time doubt clearing." },
              { icon: <Award />, title: "Certificates", desc: "Get recognized for your hard work and skills." },
              { icon: <Users />, title: "Expert Teachers", desc: "Learn from industry professionals with years of experience." },
              { icon: <BookOpen />, title: "Recorded Videos", desc: "Missed a class? No worries, access all recordings anytime." },
              { icon: <Clock />, title: "Lifetime Access", desc: "Learn at your own pace with lifetime access to materials." },
              { icon: <Star />, title: "Premium Quality", desc: "Top-tier content curated by subject matter experts." }
            ].concat([ // Duplicate for infinite effect
              { icon: <Play />, title: "Live Classes", desc: "Interactive sessions with real-time doubt clearing." },
              { icon: <Award />, title: "Certificates", desc: "Get recognized for your hard work and skills." },
              { icon: <Users />, title: "Expert Teachers", desc: "Learn from industry professionals with years of experience." }
            ]).map((feat, i) => (
              <div key={i} className="slider-card">
                <div className="feat-icon">{feat.icon}</div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="ai-innovation">
        <div className="container ai-container">
          <div className="ai-header text-center">
            <span className="badge-outline">Next-Gen Technology</span>
            <h2>AI-Powered Learning Experience</h2>
          </div>
          <div className="ai-grid">
            <div className="ai-feature">
              <div className="ai-icon-wrap"><Award size={24} /></div>
              <h4>Personalized Paths</h4>
              <p>Our AI analyzes your progress to create a custom curriculum just for you.</p>
            </div>
            <div className="ai-feature">
              <div className="ai-icon-wrap"><Users size={24} /></div>
              <h4>24/7 Smart Tutor</h4>
              <p>Get instant answers to your doubts anytime with our integrated AI assistant.</p>
            </div>
            <div className="ai-feature">
              <div className="ai-icon-wrap"><BookOpen size={24} /></div>
              <h4>Adaptive Testing</h4>
              <p>Quizzes that evolve with your skill level to ensure true mastery of subjects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section id="courses" className="courses-section">
        <div className="container">
          <div className="section-header flex-row">
            <div>
              <h2>Explore Our Popular Courses</h2>
              <p>Pick the best course for your career growth.</p>
            </div>
            <button className="btn btn-outline">View All Courses</button>
          </div>
          
          <div className="courses-grid">
            {courses.length > 0 ? courses.map((course, i) => (
              <motion.div 
                key={course.id || i} 
                className="course-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="course-image">
                  {/* Use course thumbnail image if uploaded, otherwise fallback to teaser/video or placeholder */}
                  <img src={course.course_image ? `http://localhost:3000/uploads/${course.course_image}` : course.intro_video ? `http://localhost:3000/uploads/${course.intro_video}` : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop'} alt={course.course_title} />
                  <span className="badge">New</span>
                </div>
                <div className="course-content">
                  <div className="rating-row">
                    <div className="stars"><Star size={14} fill="#F59E0B" color="#F59E0B" /> <span>4.8</span></div>
                    <div className="duration"><Clock size={14} /> {course.course_duration} Hours</div>
                  </div>
                  <h3 style={{ textTransform: 'capitalize' }}>{course.course_title}</h3>
                  <p className="teacher">Subject: {course.subject_name || 'General'}</p>
                  <div className="course-footer">
                    <span className="price">₹{course.price || 'Free'}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(course.id)}>Enroll Now</button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-light)', gridColumn: '1 / -1' }}>
                <p>Loading amazing courses for you...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="stats-bar">
        <div className="container stats-container">
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-item">
            <h3>150+</h3>
            <p>Expert Mentors</p>
          </div>
          <div className="stat-item">
            <h3>200+</h3>
            <p>Total Courses</p>
          </div>
          <div className="stat-item">
            <h3>95%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="certification-showcase">
        <div className="container cert-container">
          <div className="cert-content">
            <span className="badge-outline">Industry Standard</span>
            <h2>Earn a Professional Certificate</h2>
            <p>Get recognized for your skills. Complete your course, pass the assessments, and earn an industry-recognized certificate from GuruEdu to boost your career prospects.</p>
            <ul className="cert-benefits">
              <li><CheckCircle size={20} color="var(--primary)" /> Shareable on LinkedIn & CV</li>
              <li><CheckCircle size={20} color="var(--primary)" /> Verified by Industry Experts</li>
              <li><CheckCircle size={20} color="var(--primary)" /> Lifetime Digital Access</li>
            </ul>
            <button className="btn btn-primary btn-lg">Explore Certified Courses</button>
          </div>
          <div className="cert-visual">
            <div className="certificate-mockup animate-float">
               <div className="cert-inner">
                  <GraduationCap size={40} color="var(--primary)" />
                  <h4>Certificate of Completion</h4>
                  <p>Presented to</p>
                  <div className="student-name">Sample Student</div>
                  <div className="cert-footer">
                    <span>ID: GE-2026-X8Y9</span>
                    <span>GuruEdu Authorized</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="section-header text-center">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about GuruEdu platform</p>
          </div>
          <div className="faq-grid">
            {[
              { q: "Is GuruEdu a registered platform?", a: "Yes, GuruEdu is a fully registered educational platform providing industry-certified courses and professional mentorship." },
              { q: "How do I receive my certificate?", a: "After completing all course modules and passing the final assessment with at least 40%, your digital certificate will be generated automatically in your dashboard." },
              { q: "Can I access courses on mobile?", a: "Absolutely! Our platform is fully responsive. You can learn anytime, anywhere on your smartphone, tablet, or laptop." },
              { q: "Are the live sessions recorded?", a: "Yes, every live session is recorded and uploaded to the 'Recorded Classes' section of your dashboard within 24 hours." }
            ].map((faq, i) => (
              <div key={i} className="faq-card">
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container text-center">
          <h2>Ready to Transform Your Career?</h2>
          <p>Join thousands of students who are already learning and growing with GuruEdu.</p>
          <div className="cta-btns">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>Get Started for Free</button>
            <button className="btn btn-outline btn-lg">Contact Support</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
