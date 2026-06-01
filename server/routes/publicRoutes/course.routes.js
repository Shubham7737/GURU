const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

// GET PUBLIC COURSES
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT c.id, c.course_title, c.course_duration, c.course_description, c.passing_percentage,
             c.status, c.intro_video, c.course_image,
             cl.class_name, 
             COALESCE(c.selected_subject, s.subject_name) AS subject_name, 
             m.name AS membership_name, m.price AS membership_price
      FROM tbl_courses c
      LEFT JOIN tbl_class cl ON c.class_id = cl.id
      LEFT JOIN tbl_subject s ON c.subject_id = s.id
      LEFT JOIN tbl_membership m ON c.membership_id = m.id
      WHERE c.status = 'active'
      ORDER BY c.createdAt DESC
    `;
    const [rows] = await pool.query(sql);

    const mappedRows = rows.map(row => {
      return {
        id: row.id,
        course_title: row.course_title,
        course_duration: row.course_duration,
        course_description: row.course_description,
        status: row.status,
        intro_video: row.intro_video,
        course_image: row.course_image,
        class_name: row.class_name,
        subject_name: row.subject_name,
        membership_name: row.membership_name,
        price: row.membership_price || 0
      };
    });

    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: mappedRows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
