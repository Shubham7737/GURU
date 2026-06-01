// src/components/CourseCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const CourseCard = ({ course, onSelect }) => {
  return (
    <motion.div
      className="course-card-modern"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(course)}
    >
      <div className="thumb-wrap">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=300&auto=format&fit=crop"}
          alt={course.course_title}
        />
      </div>
      <div className="card-info">
        <h4>{course.course_title}</h4>
        <div className="instructor-wrap">GuruEdu Faculty</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', margin: '0.5rem 0' }}>
          {course.subject_name || 'Programming'} • {course.class_name || 'All Classes'}
        </div>
        <div className="progress-bar">
          <div className="progress-filled" style={{ width: `${course.progress || 0}%` }} />
        </div>
        <button className="btn btn-primary btn-sm btn-block" onClick={(e) => { e.stopPropagation(); onSelect(course); }}>
          Continue Learning
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
