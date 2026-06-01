import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast } from '../components/Notification';
import '../css/CourseCreate.css';

const CourseCreate = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const isEditMode = !!courseId;
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Master Database States (Dynamic Dropdowns)
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [memberships, setMemberships] = useState([]);

  // Main Course Meta Fields
  const [formData, setFormData] = useState({
    courseTitle: '',
    targetClass: '',
    targetClassId: '',
    subject: '',
    subjectId: '',
    membershipPlan: '',
    membershipId: '',
    courseDuration: 3, 
    introVideo: null,
    courseImage: null,
    courseDescription: ''
  });

  // Dynamic Content States
  const [chapters, setChapters] = useState([]);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  // Fetch Master Data on Component Mount
  useEffect(() => {
    const initializeComponent = async () => {
      const loadedSubjects = await fetchMasterData();
      if (isEditMode) {
        await fetchCourseData(loadedSubjects || []);
      } else {
        addChapter();
      }
    };
    initializeComponent();
  }, []);

  // Auto-filter subjects when subjects are loaded in edit mode
  useEffect(() => {
    if (isEditMode && formData.targetClassId && subjects.length > 0) {
      const filtered = subjects.filter(sub => Number(sub.class_id) === Number(formData.targetClassId));
      setFilteredSubjects(filtered);
    }
  }, [subjects]);

  // Helper function to expand subject arrays (supports both arrays and JSON stringified arrays)
  const expandSubjects = (subjectsData) => {
    const expandedSubjects = [];
    subjectsData.forEach(subject => {
      let parsedNames = subject.subject_name;
      if (typeof subject.subject_name === 'string') {
        try {
          parsedNames = JSON.parse(subject.subject_name);
        } catch (e) {
          parsedNames = subject.subject_name;
        }
      }

      if (Array.isArray(parsedNames)) {
        parsedNames.forEach((name, index) => {
          expandedSubjects.push({
            ...subject,
            subject_name: name,
            expandedId: `${subject.id}_${index}`,
            originalId: subject.id
          });
        });
      } else {
        expandedSubjects.push({
          ...subject,
          subject_name: parsedNames,
          expandedId: subject.id,
          originalId: subject.id
        });
      }
    });
    return expandedSubjects;
  };

  const fetchMasterData = async () => {
    try {
      const [classesRes, subjectsRes, membershipsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/add-class?status=active'),
        fetch('http://localhost:3000/api/v1/add-subject?status=active'),
        fetch('http://localhost:3000/api/v1/membership?status=active')
      ]);

      const classesData = await classesRes.json();
      const subjectsData = await subjectsRes.json();
      const membershipsData = await membershipsRes.json();

      let expandedSubjectsData = [];
      if (classesData.success) setClasses(classesData.data || []);
      if (subjectsData.success) {
        expandedSubjectsData = expandSubjects(subjectsData.data || []);
        setSubjects(expandedSubjectsData);
      }
      if (membershipsData.success) setMemberships(membershipsData.data || []);
      
      return expandedSubjectsData;
    } catch (error) {
      console.error("Master DB Fetch Error:", error);
      return [];
    }
  };

  const fetchCourseData = async (allSubjects = []) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/courses/${courseId}`);
      const result = await response.json();
      
      if (result.success) {
        const course = result.data;
        let resolvedSubject = course.subject_name;
        if (resolvedSubject && resolvedSubject.startsWith('[')) {
          try {
            const parsed = JSON.parse(resolvedSubject);
            if (Array.isArray(parsed) && parsed.length > 0) {
              resolvedSubject = parsed[0];
            }
          } catch (e) {}
        }

        setFormData({
          courseTitle: course.course_title,
          targetClass: course.class_name,
          targetClassId: course.class_id,
          subject: resolvedSubject,
          subjectId: course.subject_id,
          membershipPlan: course.name,
          membershipId: course.membership_id,
          courseDuration: course.course_duration,
          introVideo: course.intro_video || null,
          courseImage: course.course_image || null,
          courseDescription: course.course_description || ''
        });

        // Filter subjects for the selected class
        if (course.class_id) {
          const filtered = allSubjects.filter(sub => Number(sub.class_id) === Number(course.class_id));
          setFilteredSubjects(filtered);
        }

        const chaptersData = course.chapters ? JSON.parse(course.chapters) : [];
        const mappedChapters = chaptersData.map(ch => ({
          ...ch,
          title: ch.chapter_title || ch.title || '',
          description: ch.chapter_description || ch.description || '',
          studyMaterial: ch.studyMaterial || ch.video || ''
        }));
        setChapters(mappedChapters);

        if (course.final_exam) {
          const finalExamData = JSON.parse(course.final_exam);
          setFinalQuestions(finalExamData.questions || []);
          setPassingPercentage(finalExamData.passingPercentage || 40);
        }
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'targetClass') {
        const selectedClass = classes.find(c => c.class_name === value);
        updated.targetClassId = selectedClass?.id || '';
        
        // Update filtered subjects
        if (selectedClass?.id) {
          const filtered = subjects.filter(sub => Number(sub.class_id) === Number(selectedClass.id));
          setFilteredSubjects(filtered);
          
          // Auto-select first subject
          if (filtered.length > 0) {
            updated.subject = filtered[0].subject_name;
            updated.subjectId = filtered[0].originalId; // Use originalId for backend submission
          } else {
            updated.subject = '';
            updated.subjectId = '';
          }
        } else {
          setFilteredSubjects([]);
          updated.subject = '';
          updated.subjectId = '';
        }
      } else if (name === 'subject') {
        // Find subject by subject_name (the display value)
        const selectedSubject = filteredSubjects.find(s => s.subject_name === value);
        updated.subjectId = selectedSubject?.originalId || ''; // Use originalId for backend submission
      } else if (name === 'membershipPlan') {
        const selectedMembership = memberships.find(m => m.name === value);
        updated.membershipId = selectedMembership?.id || '';
      }
      
      return updated;
    });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Chapter Row Controls
  const addChapter = () => {
    setChapters(prev => [...prev, {
      id: Date.now(),
      title: '',
      description: '',
      studyMaterial: null,
      quiz: [] 
    }]);
  };

  const removeChapter = (chapterId) => {
    setChapters(prev => prev.filter(c => c.id !== chapterId));
  };

  const handleChapterInputChange = (chapterId, field, value) => {
    setChapters(prev => prev.map(chapter => 
      chapter.id === chapterId ? { ...chapter, [field]: value } : chapter
    ));
  };

  const handleChapterFileChange = (chapterId, file) => {
    setChapters(prev => prev.map(chapter =>
      chapter.id === chapterId ? { ...chapter, studyMaterial: file } : chapter
    ));
  };

// Quiz Handling (Shared for Module-Gates & Final Assessment)
  const addQuestion = (chapterId, isFinal = false) => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 'A'
    };
    if (isFinal) {
      setFinalQuestions(prev => [...prev, newQuestion]);
    } else {
      setChapters(prev => prev.map(chapter =>
        chapter.id === chapterId ? { ...chapter, quiz: [...chapter.quiz, newQuestion] } : chapter
      ));
    }
  };

  const removeQuestion = (chapterId, questionId, isFinal = false) => {
    if (isFinal) {
      setFinalQuestions(prev => prev.filter(q => q.id !== questionId));
    } else {
      setChapters(prev => prev.map(chapter =>
        chapter.id === chapterId ? { ...chapter, quiz: chapter.quiz.filter(q => q.id !== questionId) } : chapter
      ));
    }
  };

  const updateQuestion = (chapterId, questionId, field, value, isFinal = false) => {
    if (isFinal) {
      setFinalQuestions(prev => prev.map(q => q.id === questionId ? { ...q, [field]: value } : q));
    } else {
      setChapters(prev => prev.map(chapter =>
        chapter.id === chapterId
          ? { ...chapter, quiz: chapter.quiz.map(q => q.id === questionId ? { ...q, [field]: value } : q) }
          : chapter
      ));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      const chaptersToPrepare = chapters.map((chapter, index) => {
        // If it's a new file, append it with a unique index
        if (chapter.studyMaterial instanceof File) {
          formDataToSend.append(`chapter_file_${index}`, chapter.studyMaterial);
          // Temporary placeholder for the backend to replace with actual filename
          return { ...chapter, studyMaterial: `__PENDING_FILE_${index}__` };
        }
        // If it's already a string (existing file), keep it
        return chapter;
      });

      formDataToSend.append('course_title', formData.courseTitle);
      formDataToSend.append('class_id', formData.targetClassId);
      formDataToSend.append('subject_id', formData.subjectId);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('membership_id', formData.membershipId);
      formDataToSend.append('course_duration', formData.courseDuration);
      formDataToSend.append('course_description', formData.courseDescription);
      formDataToSend.append('chapters', JSON.stringify(chaptersToPrepare));
      formDataToSend.append('final_exam', JSON.stringify({
        passingPercentage: Number(passingPercentage),
        questions: finalQuestions
      }));
      formDataToSend.append('passing_percentage', passingPercentage);
      formDataToSend.append('status', 'active');
      
      if (formData.introVideo instanceof File) {
        formDataToSend.append('intro_video', formData.introVideo);
      }
      if (formData.courseImage instanceof File) {
        formDataToSend.append('course_image', formData.courseImage);
      } else if (typeof formData.courseImage === 'string' && formData.courseImage) {
        formDataToSend.append('course_image', formData.courseImage);
      }

      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `http://localhost:3000/api/v1/courses/${courseId}`
        : 'http://localhost:3000/api/v1/courses';

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setToast({ show: true, message: isEditMode ? 'Course updated successfully! 🚀' : 'Course created successfully! 🚀', type: 'success' });
        setTimeout(() => navigate('/courses'), 1500);
      } else {
        setToast({ show: true, message: 'Error: ' + (result.message || 'Failed to save course'), type: 'error' });
      }
    } catch (err) {
      console.error("Error:", err);
      setToast({ show: true, message: 'Error saving course: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-dashboard-container">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <div className="cc-glass-wrapper">

        {/* Header Block */}
        <div className="cc-header-section">
          <div>
            <h1 className="cc-main-title">Automated Course Studio</h1>
            <p className="cc-main-subtitle">{isEditMode ? 'Edit course' : 'Build step-locked learning pathways with autonomous expiration logic'}</p>
          </div>
          <button type="button" className="cc-action-btn cc-btn-secondary" onClick={() => navigate('/courses')}>
            ← Back to Fleet
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Step 1: Course Scope Definition */}
          <div className="cc-glass-card">
            <div className="cc-glass-card__head">
              <span className="cc-card-icon-wrapper">⚙️</span>
              <h2 className="cc-glass-card__title">Course Parameters & Meta Config</h2>
            </div>
            
            <div className="cc-form-group">
              <label className="cc-modern-label">Course Title <span className="cc-marker">*</span></label>
              <input 
                type="text" 
                className="cc-modern-input" 
                name="courseTitle" 
                placeholder="e.g., Master C Language: Zero to Hero" 
                value={formData.courseTitle} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="cc-form-group" style={{ marginTop: '1rem' }}>
              <label className="cc-modern-label">Course Description</label>
              <textarea 
                className="cc-modern-input" 
                name="courseDescription" 
                rows="3"
                style={{ resize: 'vertical', minHeight: '80px', padding: '0.75rem' }}
                placeholder="Enter course scope, syllabus highlights, and takeaways..." 
                value={formData.courseDescription || ''} 
                onChange={handleInputChange} 
              />
            </div>

            <div className="cc-fields-row">
              <div className="cc-form-group">
                <label className="cc-modern-label">Target Class Base <span className="cc-marker">*</span></label>
                <select className="cc-modern-select" name="targetClass" value={formData.targetClass} onChange={handleInputChange} required>
                  <option value="">Select Target Database Link</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
                  ))}
                </select>
              </div>
              <div className="cc-form-group">
                <label className="cc-modern-label">Subject Category <span className="cc-marker">*</span></label>
                <select className="cc-modern-select" name="subject" value={formData.subject} onChange={handleInputChange} required disabled={!formData.targetClassId}>
                  <option value="">{!formData.targetClassId ? 'Select Class First' : 'Select Specialized Subject'}</option>
                  {filteredSubjects.map(sub => (
                    <option key={sub.expandedId} value={sub.subject_name}>{sub.subject_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="cc-fields-row">
              <div className="cc-form-group">
                <label className="cc-modern-label">Membership Tier Alignment <span className="cc-marker">*</span></label>
                <select className="cc-modern-select" name="membershipPlan" value={formData.membershipPlan} onChange={handleInputChange} required>
                  <option value="">Select Paywall Tier</option>
                  {memberships.map(mem => (
                    <option key={mem.id} value={mem.name}>{mem.name} (₹{mem.price})</option>
                  ))}
                </select>
              </div>
              <div className="cc-form-group">
                <label className="cc-modern-label">Course Lifespan Limit (Months) <span className="cc-marker">*</span></label>
                <input 
                  type="number" 
                  className="cc-modern-input" 
                  name="courseDuration" 
                  min="1" 
                  max="36" 
                  value={formData.courseDuration} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Step 2: Media Promo Pitch */}
          <div className="cc-glass-card">
            <div className="cc-glass-card__head">
              <span className="cc-card-icon-wrapper">🎥</span>
              <h2 className="cc-glass-card__title">Promo Reel & Trailing Assets</h2>
            </div>
            <div className="cc-form-group">
              <label className="cc-modern-label">Teaser Video File</label>
              <div className="cc-dropzone-box">
                <input type="file" accept="video/*" className="cc-hidden-file" id="introVideo" onChange={(e) => handleFileChange(e, 'introVideo')} />
                <label htmlFor="introVideo" className="cc-dropzone-trigger">
                  <span className="cc-dropzone-icon">📤</span>
                  <span className="cc-dropzone-text">{formData.introVideo ? (formData.introVideo.name || formData.introVideo) : 'Drop or browse public trailer file (.mp4)'}</span>
                </label>
              </div>
              {formData.introVideo && typeof formData.introVideo === 'string' && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(42, 58, 78, 0.8)', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>🎞️ Saved Teaser Video:</span>
                  <video 
                    src={`http://localhost:3000/uploads/${formData.introVideo}`} 
                    width="200" 
                    height="200" 
                    controls 
                    style={{ borderRadius: '8px', border: '1px solid rgba(203,213,225,0.8)', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </div>

            <div className="cc-form-group">
              <label className="cc-modern-label">Course Thumbnail Image</label>
              <div className="cc-dropzone-box">
                <input type="file" accept="image/*" className="cc-hidden-file" id="courseImage" onChange={(e) => handleFileChange(e, 'courseImage')} />
                <label htmlFor="courseImage" className="cc-dropzone-trigger">
                  <span className="cc-dropzone-icon">🖼️</span>
                  <span className="cc-dropzone-text">{formData.courseImage ? (formData.courseImage.name || formData.courseImage) : 'Upload course cover image (.jpg, .png)'}</span>
                </label>
              </div>
              {formData.courseImage && typeof formData.courseImage === 'string' && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(42, 58, 78, 0.8)', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>🖼️ Current Cover Image:</span>
                  <img 
                    src={`http://localhost:3000/uploads/${formData.courseImage}`} 
                    width="240" 
                    alt="Course cover" 
                    style={{ borderRadius: '12px', border: '1px solid rgba(203,213,225,0.8)', objectFit: 'cover' }} 
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Sequential Content Tracks */}
          <div className="cc-section-divider">
            <span className="cc-divider-line"></span>
            <span className="cc-divider-text">Curriculum Sequencing Engine</span>
            <span className="cc-divider-line"></span>
          </div>
          
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="cc-glass-card cc-glass-card--chapter-step">
              <div className="cc-glass-card__head cc-flex-between">
                <div className="cc-step-identity">
                  <span className="cc-identity-index">#{index + 1}</span>
                  <input 
                    type="text" 
                    className="cc-modern-input cc-chapter-inline-title" 
                    placeholder="Enter Chapter / Module Name"
                    value={chapter.title}
                    required
                    onChange={(e) => handleChapterInputChange(chapter.id, 'title', e.target.value)}
                  />
                </div>
                {chapters.length > 1 && (
                  <button type="button" className="cc-delete-module-btn" onClick={() => removeChapter(chapter.id)}>
                    Remove Unit
                  </button>
                )}
              </div>

              <div className="cc-form-group">
                <label className="cc-modern-label">Module Objectives</label>
                <textarea 
                  className="cc-modern-input" 
                  rows="2"
                  placeholder="Summarize the key knowledge structures packed inside this module..." 
                  value={chapter.description}
                  onChange={(e) => handleChapterInputChange(chapter.id, 'description', e.target.value)}
                />
              </div>

              <div className="cc-form-group">
                <label className="cc-modern-label">Core Lecture Asset (Video / PDF Lecture Note)</label>
                <div className="cc-dropzone-box">
                  <input
                    type="file"
                    accept="video/*,application/pdf"
                    className="cc-hidden-file"
                    id={`material-${chapter.id}`}
                    onChange={(e) => handleChapterFileChange(chapter.id, e.target.files[0])}
                  />
                  <label htmlFor={`material-${chapter.id}`} className="cc-dropzone-trigger">
                    <span className="cc-dropzone-icon">📹</span>
                    <span className="cc-dropzone-text">{chapter.studyMaterial ? (chapter.studyMaterial.name || chapter.studyMaterial) : 'Select video lecture track...'}</span>
                  </label>
                </div>
                {chapter.studyMaterial && typeof chapter.studyMaterial === 'string' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>🎞️ Saved Lecture Video:</span>
                    <video 
                      src={`http://localhost:3000/uploads/${chapter.studyMaterial}`} 
                      width="200" 
                      height="200" 
                      controls 
                      style={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} 
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Gate-Quiz Lock parameters */}
              <div className="cc-gate-quiz-wrapper">
                <div className="cc-gate-quiz-header">
                  <h4 className="cc-gate-quiz-title">🔒 Next-Step Progression Gate Quiz</h4>
                  <span className="cc-quiz-counter-tag">{chapter.quiz.length} Gates Active</span>
                </div>

                {chapter.quiz.length > 0 && (
                  <div className="cc-questions-stack">
                    {chapter.quiz.map((question, qIndex) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        qIndex={qIndex}
                        chapterId={chapter.id}
                        isFinal={false}
                        removeQuestion={removeQuestion}
                        updateQuestion={updateQuestion}
                      />
                    ))}
                  </div>
                )}

                <button type="button" className="cc-action-btn cc-btn-outline-primary" onClick={() => addQuestion(chapter.id)}>
                  + Append Progression Gate Question
                </button>
              </div>
            </div>
          ))}

          <button type="button" className="cc-action-btn cc-btn-add-block" onClick={addChapter}>
            ➕ Add Next Sequential Core Module
          </button>

          {/* Step 4: Terminal Evaluation Matrix */}
          <div className="cc-glass-card cc-glass-card--terminal-exam">
            <div className="cc-glass-card__head">
              <span className="cc-card-icon-wrapper">🎓</span>
              <h2 className="cc-glass-card__title">Terminal Evaluation & Certification Matrix</h2>
            </div>
            <p className="cc-card-meta-desc">This examination becomes unlocked by the system architecture only if all previous gating checkpoints evaluate to positive pass scores.</p>

            {finalQuestions.length > 0 && (
              <div className="cc-questions-stack">
                {finalQuestions.map((question, qIndex) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    qIndex={qIndex}
                    chapterId={null}
                    isFinal={true}
                    removeQuestion={removeQuestion}
                    updateQuestion={updateQuestion}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              className="cc-action-btn cc-btn-outline-primary"
              onClick={() => addQuestion(null, true)}
              disabled={finalQuestions.length >= 15}
            >
              + Append Terminal Exam Question {finalQuestions.length >= 15 ? '(Max Criteria Met)' : `(${finalQuestions.length}/15)`}
            </button>

            <div className="cc-passing-grade-panel">
              <label className="cc-modern-label">Passing Certification Threshold</label>
              <div className="cc-percentage-input-container">
                <input
                  type="number"
                  className="cc-modern-input cc-percentage-field"
                  min="1"
                  max="100"
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(e.target.value)}
                />
                <span className="cc-percentage-symbol">%</span>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="cc-form-actions-bar">
            <button type="button" className="cc-action-btn cc-btn-translucent" onClick={() => navigate('/courses')}>
              Kill Draft
            </button>
            <button type="submit" className="cc-action-btn cc-btn-primary-glow" disabled={loading}>
              {loading ? 'Compiling Parameters...' : isEditMode ? '✏️ Update Course' : '🚀 Launch Automated Track'}
            </button>
          </div>

        </form>

        <div className="cc-build-footer">Fleet Deployment Engine Layer • v2.1 • Locked Architecture</div>
      </div>
    </div>
  );
};

// Moved Outside to prevent focus loss during re-renders
const QuestionCard = ({ question, qIndex, chapterId, isFinal = false, removeQuestion, updateQuestion }) => (
  <div className="cc-question-card">
    <div className="cc-question-card__header">
      <span className="cc-question-card__num">Question {qIndex + 1}</span>
      <button
        type="button"
        className="cc-question-card__remove"
        onClick={() => removeQuestion(chapterId, question.id, isFinal)}
      >
        ✕
      </button>
    </div>

    <input
      type="text"
      className="cc-modern-input"
      placeholder="Type question prompt here..."
      value={question.question}
      required
      onChange={(e) => updateQuestion(chapterId, question.id, 'question', e.target.value, isFinal)}
    />

    <div className="cc-options-grid">
      {question.options.map((option, oIndex) => (
        <div key={oIndex} className="cc-option-item">
          <span className="cc-option-badge">{String.fromCharCode(65 + oIndex)}</span>
          <input
            type="text"
            className="cc-modern-input"
            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
            value={option}
            required
            onChange={(e) => {
              const newOptions = [...question.options];
              newOptions[oIndex] = e.target.value;
              updateQuestion(chapterId, question.id, 'options', newOptions, isFinal);
            }}
          />
        </div>
      ))}
    </div>

    <div className="cc-correct-selector">
      <label className="cc-modern-label">Correct Key Target</label>
      <select
        className="cc-modern-select"
        value={question.correctAnswer}
        onChange={(e) => updateQuestion(chapterId, question.id, 'correctAnswer', e.target.value, isFinal)}
      >
        <option value="A">Option A</option>
        <option value="B">Option B</option>
        <option value="C">Option C</option>
        <option value="D">Option D</option>
      </select>
    </div>
  </div>
);

export default CourseCreate;