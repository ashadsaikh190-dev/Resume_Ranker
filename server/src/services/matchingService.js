const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'have', 'been', 'will', 'about', 'over', 'under', 'after', 'before', 'through', 'using', 'work', 'workflows', 'years', 'year', 'skill', 'skills', 'experience', 'experienced', 'strong', 'good', 'excellent', 'developer', 'team', 'within', 'also', 'more', 'most', 'very', 'than', 'their', 'them', 'there', 'these', 'those', 'what', 'when', 'where', 'which', 'who', 'why', 'how', 'each', 'such', 'just', 'same', 'must', 'need', 'needed', 'able', 'role', 'roles', 'across', 'while', 'among', 'include', 'includes', 'including', 'either', 'both', 'other', 'others', 'focus', 'focused', 'responsible', 'support', 'supports', 'related', 'technical'
]);

const normalizeText = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

const computeKeywordUsage = (text = '') => {
  const normalized = normalizeText(text).filter((word) => word.length > 2 && !STOP_WORDS.has(word));
  const counts = {};

  normalized.forEach((word) => {
    counts[word] = (counts[word] || 0) + 1;
  });

  return { normalized, counts };
};

const calculateMatchScore = (resumeText = '', jobDescription = '') => {
  if (!resumeText || !jobDescription) {
    return 0;
  }

  const resume = computeKeywordUsage(resumeText);
  const job = computeKeywordUsage(jobDescription);

  if (!job.normalized.length || !resume.normalized.length) {
    return 0;
  }

  const resumeSet = new Set(resume.normalized);
  const matchedKeywords = job.normalized.filter((keyword) => resumeSet.has(keyword));
  const uniqueMatchCoverage = (matchedKeywords.length / job.normalized.length) * 100;

  let weightedMatches = 0;
  job.normalized.forEach((keyword) => {
    if (!resume.counts[keyword]) return;
    weightedMatches += Math.min(job.counts[keyword] || 1, resume.counts[keyword] || 1);
  });

  const repetitionScore = (weightedMatches / Math.max(1, job.normalized.length)) * 100;
  const combinedScore = uniqueMatchCoverage * 0.75 + repetitionScore * 0.25;

  return Math.min(100, Math.round(combinedScore));
};

const rankResumesForJob = (job, resumes = []) => {
  if (!job || !job.description) {
    return [];
  }

  const jobText = `${job.title || ''} ${job.description || ''}`;

  const rankings = (resumes || [])
    .filter((resume) => resume && (resume.text || resume.content || resume.resumeText))
    .map((resume) => {
      const text = resume.text || resume.content || resume.resumeText || '';
      const matchPercentage = calculateMatchScore(text, jobText);
      const matchedSkills = computeKeywordUsage(jobText).normalized.filter((keyword) => {
        const set = new Set(computeKeywordUsage(text).normalized);
        return set.has(keyword);
      });

      return {
        id: resume.id || resume.fileName || `${resume.fileName || 'resume'}-${Math.random()}`,
        fileName: resume.fileName || resume.name || 'Resume',
        matchPercentage,
        matchedSkills: [...new Set(matchedSkills)].slice(0, 12),
        text,
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return rankings.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
};

const buildDashboardStats = (jobs = [], resumes = []) => ({
  totalJobs: jobs.length,
  totalResumes: resumes.length,
  parsedResumes: resumes.filter((resume) => resume && resume.success).length,
  readyForReview: resumes.filter((resume) => resume && resume.success).length,
});

module.exports = {
  calculateMatchScore,
  rankResumesForJob,
  buildDashboardStats,
};
