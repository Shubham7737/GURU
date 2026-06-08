"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';;
import { 
  ChevronLeft, 
  Play, 
  FileText, 
  CheckCircle, 
  Lock, 
  Download, 
  MessageSquare,
  ChevronRight,
  Maximize2,
  Video,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../src/context/AuthContext';
import '../../../../src/styles/CourseLearning.css';

const CourseLearning = () => {
  const { courseId } = useParams();
  const router = useRouter();
  const { isLoggedIn, getAuthHeaders } = useAuth();

  const [chapters, setChapters] = useState([]);
  const [courseTitle, setCourseTitle] = useState('Learning Pathway');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: 'A' }
  
  // Final exam states
  const [showFinalExam, setShowFinalExam] = useState(false);
  const [finalQuestions, setFinalQuestions] = useState([]);
  const [finalSubmitted, setFinalSubmitted] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [finalSelectedAnswers, setFinalSelectedAnswers] = useState({}); // { questionId: 'A' }
  const [finalExamUnlocked, setFinalExamUnlocked] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Chapters and Progress on Mount
  const fetchChaptersAndProgress = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/lms/courses/${courseId}/chapters`, {
        headers: getAuthHeaders()
      });
      const result = await res.json();
      
      if (result.success) {
        setChapters(result.data.chapters);
        setFinalExamUnlocked(result.data.finalExamUnlocked);
        
        // Find course title
        const courseRes = await fetch(`http://localhost:3000/api/v1/courses/${courseId}`);
        const courseData = await courseRes.json();
        if (courseData.success) {
          setCourseTitle(courseData.data.course_title);
        }

        // Set active chapter to first unlocked that is not completed, or just the first
        const firstUnlockedIndex = result.data.chapters.findIndex(ch => !ch.isCompleted && !ch.isLocked);
        if (firstUnlockedIndex !== -1) {
          setActiveChapterIndex(firstUnlockedIndex);
        } else {
          setActiveChapterIndex(0);
        }
      } else {
        setError(result.message || 'Failed to fetch chapters');
      }
    } catch (err) {
      setError('Connection failed. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    fetchChaptersAndProgress();
  }, [courseId, isLoggedIn]);

  const activeChapter = chapters[activeChapterIndex];

  // Calculate completion percentage
  const completedChaptersCount = chapters.filter(c => c.isCompleted).length;
  const progressPercentage = chapters.length > 0 
    ? Math.round((completedChaptersCount / chapters.length) * 100) 
    : 0;

  // Handle Chapter Selection
  const handleSelectChapter = (index) => {
    const chapter = chapters[index];
    if (chapter.isLocked) return;
    setActiveChapterIndex(index);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizResults(null);
    setSelectedAnswers({});
    setShowFinalExam(false);
  };

  // Submit Chapter Quiz
  const handleSubmitQuiz = async () => {
    try {
      const answersPayload = Object.keys(selectedAnswers).map(qid => ({
        quizId: qid,
        selectedOption: selectedAnswers[qid]
      }));

      const res = await fetch(`http://localhost:3000/api/v1/lms/chapters/${activeChapter.id}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ answers: answersPayload })
      });

      const data = await res.json();
      if (data.success) {
        setQuizSubmitted(true);
        setQuizResults(data);
        // Refresh lock statuses
        await fetchChaptersAndProgress();
      } else {
        alert(data.message || 'Error submitting quiz');
      }
    } catch (err) {
      alert('Error connecting to quiz server');
    }
  };

  // Start Final Exam
  const handleStartFinalExam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/v1/lms/courses/${courseId}/final-exam`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setFinalQuestions(data.data);
        setShowFinalExam(true);
        setShowQuiz(false);
      } else {
        alert(data.message || 'Failed to start final exam');
      }
    } catch (err) {
      alert('Error fetching exam questions');
    } finally {
      setLoading(false);
    }
  };

  // Submit Final Exam
  const handleSubmitFinalExam = async () => {
    try {
      const answersPayload = Object.keys(finalSelectedAnswers).map(qid => ({
        questionId: qid,
        selectedOption: finalSelectedAnswers[qid]
      }));

      const res = await fetch(`http://localhost:3000/api/v1/lms/courses/${courseId}/submit-final-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ answers: answersPayload })
      });

      const data = await res.json();
      if (data.success) {
        setFinalSubmitted(true);
        setFinalResults(data);
        await fetchChaptersAndProgress();
      } else {
        alert(data.message || 'Error submitting final exam');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  if (loading) {
    return (
      <div className="learning-loading">
        <div className="spinner"></div>
        <p>Compiling curriculum workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learning-error">
        <h3>Oops! Learning track locked.</h3>
        <p>{error}</p>
        <button onClick={() => router.push('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="learning-layout">
      {/* Top Header */}
      <header className="learning-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => router.push('/dashboard')}><ChevronLeft size={20} /></button>
          <div className="course-title-wrap">
            <h1>{courseTitle}</h1>
            <div className="progress-mini">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <span>{progressPercentage}% Completed</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          {finalExamUnlocked && !showFinalExam && !finalSubmitted && (
            <button className="btn btn-accent btn-sm animate-pulse" onClick={handleStartFinalExam}>
              🎓 Attempt Final Exam
            </button>
          )}
          <button className="btn btn-outline btn-sm" onClick={() => router.push('/dashboard')}>Dashboard</button>
        </div>
      </header>

      <div className="learning-main">
        {/* Main Content Pane (Left) */}
        <div className="video-section">
          {showFinalExam ? (
            <div className="assessment-container">
              {finalSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="exam-result-card"
                >
                  <div className="result-icon-wrapper">
                    {finalResults?.passed ? '🏆' : '❌'}
                  </div>
                  <h2>{finalResults?.passed ? 'Course Completed Successfully!' : 'Exam Unsuccessful'}</h2>
                  <p className="result-metric">
                    Score: <strong>{finalResults?.score}%</strong> (Passing threshold is 40%)
                  </p>
                  
                  {finalResults?.passed ? (
                    <div className="passed-box">
                      <p>Congratulations! You have demonstrated core proficiency in this subject. Your completion certificate has been authorized and issued below.</p>
                      
                      {/* Certificate Generator UI */}
                      <div className="cert-mockup">
                        <div className="cert-border">
                          <div className="cert-body">
                            <span className="cert-seal">🎖️</span>
                            <h3>CERTIFICATE OF ACHIEVEMENT</h3>
                            <span className="cert-subtitle">This honor is proudly presented to</span>
                            <h4>Demo Student</h4>
                            <span className="cert-text">for successfully completing the curriculum requirements for the track</span>
                            <h5>{courseTitle}</h5>
                            <div className="cert-footer">
                              <span>Verified Grade: {finalResults?.score}%</span>
                              <span>Issued: {new Date().toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button className="btn btn-primary btn-icon" onClick={() => window.print()}>
                        <Download size={18} /> Download Verified PDF Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="failed-box">
                      <p>You did not meet the 40% passing percentage. Don't worry! Review the materials and attempt the exam again to claim your certification.</p>
                      <button className="btn btn-outline" onClick={() => {
                        setFinalSubmitted(false);
                        setFinalSelectedAnswers({});
                        handleStartFinalExam();
                      }}>Retry Examination</button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="exam-questions-box">
                  <div className="exam-intro">
                    <h2>🎓 Platform Terminal Certification Examination</h2>
                    <p>Answer the following questions to verify your subject competency. A score of 40% or higher is required for course completion and certificate issue.</p>
                  </div>

                  <div className="questions-scroll">
                    {finalQuestions.map((q, idx) => (
                      <div key={q.id} className="quiz-question-card">
                        <h4>Q{idx + 1}. {q.question}</h4>
                        <div className="options-list">
                          {['A', 'B', 'C', 'D'].map(opt => {
                            const optText = q[`option_${opt.toLowerCase()}`];
                            if (!optText) return null;
                            const isSelected = finalSelectedAnswers[q.id] === opt;
                            return (
                              <button 
                                key={opt}
                                className={`option-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => setFinalSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                              >
                                <span className="opt-letter">{opt}</span>
                                <span className="opt-text">{optText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="exam-submit-bar">
                    <span>{Object.keys(finalSelectedAnswers).length} of {finalQuestions.length} Answered</span>
                    <button 
                      className="btn btn-primary"
                      disabled={Object.keys(finalSelectedAnswers).length < finalQuestions.length}
                      onClick={handleSubmitFinalExam}
                    >
                      Submit Terminal Answers
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : showQuiz ? (
            // Quiz Attempt Interface
            <div className="assessment-container">
              {quizSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="quiz-results-summary"
                >
                  <span className="summary-emoji">{quizResults?.passed ? '🎉' : '✍️'}</span>
                  <h3>{quizResults?.passed ? 'Progression Gate Cleared!' : 'Quiz Attempt Failed'}</h3>
                  <p>You scored <strong>{quizResults?.score}%</strong>. The system requires a minimum threshold of 40% to unlock the next curricular sequence.</p>
                  
                  {quizResults?.passed ? (
                    <button className="btn btn-primary" onClick={async () => {
                      await fetchChaptersAndProgress();
                      setShowQuiz(false);
                    }}>
                      Continue Learning Track <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button className="btn btn-outline" onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    }}>Try Quiz Again</button>
                  )}
                </motion.div>
              ) : (
                <div className="quiz-questions-box">
                  <div className="exam-intro">
                    <h2>🔒 Chapter progression Gate Quiz</h2>
                    <p>Review and pass this short assessment to unlock subsequent learning modules.</p>
                  </div>

                  {activeChapter?.quiz && activeChapter.quiz.length > 0 ? (
                    <div className="quiz-scroll">
                      {activeChapter.quiz.map((q, idx) => (
                        <div key={q.id || idx} className="quiz-question-card">
                          <h4>Q{idx + 1}. {q.question}</h4>
                          <div className="options-list">
                            {['A', 'B', 'C', 'D'].map(opt => {
                              // Options is array in mapped chapter quiz format
                              const optText = q.options ? q.options[['A', 'B', 'C', 'D'].indexOf(opt)] : '';
                              if (!optText) return null;
                              const isSelected = selectedAnswers[q.id || idx] === opt;
                              return (
                                <button 
                                  key={opt}
                                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id || idx]: opt }))}
                                >
                                  <span className="opt-letter">{opt}</span>
                                  <span className="opt-text">{optText}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div className="exam-submit-bar" style={{ marginTop: '2rem' }}>
                        <span>{Object.keys(selectedAnswers).length} of {activeChapter.quiz.length} Answered</span>
                        <button 
                          className="btn btn-primary"
                          disabled={Object.keys(selectedAnswers).length < activeChapter.quiz.length}
                          onClick={handleSubmitQuiz}
                        >
                          Submit Quiz Answers
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-quiz">
                      <p>No questions configured for this gate. Press below to unlock next unit instantly.</p>
                      <button className="btn btn-primary" onClick={handleSubmitQuiz}>Clear Progression Lock</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Video Player screen
            <div className="video-player-container-main">
              {activeChapter?.video_url ? (
                <video 
                  key={activeChapter.id} 
                  controls 
                  className="main-lecture-video"
                  src={`http://localhost:3000/uploads/${activeChapter.video_url}`}
                  poster="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
                />
              ) : (
                <div className="video-placeholder">
                  <div className="play-overlay">
                    <Video size={64} color="var(--primary)" />
                  </div>
                  <div className="placeholder-info">
                    <h3>No Lecture Video Uploaded</h3>
                    <p>The instructor has not uploaded a media track for this chapter yet. You can still test your knowledge via the gate quiz!</p>
                  </div>
                </div>
              )}

              <div className="lecture-details">
                <div className="lecture-title-bar">
                  <h2>Chapter {activeChapter?.chapter_no}: {activeChapter?.chapter_title}</h2>
                  {!activeChapter?.isCompleted && (
                    <button className="btn btn-primary btn-sm" onClick={() => setShowQuiz(true)}>
                      ✍️ Attempt Gate Quiz
                    </button>
                  )}
                  {activeChapter?.isCompleted && (
                    <span className="badge-completed">✓ Cleared & Completed</span>
                  )}
                </div>
                <p className="lecture-description-text">{activeChapter?.chapter_description || 'No additional syllabus description provided for this chapter.'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Course Sidebar Chapters list (Right) */}
        <aside className={`curriculum-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="curriculum-header">
            <h3>Curriculum Syllabus</h3>
            <button className="close-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <ChevronRight /> : <ChevronLeft />}
            </button>
          </div>
          <div className="sections-list">
            <div className="curriculum-section">
              <div className="lectures-list">
                {chapters.map((ch, idx) => (
                  <button 
                    key={ch.id} 
                    className={`lecture-item ${activeChapterIndex === idx && !showFinalExam ? 'active' : ''} ${ch.isLocked ? 'locked' : ''}`}
                    onClick={() => handleSelectChapter(idx)}
                    disabled={ch.isLocked}
                  >
                    <div className="l-status">
                      {ch.isCompleted ? (
                        <CheckCircle size={18} color="var(--success)" fill="#D1FAE5" />
                      ) : ch.isLocked ? (
                        <Lock size={18} color="#9ca3af" />
                      ) : (
                        <Play size={18} />
                      )}
                    </div>
                    <div className="l-info">
                      <span className="l-title">{ch.chapter_no}. {ch.chapter_title}</span>
                      <span className="l-meta">
                        <Video size={12} style={{ marginRight: '4px' }} />
                        {ch.video_url ? 'Lecture Reel' : 'Objectives Only'}
                      </span>
                    </div>
                  </button>
                ))}

                {/* Final exam locked/unlocked drawer item */}
                <button 
                  className={`lecture-item final-exam-row ${showFinalExam ? 'active' : ''} ${!finalExamUnlocked ? 'locked' : ''}`}
                  onClick={handleStartFinalExam}
                  disabled={!finalExamUnlocked}
                  style={{ marginTop: '2rem', border: '1px dashed var(--primary)', borderRadius: '8px' }}
                >
                  <div className="l-status">
                    {finalSubmitted && finalResults?.passed ? (
                      <CheckCircle size={18} color="var(--success)" fill="#D1FAE5" />
                    ) : !finalExamUnlocked ? (
                      <Lock size={18} />
                    ) : (
                      <Award size={18} color="var(--primary)" />
                    )}
                  </div>
                  <div className="l-info">
                    <span className="l-title" style={{ fontWeight: 'bold' }}>🎓 Terminal Exam & Cert</span>
                    <span className="l-meta">
                      {finalSubmitted ? `Score: ${finalResults?.score}%` : 'Final certification criteria'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseLearning;
