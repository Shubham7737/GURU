const pool = require("../../config/db");

// ------------------- CHAPTER APIs -------------------

// GET ALL CHAPTERS FOR A COURSE WITH UNLOCKED/LOCKED STATUS FOR A STUDENT
exports.getCourseChapters = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; // From verified token

    // 1. Fetch course to verify existence
    const [courses] = await pool.query("SELECT id FROM tbl_courses WHERE id = ?", [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Fetch all chapters for the course
    const [chapters] = await pool.query(
      "SELECT * FROM tbl_course_chapters WHERE course_id = ? ORDER BY chapter_no ASC",
      [courseId]
    );

    // 3. Fetch student progress
    let [progress] = await pool.query(
      "SELECT * FROM tbl_student_course_progress WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    // If no progress, initialize progress for the student
    if (progress.length === 0) {
      const [insertResult] = await pool.query(
        "INSERT INTO tbl_student_course_progress (user_id, course_id, current_chapter, completed, final_exam_passed) VALUES (?, ?, 1, 0, 0)",
        [userId, courseId]
      );
      progress = [{
        id: insertResult.insertId,
        user_id: userId,
        course_id: courseId,
        current_chapter: 1,
        completed: 0,
        final_exam_passed: 0,
        score: 0
      }];
    }

    const currentProgress = progress[0];

    // 4. Fetch all completed chapters
    const [completions] = await pool.query(
      "SELECT chapter_id, quiz_passed FROM tbl_chapter_completion WHERE user_id = ?",
      [userId]
    );
    const completedSet = new Set(completions.map(c => c.chapter_id));

    // 5. Annotate chapters with isLocked and isCompleted
    const annotatedChapters = chapters.map(ch => {
      // Unlocked if its chapter number is less than or equal to current unlocked chapter progress
      const isLocked = ch.chapter_no > currentProgress.current_chapter;
      const isCompleted = completedSet.has(ch.id);

      return {
        ...ch,
        isLocked,
        isCompleted,
        studyMaterial: ch.video_url // Frontend compat
      };
    });

    // 6. Check if final exam is unlocked (all chapters completed)
    const allCompleted = annotatedChapters.length > 0 && annotatedChapters.every(ch => ch.isCompleted);

    return res.status(200).json({
      success: true,
      data: {
        chapters: annotatedChapters,
        progress: currentProgress,
        finalExamUnlocked: allCompleted
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- QUIZ APIs -------------------

// SUBMIT QUIZ
exports.submitQuiz = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { chapterId } = req.params;
    const { answers } = req.body; // Array of { quizId, selectedOption } (e.g. 'A', 'B')
    const userId = req.user.id;

    // 1. Fetch chapter details
    const [chapters] = await connection.query(
      "SELECT id, course_id, chapter_no FROM tbl_course_chapters WHERE id = ?",
      [chapterId]
    );
    if (chapters.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }
    const chapter = chapters[0];

    // 2. Fetch all quiz questions for this chapter
    const [questions] = await connection.query(
      "SELECT id, correct_answer FROM tbl_chapter_quiz WHERE chapter_id = ?",
      [chapterId]
    );

    if (questions.length === 0) {
      // If no questions, automatically pass
      await connection.query(
        "INSERT INTO tbl_chapter_completion (user_id, chapter_id, quiz_passed) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quiz_passed = 1",
        [userId, chapterId]
      );
      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "No quiz required for this chapter. Unlocked next!",
        passed: true,
        score: 100
      });
    }

    // 3. Evaluate answers
    let correctCount = 0;
    const results = questions.map(q => {
      const submitted = answers ? answers.find(ans => Number(ans.quizId) === Number(q.id)) : null;
      const selected = submitted ? submitted.selectedOption : null;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;
      return {
        quizId: q.id,
        correctAnswer: q.correct_answer,
        selected,
        isCorrect
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= 40; // Passing score is 40%

    // 4. If passed, record completion and update student progress
    if (passed) {
      // Mark as completed
      await connection.query(
        "INSERT INTO tbl_chapter_completion (user_id, chapter_id, quiz_passed) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quiz_passed = 1",
        [userId, chapterId]
      );

      // Check current student progress
      const [progressRows] = await connection.query(
        "SELECT * FROM tbl_student_course_progress WHERE user_id = ? AND course_id = ?",
        [userId, chapter.course_id]
      );

      if (progressRows.length > 0) {
        const currentProgress = progressRows[0];
        
        // Only increment current_chapter if they completed their current active chapter
        if (chapter.chapter_no === currentProgress.current_chapter) {
          // Check if there is a next chapter
          const [nextChapter] = await connection.query(
            "SELECT id FROM tbl_course_chapters WHERE course_id = ? AND chapter_no = ?",
            [chapter.course_id, chapter.chapter_no + 1]
          );

          if (nextChapter.length > 0) {
            // Unlock next chapter
            await connection.query(
              "UPDATE tbl_student_course_progress SET current_chapter = ? WHERE id = ?",
              [chapter.chapter_no + 1, currentProgress.id]
            );
          } else {
            // Course chapters all finished, unlock terminal exam
            await connection.query(
              "UPDATE tbl_student_course_progress SET completed = 1 WHERE id = ?",
              [currentProgress.id]
            );
          }
        }
      }
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      passed,
      score: scorePercentage,
      correctCount,
      totalQuestions: questions.length,
      results
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// ------------------- FINAL EXAM APIs -------------------

// GET FINAL EXAM QUESTIONS
exports.getFinalExam = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Verify all chapters completed
    const [chapters] = await pool.query(
      "SELECT id FROM tbl_course_chapters WHERE course_id = ?",
      [courseId]
    );

    const [completions] = await pool.query(
      "SELECT cc.id FROM tbl_chapter_completion cc " +
      "JOIN tbl_course_chapters ch ON cc.chapter_id = ch.id " +
      "WHERE cc.user_id = ? AND ch.course_id = ?",
      [userId, courseId]
    );

    if (chapters.length > 0 && completions.length < chapters.length) {
      return res.status(403).json({
        success: false,
        message: "Final exam is locked. You must complete all chapter quizzes first!"
      });
    }

    const [questions] = await pool.query(
      "SELECT id, question, option_a, option_b, option_c, option_d FROM tbl_final_exam WHERE course_id = ?",
      [courseId]
    );

    return res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SUBMIT FINAL EXAM
exports.submitFinalExam = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOption }
    const userId = req.user.id;

    // 1. Fetch passing percentage
    const [courses] = await pool.query(
      "SELECT passing_percentage FROM tbl_courses WHERE id = ?",
      [courseId]
    );
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const passingPct = courses[0].passing_percentage || 40;

    // 2. Fetch correct answers
    const [questions] = await pool.query(
      "SELECT id, correct_answer FROM tbl_final_exam WHERE course_id = ?",
      [courseId]
    );

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No final exam questions found for this course."
      });
    }

    // 3. Evaluate score
    let correctCount = 0;
    const results = questions.map(q => {
      const submitted = answers ? answers.find(ans => Number(ans.questionId) === Number(q.id)) : null;
      const selected = submitted ? submitted.selectedOption : null;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        correctAnswer: q.correct_answer,
        selected,
        isCorrect
      };
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= passingPct;

    // 4. Update student progress
    await pool.query(
      "UPDATE tbl_student_course_progress SET final_exam_passed = ?, score = ? WHERE user_id = ? AND course_id = ?",
      [passed ? 1 : 0, scorePercentage, userId, courseId]
    );

    return res.status(200).json({
      success: true,
      passed,
      score: scorePercentage,
      correctCount,
      totalQuestions: questions.length,
      certificateEligible: passed,
      results
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------- PROGRESS APIs -------------------

// SAVE/UPDATE STUDENT PROGRESS
exports.saveProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { currentChapter, completed } = req.body;
    const userId = req.user.id;

    await pool.query(
      "INSERT INTO tbl_student_course_progress (user_id, course_id, current_chapter, completed) VALUES (?, ?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE current_chapter = VALUES(current_chapter), completed = VALUES(completed)",
      [userId, courseId, currentChapter || 1, completed ? 1 : 0]
    );

    return res.status(200).json({
      success: true,
      message: "Progress saved successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET STUDENT PROGRESS
exports.getStudentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT * FROM tbl_student_course_progress WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          current_chapter: 1,
          completed: 0,
          final_exam_passed: 0,
          score: 0
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
