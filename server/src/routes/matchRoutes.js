const express = require('express');
const router = express.Router();
const {
  matchResumesToJob,
  getDashboardStats,
} = require('../controllers/matchController');

// GET /api/match/stats — dashboard summary
router.get('/stats', getDashboardStats);

// GET /api/match/:jobId — match resumes against a job
router.get('/:jobId', matchResumesToJob);

module.exports = router;
