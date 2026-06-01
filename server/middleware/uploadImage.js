const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads/profiles folder if it doesn't exist
const profilesFolder = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profilesFolder)) {
  fs.mkdirSync(profilesFolder, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilesFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  const allowedExts = /^\.(jpg|jpeg|png|gif|webp)$/i;
  const allowedMimes = /^image\//;
  
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
  }
};

// Upload configuration
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = uploadImage;
