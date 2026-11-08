const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadResume } = require('../controllers/resumeController');

// POST /api/resumes/upload — upload multiple PDF or Word resumes and get parsed text
router.post('/upload', upload.array('resume', 10), uploadResume);

module.exports = router;
