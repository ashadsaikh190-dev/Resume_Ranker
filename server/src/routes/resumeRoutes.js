const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadResume } = require('../controllers/resumeController');

// POST /api/resumes/upload — upload a single PDF resume and get parsed text
router.post('/upload', upload.single('resume'), uploadResume);

module.exports = router;
