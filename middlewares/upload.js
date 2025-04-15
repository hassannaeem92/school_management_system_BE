const multer = require('multer');
const path = require('path');

// Configure storage with correct file extension
let exts = '';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    exts = ext;
    // If ext is missing, determine it from the mimetype
    if (!ext || ext === '') {
      const mimeExtMap = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'text/plain': '.txt',
        'application/rtf': '.rtf'
      };
      ext = mimeExtMap[file.mimetype] || ''; // Get correct extension or leave empty
      exts = ext
    }
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${exts}`);
  },
});
// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/rtf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
