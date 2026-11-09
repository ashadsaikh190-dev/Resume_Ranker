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

test('recognizes Academia and graduate education without an Education heading', () => {
  const details = extractResumeDetails(
    'Career Scan Worked as test analyst. Academia Graduate in Electronic and communication Engineering from Bhabha Group, Kanpur(Uttar Padesh) In 2015. Skill Set Java'
  );

  assert.equal(details.education.length, 1);
  assert.equal(details.education[0].label, 'Graduate');
  assert.match(details.education[0].value, /Electronic and communication Engineering.*Bhabha Group.*2015/);
});

test('keeps postal address compact and excludes following objective text', () => {
  const details = extractResumeDetails(
    'Postal Address: L-196/b, semra railway colony badgaon, gonda (Uttar Pradesh) I am looking forward to work in an organization, which provides the environment for growth with competent skills. Academics: B.Sc XYZ University 2020'
  );

  assert.match(details.personalInformation.location, /Uttar Pradesh/);
  assert.doesNotMatch(details.personalInformation.location, /looking forward|environment for growth/i);
});

test('extracts a qualification table with tab-separated degree, college, and year', () => {
  const details = extractResumeDetails(
    'QUALIFICATIONS\tDEGREE\tCOLLEGE / UNIVERSITY\tYEAR OF PASSING\tBachelor of Technology (B.Tech) in Computer Science\tJNTU XYZ\t2010\tCAREER PROFILE\tABC Services'
  );

  assert.equal(details.education.length, 1);
  assert.equal(details.education[0].label, 'Bachelor of Technology (B.Tech)');
  assert.match(details.education[0].value, /JNTU XYZ.*2010/);
});

test('does not include training details in education or project summaries', () => {
  const details = extractResumeDetails(
    'Academia MCA from ABC with 65% marks HSC from ABC with 71% marks SSC from ABC with 70% marks Trainings attended Six months Industrial Training in Software Testing in ABC, XYZ.'
  );

  assert.equal(details.education.length, 3);
  assert.ok(details.education.every((item) => !/training/i.test(item.label + item.value)));
});
