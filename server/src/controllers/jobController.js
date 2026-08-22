const JobDescription = require('../models/JobDescription');

/**
 * @desc   Create a new job description
 * @route  POST /api/jobs
 */
const createJob = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required.',
      });
    }

    const job = await JobDescription.create({
      title: title.trim(),
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Job description saved successfully',
      job: {
        id: job._id,
        title: job.title,
        description: job.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all job descriptions
 * @route  GET /api/jobs
 */
const getJobs = async (_req, res, next) => {
  try {
    const jobs = await JobDescription.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: jobs.map((job) => ({
        id: job._id,
        title: job.title,
        description: job.description,
        createdAt: job.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a single job description by ID
 * @route  GET /api/jobs/:id
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await JobDescription.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }

    res.status(200).json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        description: job.description,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job description not found.',
      });
    }
    next(error);
  }
};

module.exports = { createJob, getJobs, getJobById };
