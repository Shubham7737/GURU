const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'guru_edu_secret_key_2024', { expiresIn });
};

// Generate Refresh Token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'guru_edu_refresh_secret_2024', { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

// Decode token without verification
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
};

// Hash token
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate token hash for database storage
const generateTokenHash = (token) => {
  return hashToken(token);
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  generateOTP,
  hashToken,
  generateTokenHash,
};
