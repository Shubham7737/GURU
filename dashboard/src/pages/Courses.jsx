import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../components/Table';
import { Toast, ConfirmModal } from '../components/Notification';
import '../css/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Notification States
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [modal, setModal] = useState({ show: false, id: null });
  const [previewCourse, setPreviewCourse] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const handleViewCourse = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/courses/${id}`);
      const result = await response.json();
      if (result.success) {
        setPreviewCourse(result.data);
        setActiveChapterIndex(0); // reset index
      } else {
        setToast({ show: true, message: 'Failed to fetch course preview', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching course preview:', error);
      setToast({ show: true, message: 'Error fetching course details', type: 'error' });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/courses');
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const transformedCourses = result.data.map(course => {
          const chapters = course.chapters ? JSON.parse(course.chapters) : [];
          return {
            id: course.id,
            title: course.course_title,
            className: course.class_name || 'N/A',
            subject: course.subject_name || 'N/A',
            pricing: `${course.name || 'N/A'} - ₹${course.price || 0}`,
            status: course.status,
            chapters: Array.isArray(chapters) ? chapters.length : 0,
            students: 0
          };
        });
        setCourses(transformedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const resetPagination = () => setCurrentPage(1);

  const openDeleteModal = (id) => setModal({ show: true, id });

  const handleDelete = async () => {
    const id = modal.id;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/courses/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setCourses(prev => prev.filter(c => c.id !== id));
        setToast({ show: true, message: 'Course deleted successfully! 🗑️', type: 'success' });
      } else {
        setToast({ show: true, message: 'Failed to delete course', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      setToast({ show: true, message: 'Error deleting course', type: 'error' });
    } finally {
      setModal({ show: false, id: null });
    }
  };

  const columns = [
    { key: 'title', label: 'Course Title' },
    { key: 'className', label: 'Class' },
    { key: 'subject', label: 'Subject' },
    { key: 'pricing', label: 'Pricing' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`co-badge co-badge--${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { key: 'chapters', label: 'Chapters' },
    { key: 'students', label: 'Students' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="co-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="co-btn co-btn--primary" 
            title="Preview Course" 
            style={{ 
              background: 'rgba(99, 102, 241, 0.2)', 
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.4)', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }} 
            onClick={() => handleViewCourse(row.id)}
          >
            👁️ Simulator
          </button>
          <button className="co-actions__edit" onClick={() => navigate(`/courses/edit/${row.id}`)}>✏️</button>
          <button className="co-actions__delete" onClick={() => openDeleteModal(row.id)}>🗑️</button>
        </div>
      )
    }
  ];

  return (
    <div className="co-page">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <ConfirmModal 
        isOpen={modal.show} 
        onConfirm={handleDelete} 
        onCancel={() => setModal({ show: false, id: null })} 
      />

      {/* Header */}
      <div className="co-header">
        <div className="co-header__text">
          <h1 className="co-header__title">Course Management</h1>
          <p className="co-header__subtitle">Create and manage your online courses</p>
        </div>
        <button className="co-btn co-btn--primary" onClick={() => navigate('/courses/create')}>
          + Create Course
        </button>
      </div>

      {/* Stats */}
      <div className="co-stats">
        <div className="co-stats__card">
          <span className="co-stats__icon">📚</span>
          <div>
            <h3 className="co-stats__value">{courses.length}</h3>
            <p className="co-stats__label">Total Courses</p>
          </div>
        </div>
        <div className="co-stats__card">
          <span className="co-stats__icon">🎓</span>
          <div>
            <h3 className="co-stats__value">{courses.filter(c => c.status === 'published').length}</h3>
            <p className="co-stats__label">Published</p>
          </div>
        </div>
        <div className="co-stats__card">
          <span className="co-stats__icon">📝</span>
          <div>
            <h3 className="co-stats__value">{courses.filter(c => c.status === 'draft').length}</h3>
            <p className="co-stats__label">Drafts</p>
          </div>
        </div>
        <div className="co-stats__card">
          <span className="co-stats__icon">👥</span>
          <div>
            <h3 className="co-stats__value">{courses.reduce((sum, c) => sum + c.students, 0)}</h3>
            <p className="co-stats__label">Total Students</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="co-table-section">
        <div className="co-controls">
          <div className="co-search">
            <span className="co-search__icon">🔍</span>
            <input
              type="text"
              className="co-search__input"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); resetPagination(); }}
            />
          </div>
          <select
            className="co-filter"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); resetPagination(); }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <Table columns={columns} data={paginatedCourses} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className="co-pagination">
            <button
              className="co-pagination__btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="co-pagination__numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`co-pagination__num ${currentPage === page ? 'co-pagination__num--active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className="co-pagination__btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Premium Course Preview Simulator Modal */}
      {previewCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            width: '90%',
            maxWidth: '1150px',
            height: '85vh',
            backgroundColor: 'rgba(23, 23, 37, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Modal Head */}
            <div style={{
              padding: '1.25rem 2rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(0,0,0,0.2) 100%)'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👁️</span> Syllabus Simulator: {previewCourse.course_title}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  Class Base: {previewCourse.class_name || 'N/A'} • Subject Link: {previewCourse.subject_name || 'N/A'} • Paywall Plan: {previewCourse.membership_name || 'N/A'} • Expire: {previewCourse.course_duration} Months
                </p>
              </div>
              <button 
                onClick={() => setPreviewCourse(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  lineHeight: '1'
                }}
                onMouseOver={(e) => e.target.style.background = '#ef4444'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Column: Player & Active Chapter Quiz */}
              <div style={{ flex: 1.3, padding: '2rem', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {previewCourse.parsedChapters && previewCourse.parsedChapters.length > 0 ? (
                  <div>
                    {/* Chapter Video */}
                    <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#09090e', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                      {previewCourse.parsedChapters[activeChapterIndex]?.video ? (
                        <video 
                          key={previewCourse.parsedChapters[activeChapterIndex].chapter_no}
                          src={`http://localhost:3000/uploads/${previewCourse.parsedChapters[activeChapterIndex].video}`}
                          controls
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.35)', gap: '8px' }}>
                          <span style={{ fontSize: '2rem' }}>📹</span>
                          <span style={{ fontSize: '0.9rem' }}>No Video Lecture Uploaded for this unit.</span>
                        </div>
                      )}
                    </div>

                    {/* Active Chapter Details */}
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#a5b4fc', fontSize: '1.25rem' }}>
                      Chapter {previewCourse.parsedChapters[activeChapterIndex].chapter_no}: {previewCourse.parsedChapters[activeChapterIndex].chapter_title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
                      {previewCourse.parsedChapters[activeChapterIndex].chapter_description || 'No module description configured.'}
                    </p>

                    {/* Chapter Quiz Questions */}
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        🔒 Gating Quiz Questions ({previewCourse.parsedChapters[activeChapterIndex].quiz?.length || 0})
                      </h4>
                      {previewCourse.parsedChapters[activeChapterIndex].quiz && previewCourse.parsedChapters[activeChapterIndex].quiz.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {previewCourse.parsedChapters[activeChapterIndex].quiz.map((q, idx) => (
                            <div key={idx} style={{ padding: '0.9rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                              <p style={{ margin: '0 0 0.6rem 0', fontWeight: '600', fontSize: '0.95rem', color: '#e2e8f0' }}>Q{idx + 1}: {q.question}</p>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                                {q.options ? (
                                  Array.isArray(q.options) ? (
                                    q.options.map((opt, oIdx) => {
                                      const letter = ['A', 'B', 'C', 'D'][oIdx];
                                      const isCorrect = letter === q.correctAnswer;
                                      return (
                                        <div key={oIdx} style={{ 
                                          padding: '4px 8px', 
                                          borderRadius: '4px', 
                                          backgroundColor: isCorrect ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                                          color: isCorrect ? '#34d399' : 'rgba(255,255,255,0.55)', 
                                          fontWeight: isCorrect ? '700' : 'normal' 
                                        }}>
                                          {letter}. {opt} {isCorrect && '✓'}
                                        </div>
                                      );
                                    })
                                  ) : (
                                    Object.entries(q.options).map(([key, val]) => {
                                      const isCorrect = key === q.correctAnswer;
                                      return (
                                        <div key={key} style={{ 
                                          padding: '4px 8px', 
                                          borderRadius: '4px', 
                                          backgroundColor: isCorrect ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                                          color: isCorrect ? '#34d399' : 'rgba(255,255,255,0.55)', 
                                          fontWeight: isCorrect ? '700' : 'normal' 
                                        }}>
                                          {key}. {val} {isCorrect && '✓'}
                                        </div>
                                      );
                                    })
                                  )
                                ) : (
                                  ['a', 'b', 'c', 'd'].map(optKey => {
                                    const letter = optKey.toUpperCase();
                                    const isCorrect = letter === q.correctAnswer;
                                    const optVal = q[`option_${optKey}`];
                                    if (!optVal) return null;
                                    return (
                                      <div key={optKey} style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        backgroundColor: isCorrect ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                                        color: isCorrect ? '#34d399' : 'rgba(255,255,255,0.55)', 
                                        fontWeight: isCorrect ? '700' : 'normal' 
                                      }}>
                                        {letter}. {optVal} {isCorrect && '✓'}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No gating quiz questions configured for this unit.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.4)' }}>
                    <span>📚 No chapters configured for this course yet.</span>
                  </div>
                )}
              </div>

              {/* Right Column: Syllabus Selector & Final Exam Preview */}
              <div style={{ flex: 0.8, backgroundColor: 'rgba(0,0,0,0.2)', padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Course Promo Trailer Intro */}
                {previewCourse.intro_video && (
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.15)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎥 Course Promotional Trailer</h4>
                    <video 
                      src={`http://localhost:3000/uploads/${previewCourse.intro_video}`} 
                      controls 
                      style={{ width: '100%', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }} 
                    />
                  </div>
                )}

                {/* Chapters list */}
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course Syllabus</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {previewCourse.parsedChapters && previewCourse.parsedChapters.map((ch, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveChapterIndex(idx)}
                        style={{
                          padding: '1rem',
                          borderRadius: '8px',
                          border: activeChapterIndex === idx ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                          backgroundColor: activeChapterIndex === idx ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: activeChapterIndex === idx ? '0 4px 12px rgba(99,102,241,0.15)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontWeight: activeChapterIndex === idx ? '600' : 'normal', color: activeChapterIndex === idx ? '#fff' : 'rgba(255,255,255,0.8)' }}>
                          Unit {ch.chapter_no}: {ch.chapter_title}
                        </span>
                        <span style={{ fontSize: '1.1rem' }}>{activeChapterIndex === idx ? '▶️' : '📁'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Exam Section */}
                <div style={{ marginTop: 'auto', padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.03)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                    🎓 Final Exam Assessment
                  </h4>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    Requires passing score of <strong>{previewCourse.passing_percentage}%</strong>
                  </p>
                  
                  {previewCourse.parsedFinalExam && previewCourse.parsedFinalExam.questions && previewCourse.parsedFinalExam.questions.length > 0 ? (
                    <details style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                      <summary style={{ color: '#ec4899', fontWeight: '600', outline: 'none' }}>Show Exam Questions ({previewCourse.parsedFinalExam.questions.length})</summary>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                        {previewCourse.parsedFinalExam.questions.map((q, idx) => (
                          <div key={idx} style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid #ec4899' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#f3f4f6' }}>Q{idx + 1}: {q.question}</p>
                            <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 'bold' }}>Correct Option: {q.correctAnswer}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>No final exam questions configured.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;