const express = require("express");
const router = express.Router();
const lmsController = require("../../controller/user/lms.controller");
const { verifyToken } = require("../../middleware/authMiddleware");

// Retrieve chapters and progression gate locks
router.get("/courses/:courseId/chapters", verifyToken, lmsController.getCourseChapters);

// Submit a progression quiz
router.post("/chapters/:chapterId/submit-quiz", verifyToken, lmsController.submitQuiz);

// Retrieve terminal exam questions
router.get("/courses/:courseId/final-exam", verifyToken, lmsController.getFinalExam);

// Submit final exam answers
router.post("/courses/:courseId/submit-final-exam", verifyToken, lmsController.submitFinalExam);

// Get direct student progress
router.get("/courses/:courseId/progress", verifyToken, lmsController.getStudentProgress);

// Save progress state manually
router.post("/courses/:courseId/progress", verifyToken, lmsController.saveProgress);

module.exports = router;
