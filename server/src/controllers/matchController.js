const { rankResumesForJob, buildDashboardStats } = require('../services/matchingService');
const { jobs } = require('./jobController');

const matchResumesToJob = (req, res) => {
  const { jobId, resumes } = req.body || {};

  if (!jobId) {
    return res.status(400).json({ success: false, message: 'Job ID is required.' });
  }

  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job description not found.' });
  }

  const resumeList = Array.isArray(resumes) ? resumes : [];
  const rankedResumes = rankResumesForJob(job, resumeList);

  return res.status(200).json({
    success: true,
    job,
    results: rankedResumes,
    summary: {
      total: rankedResumes.length,
      bestMatch: rankedResumes[0] || null,
      averageMatch: rankedResumes.length
        ? Math.round(rankedResumes.reduce((sum, resume) => sum + resume.matchPercentage, 0) / rankedResumes.length)
        : 0,
    },
  });
};

const getDashboardStats = (_req, res) => {
  const stats = buildDashboardStats(jobs, []);
  return res.status(200).json({ success: true, stats });
};

module.exports = { matchResumesToJob, getDashboardStats };
