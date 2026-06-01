const express = require('express');
const router = express.Router();
const authController = require('../../controller/admin/auth.controller');
const { verifyToken } = require('../../middleware/authMiddleware');
const uploadImage = require('../../middleware/uploadImage');

// Admin Auth Routes
router.post('/login', authController.adminLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Admin Routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, uploadImage.single('profile_pic'), authController.updateProfile);

module.exports = router;
