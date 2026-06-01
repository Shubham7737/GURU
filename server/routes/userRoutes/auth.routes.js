const express = require("express");
const router = express.Router();
const authController = require("../../controller/user/auth.controller");
const { verifyToken } = require("../../middleware/authMiddleware");

// Register a new student
router.post("/register", authController.register);

// Student login
router.post("/login", authController.login);

// Google OAuth sign-in (id_token)
router.post('/google', authController.googleAuth);


// Student logout (requires valid token)
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
