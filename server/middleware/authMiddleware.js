const { verifyToken } = require('../utils/jwt');
require('dotenv').config();

// Verify JWT Token
const verifyTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.',
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    const decoded = verifyToken(token);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

// Check if user is Admin
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
    });
  }
};

// Check if user is Student
const isStudent = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student privileges required.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
    });
  }
};

// Check if user is Student or Instructor
const isUser = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'student' && req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User privileges required.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
    });
  }
};

// Optional token (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;
      
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
        req.token = token;
      } catch (error) {
        // Token invalid but optional, so continue
        req.user = null;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  verifyTokenMiddleware,
  isAdmin,
  isStudent,
  isUser,
  optionalAuth,
  verifyToken: verifyTokenMiddleware, // For backward compatibility
};
