"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';;
import { 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Globe, 
  Award, 
  CheckCircle2, 
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../../src/context/AuthContext';
import '../../../../src/styles/CourseDetails.css';

const CourseDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Dummy course data
  const course = {
    title: 'Mastering Full-Stack Web Development',
    rating: 4.8,
    reviews: '2,450',
    students: '12,500',
    instructor: 'Sarah Jenkins',
    instructorTitle: 'Senior Software Architect',
    duration: '45 Hours',
    lectures: 120,
    language: 'English',
    price: '₹4,999',
    originalPrice: '₹14,999',
    description: 'This comprehensive course takes you from absolute beginner to a professional full-stack developer. You will learn the entire MERN stack, cloud deployment, and system design.',
    syllabus: [
      { title: 'Introduction to HTML5 & CSS3', duration: '5h 20m' },
      { title: 'JavaScript Essentials & ES6', duration: '8h 45m' },
      { title: 'React.js Fundamental Concepts', duration: '12h 10m' },
      { title: 'Node.js & Express Backend', duration: '10h 30m' },
      { title: 'MongoDB & Database Design', duration: '8h 15m' }
    ]
  };

  const handleEnrollClick = () => {
    if (!isLoggedIn) {
      // Pass the current path to login so we can come back
      router.push('/login', { state: { from: `/course/${id}` } });
    } else {
      router.push('/payment');
    }
  };

  return (
    <div className="course-details-page">
      <div className="course-hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-info">
              <span className="breadcrumb">Courses <ChevronRight size={14} /> Development</span>
              <h1>{course.title}</h1>
              <p className="hero-desc">{course.description}</p>
              <div className="course-stats-row">
                <span className="rating"><Star size={16} fill="#F59E0B" color="#F59E0B" /> {course.rating} ({course.reviews} reviews)</span>
                <span><Users size={16} /> {course.students} students enrolled</span>
              </div>
              <div className="instructor-mini">
                <img src="https://ui-avatars.com/api/?name=Sarah+J&background=4F46E5&color=fff" alt="Instructor" />
                <span>Created by <strong>{course.instructor}</strong></span>
              </div>
            </div>
            
            <motion.div 
              className="purchase-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="video-preview">
                <PlayCircle size={64} color="white" />
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop" alt="Preview" />
              </div>
              <div className="card-body">
                <div className="price-row">
                  <span className="current-price">{course.price}</span>
                  <span className="old-price">{course.originalPrice}</span>
                </div>
                <button className="btn btn-primary btn-block" onClick={handleEnrollClick}>
                  Buy This Course Now
                </button>
                <div className="includes">
                  <h4>This course includes:</h4>
                  <ul>
                    <li><Clock size={16} /> {course.duration} on-demand video</li>
                    <li><BookOpen size={16} /> {course.lectures} Lectures</li>
                    <li><Globe size={16} /> Access on mobile and TV</li>
                    <li><Award size={16} /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container content-grid">
        <div className="main-content">
          <section className="learning-points">
            <h2>What you'll learn</h2>
            <div className="points-grid">
              {[
                'Build 15+ real-world web applications',
                'Master React Hooks & Context API',
                'Deploy applications to AWS/Vercel',
                'Implement secure JWT Authentication',
                'Optimize database queries with MongoDB',
                'Design modern responsive interfaces'
              ].map((point, i) => (
                <div key={i} className="point-item">
                  <CheckCircle2 size={18} color="var(--success)" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="syllabus-section">
            <h2>Course Content</h2>
            <div className="syllabus-list">
              {course.syllabus.map((item, i) => (
                <div key={i} className="syllabus-item">
                  <div className="item-left">
                    <PlayCircle size={18} />
                    <span>{item.title}</span>
                  </div>
                  <span className="duration">{item.duration}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
