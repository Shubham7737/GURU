const express = require("express");
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');

const membershipLegacyRoutes = require('./adminRoutes/membership.routes');
const classRoutes = require('./adminRoutes/class.routes');
const subjectRoutes = require('./adminRoutes/subject.routes');
const courseRoutes = require('./adminRoutes/course.routes');
const adminAuthRoutes = require('./adminRoutes/auth.routes');
const clientAdminRoutes = require('./adminRoutes/clients.routes');

// Public Routes
const publicCourseRoutes = require('./publicRoutes/course.routes');

// Student Routes
const studentAuthRoutes = require('./userRoutes/auth.routes');
const studentLmsRoutes = require('./userRoutes/lms.routes');

// ==================== Admin Routes ====================
// Admin Auth
router.use('/admin/auth', adminAuthRoutes);                                         // -> /api/v1/admin/auth

// member-ship
router.use('/membership', verifyToken, membershipLegacyRoutes);                      //->   /api/v1/membership

// add-class
router.use('/add-class', verifyToken, classRoutes);                                 //->   /api/v1/add-class

// subject
router.use('/add-subject', verifyToken, subjectRoutes);                             // -> /api/v1/add-subject

// courses
router.use('/courses', verifyToken, courseRoutes);                                  // -> /api/v1/courses

// clients
router.use('/clients', verifyToken, clientAdminRoutes);                                  // -> /api/v1/clients

// ==================== Public Routes ====================
// Public courses for landing page
router.use('/public/courses', publicCourseRoutes);                                      // -> /api/v1/public/courses

// Expose Google Client ID for frontend (reads from server .env)
router.get('/public/google-client-id', (req, res) => {
	// Support both GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_ID if set in .env
	const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
	return res.json({ success: true, clientId });
});

// ==================== Student Routes ====================
// Auth APIs
router.use('/auth', studentAuthRoutes);                                 // -> /api/v1/auth

// LMS Progression APIs
router.use('/lms', studentLmsRoutes);                                   // -> /api/v1/lms

module.exports = router;
