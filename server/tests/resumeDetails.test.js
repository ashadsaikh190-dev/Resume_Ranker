const test = require('node:test');
const assert = require('node:assert/strict');
const { extractResumeDetails } = require('../src/services/resumeDetailsService');

test('extracts education, project, address and place from flattened Word resume text', () => {
  const text = `RESUME Name :ABCDEFGH Phone : 90000000000 Email : ABCDEFG@gmail.com Career Objective Looking for a software testing role. Education Education (Specialization) College Year of Education Percentage B.Tech (CSE) Orissa Eng. College,Bhubaneswar 2015 65 12th Sri Chaitanya Vidyaniketan,Vizag 2011 56.2 10th The Kosala School,Bargarh 2009 68.2 Training Attended Software Testing. Technical Skill Summary Java SQL Project : Project Name : PrimusBank Duration : 2 Months Role : Trainee Test Engineer Personal Details Permanent Address : AT/PO-Kantabanji, Road no. 4, Dist.-Balangir,Odisha Contact Address : LAKSHMI GENTS PG, Bengaluru Phone No : 90000000000 Declaration Place : BENGALURU Bishal Jaiswal Date :`;
  const details = extractResumeDetails(text);

  assert.equal(details.fullName, 'ABCDEFGH');
  assert.equal(details.education.length, 3);
  assert.match(details.education[0].value, /Bhubaneswar.*2015.*65%/);
  assert.deepEqual(details.projects, ['PrimusBank']);
  assert.match(details.personalInformation.location, /Balangir/);
  assert.equal(details.personalInformation.place, 'BENGALURU');
});

test('extracts labeled education and multiple projects from demo resume text', () => {
  const text = `Rahul Sharma
Software Developer Candidate
Personal Information
- Email: rahul@gmail.com
- Phone: +91 9876543210
- Location: Kolkata, India
Education
- School: ABC Public School
- 10th: 85%
- 12th: 82%
- College: XYZ University
- Degree: B.Tech CSE
- CGPA: 8.2
Projects
- Resume Ranker
- E-commerce Website`;
  const details = extractResumeDetails(text);

  assert.equal(details.personalInformation.location, 'Kolkata, India');
  assert.equal(details.education.length, 6);
  assert.deepEqual(details.projects, ['Resume Ranker', 'E-commerce Website']);
});
