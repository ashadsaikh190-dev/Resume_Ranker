const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadResumes } = require('../controllers/resumeController');

// POST /api/resumes/upload — upload multiple PDF resumes
router.post('/upload', upload.array('resumes', 100), uploadResumes);

module.exports = router;
