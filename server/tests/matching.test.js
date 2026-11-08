const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateMatchScore } = require('../src/services/matchingService');

test('calculateMatchScore ranks resumes by relevant keyword overlap', () => {
  const jobDescription = 'Node.js React Express MongoDB API testing microservices';
  const resumeA = 'Strong Node.js and React developer with Express and MongoDB API experience';
  const resumeB = 'Focused on Python data analysis and machine learning workflows';

  const a = calculateMatchScore(resumeA, jobDescription);
  const b = calculateMatchScore(resumeB, jobDescription);

  assert.ok(a > b, 'Resume A should score higher than Resume B');
  assert.ok(a >= 50, 'Resume A should be considered a strong match');
  assert.ok(b < 30, 'Resume B should score poorly for this job');
});
