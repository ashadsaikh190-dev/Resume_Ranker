const multer = require('multer');
const path = require('path');

// Storage configuration — save files to server/uploads/ with unique names
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter — accept supported document extensions and their known MIME types.
const fileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isPdf = extension === '.pdf' && file.mimetype === 'application/pdf';
  const isDoc =
    extension === '.doc' &&
    ['application/msword', 'application/vnd.ms-word.document'].includes(file.mimetype);
  const isDocx =
    extension === '.docx' &&
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (isPdf || isDoc || isDocx) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, .doc, and .docx files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10, // up to 10 files per request
  },
});

module.exports = upload;
