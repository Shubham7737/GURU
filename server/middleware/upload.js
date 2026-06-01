const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads folder if it doesn't exist
const uploadsFolder = './uploads';
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    // Keep original file extension
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter (videos, PDFs, and images)
const fileFilter = (req, file, cb) => {
  const allowedExts = /^\.(mp4|avi|mov|wmv|mkv|pdf|jpg|jpeg|png|gif|webp|svg)$/i;
  const allowedMimes = /^(video\/|application\/pdf|image\/)/;
  
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only video files, PDFs, and images are allowed!'), false);
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;



