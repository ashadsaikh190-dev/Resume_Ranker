const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const { calculateMatch } = require('../services/matchingService');

/**
 * @desc   Match all resumes against a specific job description and return ranked results
 * @route  GET /api/match/:jobId
 */
const matchResumesToJob = async (req, res, next) => {
  try {
    const job = await JobDescription.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }

    // Get all resumes that have extracted text
    const resumes = await Resume.find({ extractedText: { $ne: '' } });

    if (resumes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No resumes with extracted text found. Upload resumes first.',
        job: { id: job._id, title: job.title },
        results: [],
      });
    }

    // Calculate match for each resume
    const results = resumes
      .map((resume) => {
        const match = calculateMatch(
          resume.extractedText,
          job.title,
          job.description
        );

        return {
          id: resume._id,
          candidateName: resume.candidateName,
          originalFileName: resume.originalFileName,
          fileSize: resume.fileSize,
          matchPercentage: match.matchPercentage,
          matchedKeywords: match.matchedKeywords,
          totalJobKeywords: match.totalJobKeywords,
          uploadedAt: resume.createdAt,
        };
      })
      // Sort by match percentage descending (ranking)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Assign ranks
    results.forEach((r, i) => {
      r.rank = i + 1;
    });

    res.status(200).json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        description: job.description,
      },
      totalResumes: results.length,
      results,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }
    next(error);
  }
};

/**
 * @desc   Get dashboard summary stats
 * @route  GET /api/match/stats
 */
const getDashboardStats = async (_req, res, next) => {
  try {
    const totalResumes = await Resume.countDocuments();
    const parsedResumes = await Resume.countDocuments({
      extractedText: { $ne: '' },
    });
    const totalJobs = await JobDescription.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalResumes,
        parsedResumes,
        totalJobs,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { matchResumesToJob, getDashboardStats };
