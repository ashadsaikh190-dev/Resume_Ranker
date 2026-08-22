const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
} = require('../controllers/jobController');

// POST /api/jobs — create a new job description
router.post('/', createJob);

// GET /api/jobs — get all job descriptions
router.get('/', getJobs);

// GET /api/jobs/:id — get a single job description
router.get('/:id', getJobById);

module.exports = router;
