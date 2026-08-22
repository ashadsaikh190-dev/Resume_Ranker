/**
 * Matching Service — compares resume text against a job description
 * and returns a match percentage based on keyword overlap.
 */

/**
 * Tokenize text into unique lowercase words, stripping punctuation.
 */
const tokenize = (text) => {
  if (!text) return [];
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9+#.\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1)
    ),
  ];
};

// Common stop-words to ignore during matching
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'this', 'that', 'these',
  'those', 'it', 'its', 'we', 'you', 'he', 'she', 'they', 'them',
  'our', 'your', 'his', 'her', 'their', 'my', 'me', 'us', 'who',
  'which', 'what', 'when', 'where', 'how', 'not', 'no', 'nor', 'if',
  'then', 'than', 'so', 'as', 'from', 'about', 'into', 'over', 'after',
  'also', 'just', 'more', 'most', 'such', 'only', 'very', 'all', 'any',
  'each', 'every', 'both', 'few', 'some', 'many', 'much', 'other',
  'up', 'out', 'new', 'one', 'two', 'well', 'way',
]);

/**
 * Remove stop-words from a token list.
 */
const removeStopWords = (tokens) => tokens.filter((t) => !STOP_WORDS.has(t));

/**
 * Calculate the match percentage between a resume and a job description.
 *
 * @param {string} resumeText  - Plain text extracted from the resume PDF.
 * @param {string} jobTitle    - The job title.
 * @param {string} jobDesc     - The full job description text.
 * @returns {{ matchPercentage: number, matchedKeywords: string[], totalJobKeywords: number }}
 */
const calculateMatch = (resumeText, jobTitle, jobDesc) => {
  const jobText = `${jobTitle} ${jobDesc}`;
  const jobTokens = removeStopWords(tokenize(jobText));
  const resumeTokens = new Set(removeStopWords(tokenize(resumeText)));

  if (jobTokens.length === 0) {
    return { matchPercentage: 0, matchedKeywords: [], totalJobKeywords: 0 };
  }

  const matched = jobTokens.filter((token) => resumeTokens.has(token));
  const matchedUnique = [...new Set(matched)];
  const jobUnique = [...new Set(jobTokens)];

  const percentage = Math.round((matchedUnique.length / jobUnique.length) * 100);

  return {
    matchPercentage: Math.min(percentage, 100),
    matchedKeywords: matchedUnique,
    totalJobKeywords: jobUnique.length,
  };
};

module.exports = { calculateMatch };
