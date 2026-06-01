const pool = require("../../config/db");

// GET ALL COURSES
exports.getAllData = async (req, res) => {
  try {
    const sql = `
      SELECT c.*, 
             cl.class_name, 
             COALESCE(c.selected_subject, s.subject_name) AS subject_name, 
             m.name AS membership_name, m.price AS membership_price
      FROM tbl_courses c
      LEFT JOIN tbl_class cl ON c.class_id = cl.id
      LEFT JOIN tbl_subject s ON c.subject_id = s.id
      LEFT JOIN tbl_membership m ON c.membership_id = m.id
      ORDER BY c.createdAt DESC
    `;

    const [rows] = await pool.query(sql);

    const mappedRows = rows.map(row => {
      let parsedChapters = [];
      let parsedFinalExam = {};
      try {
        parsedChapters = row.chapters ? JSON.parse(row.chapters) : [];
      } catch (e) {
        parsedChapters = [];
      }
      try {
        parsedFinalExam = row.final_exam ? JSON.parse(row.final_exam) : {};
      } catch (e) {
        parsedFinalExam = {};
      }

      return {
        ...row,
        name: row.membership_name, // frontend dropdown compatibility
        price: row.membership_price,
        parsedChapters,
        parsedFinalExam
      };
    });

    return res.status(200).json({
      success: true,
      data: mappedRows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE COURSE
exports.getSingleData = async (req, res) => {
  try {
    const { id } = req.params;

    const courseSql = `
      SELECT c.*, 
             cl.class_name, 
             COALESCE(c.selected_subject, s.subject_name) AS subject_name, 
             m.name AS membership_name, m.price AS membership_price
      FROM tbl_courses c
      LEFT JOIN tbl_class cl ON c.class_id = cl.id
      LEFT JOIN tbl_subject s ON c.subject_id = s.id
      LEFT JOIN tbl_membership m ON c.membership_id = m.id
      WHERE c.id = $1
    `;

    const courseId = parseInt(id, 10);
    const [courses] = await pool.query(courseSql, [courseId]);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const course = courses[0];
    
    let parsedChapters = [];
    let parsedFinalExam = {};
    try {
      parsedChapters = course.chapters ? JSON.parse(course.chapters) : [];
    } catch (e) {
      parsedChapters = [];
    }
    try {
      parsedFinalExam = course.final_exam ? JSON.parse(course.final_exam) : {};
    } catch (e) {
      parsedFinalExam = {};
    }

    const responseData = {
      ...course,
      name: course.membership_name, // for frontend dropdown compatibility
      price: course.membership_price,
      parsedChapters,
      parsedFinalExam
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE COURSE
exports.createData = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      course_title, 
      class_id, 
      subject_id, 
      membership_id, 
      course_duration, 
      course_description,
      chapters,
      final_exam,
      passing_percentage,
      status,
      intro_video,
      course_image,
      subject // Specific chosen subject string, e.g. "C language"
    } = req.body;

    if (!course_title) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Course title is required",
      });
    }

    // Smart parsing of duration
    let parsedDuration = 3;
    if (course_duration) {
      parsedDuration = parseInt(String(course_duration).replace(/\D/g, '')) || 3;
    } else if (req.body.duration) {
      parsedDuration = parseInt(String(req.body.duration).replace(/\D/g, '')) || 6;
    }

    // Resolve class_id, subject_id, membership_id
    let parsedClassId = class_id || null;
    let parsedSubjectId = subject_id || null;
    let parsedMembershipId = membership_id || null;

    if (req.body.class && !parsedClassId) {
      const [classRows] = await connection.query("SELECT id FROM tbl_class WHERE class_name = $1", [req.body.class]);
      if (classRows.length > 0) parsedClassId = classRows[0].id;
    }
    if (req.body.subject && !parsedSubjectId) {
      const [subjRows] = await connection.query("SELECT id FROM tbl_subject WHERE subject_name LIKE $1", [`%${req.body.subject}%`]);
      if (subjRows.length > 0) parsedSubjectId = subjRows[0].id;
    }

    // Parse chapters
    let chaptersParsed = [];
    if (chapters) {
      chaptersParsed = typeof chapters === 'string' ? JSON.parse(chapters) : chapters;
    }

    // Resolve Teaser, Course Image & Chapter file uploads
    let introVideoFilename = null;
    let courseImageFilename = null;
    if (req.files) {
      req.files.forEach(file => {
        if (file.fieldname === 'intro_video') {
          introVideoFilename = file.filename;
        } else if (file.fieldname === 'course_image') {
          courseImageFilename = file.filename;
        } else if (file.fieldname.startsWith('chapter_file_')) {
          const index = parseInt(file.fieldname.replace('chapter_file_', ''));
          if (chaptersParsed[index]) {
            chaptersParsed[index].studyMaterial = file.filename;
          }
        }
      });
    }

    if (!introVideoFilename) {
      introVideoFilename = intro_video || req.body.intro_video || null;
    }
    if (!courseImageFilename) {
      courseImageFilename = course_image || req.body.course_image || null;
    }

    // Clean up parsed chapters
    chaptersParsed = chaptersParsed.map((ch, idx) => {
      const resolvedVideo = ch.studyMaterial || ch.video || ch.video_url || null;
      return {
        chapter_no: ch.chapter_no || (idx + 1),
        chapter_title: ch.chapter_title || ch.title || `Chapter ${idx + 1}`,
        chapter_description: ch.chapter_description || ch.description || null,
        video: resolvedVideo,
        video_url: resolvedVideo,
        studyMaterial: resolvedVideo,
        is_free: ch.is_free ? 1 : 0,
        quiz: ch.quiz || ch.quizzes || []
      };
    });

    // Resolve Final Exam payload
    let finalExamObj = {};
    if (final_exam) {
      finalExamObj = typeof final_exam === 'string' ? JSON.parse(final_exam) : final_exam;
    } else if (req.body.final_exam) {
      finalExamObj = req.body.final_exam;
    }

    const parsedStatus = (status === 'inactive' || req.body.status === 'inactive') ? 'inactive' : 'active';
    const finalPassingPct = finalExamObj.passing_percentage || passing_percentage || 40;

    // 1. Insert into tbl_courses (with selected_subject support)
    const courseSql = `
      INSERT INTO tbl_courses 
      (course_title, class_id, subject_id, membership_id, course_duration, intro_video, course_image,
       course_description, passing_percentage, status, chapters, final_exam, selected_subject)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id
    `;

    const [courseResult] = await connection.query(courseSql, [
      course_title,
      parsedClassId,
      parsedSubjectId,
      parsedMembershipId,
      parsedDuration,
      introVideoFilename,
      courseImageFilename,
      course_description || req.body.description || null,
      finalPassingPct,
      parsedStatus,
      JSON.stringify(chaptersParsed),
      JSON.stringify(finalExamObj),
      subject || req.body.subject || null
    ]);

    const courseId = courseResult[0]?.id || courseResult.insertId;

    // 2. Sync to Normalized Tables
    for (const ch of chaptersParsed) {
      const chapterSql = `
        INSERT INTO tbl_course_chapters 
        (course_id, chapter_no, chapter_title, chapter_description, video_url, is_free)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `;
      const [chapterResult] = await connection.query(chapterSql, [
        courseId,
        ch.chapter_no,
        ch.chapter_title,
        ch.chapter_description,
        ch.video_url,
        ch.is_free
      ]);

      const chapterId = chapterResult[0]?.id || chapterResult.insertId;

      const quizList = ch.quiz || [];
      for (const quiz of quizList) {
        const qSql = `
          INSERT INTO tbl_chapter_quiz 
          (chapter_id, question, option_a, option_b, option_c, option_d, correct_answer)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        let optA = '', optB = '', optC = '', optD = '';
        if (quiz.options) {
          if (Array.isArray(quiz.options)) {
            optA = quiz.options[0] || '';
            optB = quiz.options[1] || '';
            optC = quiz.options[2] || '';
            optD = quiz.options[3] || '';
          } else if (typeof quiz.options === 'object') {
            optA = quiz.options.A || quiz.options.a || '';
            optB = quiz.options.B || quiz.options.b || '';
            optC = quiz.options.C || quiz.options.c || '';
            optD = quiz.options.D || quiz.options.d || '';
          }
        }

        await connection.query(qSql, [
          chapterId,
          quiz.question,
          optA,
          optB,
          optC,
          optD,
          quiz.correct_answer || quiz.correctAnswer || 'A'
        ]);
      }
    }

    // Sync final exam questions
    const finalQuestions = finalExamObj.questions || [];
    for (const q of finalQuestions) {
      const feSql = `
        INSERT INTO tbl_final_exam 
        (course_id, question, option_a, option_b, option_c, option_d, correct_answer)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      let optA = '', optB = '', optC = '', optD = '';
      if (q.options) {
        if (Array.isArray(q.options)) {
          optA = q.options[0] || '';
          optB = q.options[1] || '';
          optC = q.options[2] || '';
          optD = q.options[3] || '';
        } else if (typeof q.options === 'object') {
          optA = q.options.A || q.options.a || '';
          optB = q.options.B || q.options.b || '';
          optC = q.options.C || q.options.c || '';
          optD = q.options.D || q.options.d || '';
        }
      }

      await connection.query(feSql, [
        courseId,
        q.question,
        optA,
        optB,
        optC,
        optD,
        q.correct_answer || q.correctAnswer || 'A'
      ]);
    }

    await connection.commit();
    return res.status(201).json({
      success: true,
      message: "Course created successfully directly in tbl_courses and synced across tables",
      insertId: courseId,
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

// UPDATE COURSE
exports.update = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { 
      course_title, 
      class_id, 
      subject_id, 
      membership_id, 
      course_duration, 
      course_description,
      chapters,
      final_exam,
      passing_percentage,
      status,
      intro_video,
      course_image,
      subject // Chosen subject string
    } = req.body;

    const courseId = parseInt(id, 10);
    const [existing] = await connection.query(
      "SELECT intro_video, chapters, final_exam FROM tbl_courses WHERE id = $1",
      [courseId]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let parsedDuration = 3;
    if (course_duration) {
      parsedDuration = parseInt(String(course_duration).replace(/\D/g, '')) || 3;
    } else if (req.body.duration) {
      parsedDuration = parseInt(String(req.body.duration).replace(/\D/g, '')) || 6;
    }

    let parsedClassId = class_id || null;
    let parsedSubjectId = subject_id || null;
    let parsedMembershipId = membership_id || null;

    if (req.body.class && !parsedClassId) {
      const [classRows] = await connection.query("SELECT id FROM tbl_class WHERE class_name = $1", [req.body.class]);
      if (classRows.length > 0) parsedClassId = classRows[0].id;
    }
    if (req.body.subject && !parsedSubjectId) {
      const [subjRows] = await connection.query("SELECT id FROM tbl_subject WHERE subject_name LIKE $1", [`%${req.body.subject}%`]);
      if (subjRows.length > 0) parsedSubjectId = subjRows[0].id;
    }

    let chaptersParsed = [];
    if (chapters) {
      chaptersParsed = typeof chapters === 'string' ? JSON.parse(chapters) : chapters;
    }

    let introVideoFilename = existing[0].intro_video;
    let courseImageFilename = existing[0].course_image;
    if (req.files) {
      req.files.forEach(file => {
        if (file.fieldname === 'intro_video') {
          introVideoFilename = file.filename;
        } else if (file.fieldname === 'course_image') {
          courseImageFilename = file.filename;
        } else if (file.fieldname.startsWith('chapter_file_')) {
          const index = parseInt(file.fieldname.replace('chapter_file_', ''));
          if (chaptersParsed[index]) {
            chaptersParsed[index].studyMaterial = file.filename;
          }
        }
      });
    }

    if (!introVideoFilename) {
      introVideoFilename = intro_video || req.body.intro_video || existing[0].intro_video || null;
    }
    if (!courseImageFilename) {
      courseImageFilename = course_image || req.body.course_image || existing[0].course_image || null;
    }

    // Clean up parsed chapters
    chaptersParsed = chaptersParsed.map((ch, idx) => {
      const resolvedVideo = ch.studyMaterial || ch.video || ch.video_url || null;
      return {
        chapter_no: ch.chapter_no || (idx + 1),
        chapter_title: ch.chapter_title || ch.title || `Chapter ${idx + 1}`,
        chapter_description: ch.chapter_description || ch.description || null,
        video: resolvedVideo,
        video_url: resolvedVideo,
        studyMaterial: resolvedVideo,
        is_free: ch.is_free ? 1 : 0,
        quiz: ch.quiz || ch.quizzes || []
      };
    });

    let finalExamObj = {};
    if (final_exam) {
      finalExamObj = typeof final_exam === 'string' ? JSON.parse(final_exam) : final_exam;
    } else if (req.body.final_exam) {
      finalExamObj = req.body.final_exam;
    }

    const parsedStatus = (status === 'inactive' || req.body.status === 'inactive') ? 'inactive' : 'active';
    const finalPassingPct = finalExamObj.passing_percentage || passing_percentage || 40;

    // 1. Update tbl_courses (with selected_subject support)
    const courseSql = `
      UPDATE tbl_courses 
      SET course_title = $1, class_id = $2, subject_id = $3, membership_id = $4, 
          course_duration = $5, intro_video = $6, course_image = $7, course_description = $8, 
          passing_percentage = $9, status = $10, chapters = $11, final_exam = $12,
          selected_subject = $13
      WHERE id = $14
    `;

    await connection.query(courseSql, [
      course_title,
      parsedClassId,
      parsedSubjectId,
      parsedMembershipId,
      parsedDuration,
      introVideoFilename,
      courseImageFilename,
      course_description || req.body.description || null,
      finalPassingPct,
      parsedStatus,
      JSON.stringify(chaptersParsed),
      JSON.stringify(finalExamObj),
      subject || req.body.subject || null,
      courseId
    ]);

    // 2. Sync to Normalized Tables
    await connection.query("DELETE FROM tbl_course_chapters WHERE course_id = $1", [courseId]);
    await connection.query("DELETE FROM tbl_final_exam WHERE course_id = $1", [courseId]);

    for (const ch of chaptersParsed) {
      const chapterSql = `
        INSERT INTO tbl_course_chapters 
        (course_id, chapter_no, chapter_title, chapter_description, video_url, is_free)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `;
      const [chapterResult] = await connection.query(chapterSql, [
        courseId,
        ch.chapter_no,
        ch.chapter_title,
        ch.chapter_description,
        ch.video_url,
        ch.is_free
      ]);

      const chapterId = chapterResult[0]?.id || chapterResult.insertId;

      const quizList = ch.quiz || [];
      for (const quiz of quizList) {
        const qSql = `
          INSERT INTO tbl_chapter_quiz 
          (chapter_id, question, option_a, option_b, option_c, option_d, correct_answer)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        let optA = '', optB = '', optC = '', optD = '';
        if (quiz.options) {
          if (Array.isArray(quiz.options)) {
            optA = quiz.options[0] || '';
            optB = quiz.options[1] || '';
            optC = quiz.options[2] || '';
            optD = quiz.options[3] || '';
          } else if (typeof quiz.options === 'object') {
            optA = quiz.options.A || quiz.options.a || '';
            optB = quiz.options.B || quiz.options.b || '';
            optC = quiz.options.C || quiz.options.c || '';
            optD = quiz.options.D || quiz.options.d || '';
          }
        }

        await connection.query(qSql, [
          chapterId,
          quiz.question,
          optA,
          optB,
          optC,
          optD,
          quiz.correct_answer || quiz.correctAnswer || 'A'
        ]);
      }
    }

    const finalQuestions = finalExamObj.questions || [];
    for (const q of finalQuestions) {
      const feSql = `
        INSERT INTO tbl_final_exam 
        (course_id, question, option_a, option_b, option_c, option_d, correct_answer)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      let optA = '', optB = '', optC = '', optD = '';
      if (q.options) {
        if (Array.isArray(q.options)) {
          optA = q.options[0] || '';
          optB = q.options[1] || '';
          optC = q.options[2] || '';
          optD = q.options[3] || '';
        } else if (typeof q.options === 'object') {
          optA = q.options.A || q.options.a || '';
          optB = q.options.B || q.options.b || '';
          optC = q.options.C || q.options.c || '';
          optD = q.options.D || q.options.d || '';
        }
      }

      await connection.query(feSql, [
        courseId,
        q.question,
        optA,
        optB,
        optC,
        optD,
        q.correct_answer || q.correctAnswer || 'A'
      ]);
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "Course updated successfully in tbl_courses and synced across tables",
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

// DELETE COURSE
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const courseId = parseInt(id, 10);
    const sql = "DELETE FROM tbl_courses WHERE id = $1";
    const [result] = await pool.query(sql, [courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
