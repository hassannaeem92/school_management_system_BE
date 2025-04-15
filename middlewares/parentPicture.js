const multer = require('multer');
const path = require('path');

// Configure storage with correct file extension
let exts = '';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/parents_picture'); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    // If ext is missing, determine it from the mimetype
    if (!ext || ext === '') {
      const mimeExtMap = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif'
      };
      ext = mimeExtMap[file.mimetype] || ''; // Get correct extension or leave empty
      exts = ext
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${exts}`);
  },
});
  
// Configure multer
const parents_picture = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  },
});

module.exports = parents_picture;
