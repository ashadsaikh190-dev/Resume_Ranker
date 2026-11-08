const express = require('express');
const router = express.Router();
const { matchResumesToJob, getDashboardStats } = require('../controllers/matchController');

router.post('/', matchResumesToJob);
router.get('/stats', getDashboardStats);

module.exports = router;
