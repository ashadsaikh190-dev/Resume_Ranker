const { randomUUID } = require('crypto');

const jobs = [];

const createJob = (req, res) => {
  const { title, description } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: 'Job title is required.' });
  }

  if (!description || !String(description).trim()) {
    return res.status(400).json({ success: false, message: 'Job description is required.' });
  }

  const job = {
    id: randomUUID(),
    title: String(title).trim(),
    description: String(description).trim(),
    createdAt: new Date().toISOString(),
  };

  jobs.push(job);

  return res.status(201).json({ success: true, message: 'Job description saved successfully.', job });
};

const getJobs = (_req, res) => {
  return res.status(200).json({ success: true, jobs });
};

const getJobById = (req, res) => {
  const { id } = req.params;
  const job = jobs.find((item) => item.id === id);

  if (!job) {
    return res.status(404).json({ success: false, message: 'Job description not found.' });
  }

  return res.status(200).json({ success: true, job });
};

module.exports = { createJob, getJobs, getJobById, jobs };
