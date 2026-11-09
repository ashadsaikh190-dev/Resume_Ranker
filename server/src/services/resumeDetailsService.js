const SECTION_ENDINGS = [
  'training attended',
  'trainings attended',
  'technical skill summary',
  'technical skills',
  'skill set',
  'core competencies',
  'work experience',
  'professional experience',
  'employment history',
  'experience',
  'career scan',
  'executive digest',
  'career profile',
  'career objective',
  'professional summary',
  'career summary',
  'key projects',
  'personal projects',
  'academic projects',
  'projects?',
  'personal details',
  'contact details',
  'declaration',
];

const EDUCATION_HEADINGS = [
  'educational qualifications',
  'educational background',
  'education details',
  'academic qualifications',
  'academic qualification',
  'academic background',
  'academic details',
  'academic credentials',
  'academics',
  'academia',
  'academic',
  'scholastic details',
  'scholastic background',
  'qualifications',
  'qualification',
  'education',
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const flexibleLabel = (label) => escapeRegex(label).replace(/\s+/g, '\\s+');

const findFlattenedLabelValue = (text, labels, extraEndings = [], allowTabSeparator = false) => {
  const labelPattern = labels.map(flexibleLabel).join('|');
  const stopLabels = [
    ...extraEndings,
    'permanent address', 'contact address', 'current address', 'present address',
    'residential address', 'postal addresss?', 'location', 'address',
    'phone(?:\\s+no)?', 'phone number', 'contact number', 'mobile(?: number)?',
    'email', 'e-mail', 'gender', 'date of birth', 'dob', 'date', 'place',
    'declaration', 'education', 'academics?', 'academia', 'academic',
    'academic background', 'educational background', 'qualifications?',
    'scholastic details', 'experience', 'employment history', 'work history',
    'skills', 'project', 'projects', 'profile', 'profiles', 'training',
    'training attended', 'trainings attended', 'personal details',
    'contact details', 'languages', 'career objective', 'career profile',
    'career summary', 'professional summary', 'looking forward', 'seeking',
    'i am', 'duration', 'role', 'company', 'employer', 'designation', 'title',
    'school(?: name)?', 'college(?: name)?', 'university(?: name)?',
    'institution(?: name)?', 'degree', 'course', 'qualification',
    'cgpa', 'gpa', '10th', '12th', 'tenth', 'twelfth',
    'class xii', 'class x', 'class 10', 'class 12', 'hsc', 'ssc',
    'intermediate', 'matriculation',
  ];
  const normalizedText = text.replace(/\u00a0/g, ' ').replace(/[ \r\n]+/g, ' ').trim();
  const separator = allowTabSeparator ? '(?:[ \\t]*[:\\-][ \\t]*|\\t+)' : '\\s*[:\\-]\\s*';
  const labelMatch = new RegExp(`\\b(?:${labelPattern})\\b${separator}`, 'i').exec(normalizedText);
  if (!labelMatch) return '';

  const valueStart = labelMatch.index + labelMatch[0].length;
  const valueText = normalizedText.slice(valueStart);
  const stopPattern = stopLabels.map(flexibleLabel).join('|');
  const nextField = new RegExp(`\\s+\\b(?:${stopPattern})\\b(?=\\s|:|\\-)`, 'i').exec(valueText);
  let value = (nextField ? valueText.slice(0, nextField.index) : valueText)
    .replace(/[\s,;:|-]+$/, '')
    .trim();

  if (value.length > 180) value = value.slice(0, 180).replace(/\s+\S*$/, '').trim();
  return value;
};

const findEducationStart = (text, qualificationPattern) => {
  const headings = EDUCATION_HEADINGS
    .map((heading) => {
      const match = new RegExp(`\\b${flexibleLabel(heading)}\\b`, 'i').exec(text);
      return match ? { index: match.index, length: match[0].length } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index || b.length - a.length);

  const headingWithEducation = headings.find(({ index }) =>
    qualificationPattern.test(text.slice(index, index + 700))
  );
  if (headingWithEducation) return headingWithEducation.index;

  const qualification = qualificationPattern.exec(text);
  return qualification?.index ?? -1;
};

const extractEducation = (text) => {
  const qualificationPattern = /\b(Bachelor(?:'s)?(?:\s+of\s+[A-Za-z]+)?(?:\s*\((?:B\.?\s?Tech|M\.?\s?Tech|B\.?\s?E\.?|M\.?\s?E\.?|B\.?\s?Sc\.?|M\.?\s?Sc\.?)\))?|Master(?:'s)?(?:\s+of\s+[A-Za-z]+)?(?:\s*\((?:M\.?\s?Tech|M\.?\s?E\.?|M\.?\s?Sc\.?)\))?|B\.?\s?Tech(?:nology)?(?:\s*\([^)]*\))?|M\.?\s?Tech(?:nology)?(?:\s*\([^)]*\))?|B\.?\s?E\.?(?:\s*\([^)]*\))?|M\.?\s?E\.?(?:\s*\([^)]*\))?|B\.?\s?Sc\.?(?:\s*\([^)]*\))?|M\.?\s?Sc\.?(?:\s*\([^)]*\))?|BBA|BCA|MCA|MBA|Diploma(?:\s+in\s+[A-Za-z]+)?|Ph\.?D\.?|Graduate|Graduation|Undergraduate|Postgraduate|12th|10th|HSC|SSC|Intermediate|High School|Class\s+(?:X|XII|10|12)|Grade\s+(?:10|12))(?=$|[\s,;:\-])/i;
  const start = findEducationStart(text, qualificationPattern);
  if (start < 0) return [];

  const block = text.slice(start).split(new RegExp(`\\b(?:${SECTION_ENDINGS.join('|')})\\b`, 'i'))[0];
  const matches = [...block.matchAll(new RegExp(qualificationPattern.source, 'gi'))];
  const items = matches.map((match, index) => {
    const detailStart = match.index + match[0].length;
    const detailEnd = matches[index + 1]?.index ?? block.length;
    const details = block.slice(detailStart, detailEnd).replace(/^[\s:()[\]-]+|[\s:()[\]-]+$/g, '').trim();
    if (!details) return null;

    const year = details.match(/\b(?:19|20)\d{2}\b/);
    const score = details.match(/\b\d{1,3}(?:\.\d+)?\s*%|\b(?:CGPA|GPA)\s*[:\-]?\s*\d+(?:\.\d+)?/i);
    const scoreAfterYear = year &&
      details.slice(year.index + year[0].length).match(/^\s*(\d{1,3}(?:\.\d+)?)(?:\s*%|\s*$)/);
    let institution = details;

    if (details.includes('\t') && year) {
      const cells = details.split(/\t+/).map((cell) => cell.trim()).filter(Boolean);
      const yearCell = cells.findIndex((cell) => /\b(?:19|20)\d{2}\b/.test(cell));
      if (yearCell > 0) {
        const institutionCells = cells.slice(0, yearCell)
          .filter((cell) => !/^in\s+(?:computer|information|electrical|mechanical|civil|electronics|software)\b/i.test(cell));
        if (institutionCells.length) institution = institutionCells[institutionCells.length - 1];
      }
    }

    if (year) institution = institution.slice(0, year.index).trim();
    if (!year && score) institution = institution.replace(score[0], '').trim();
    institution = institution
      .replace(/^\s*(?:from|at)\s+/i, '')
      .replace(/\s+\b(?:with|marks?)\b.*$/i, '')
      .trim();

    const graduate = /^(?:in|of)\s+(.+?)\s+from\s+(.+?)(?:\s+(?:in\s+)?(?:19|20)\d{2})?\.?$/i.exec(details);
    const resultScore = score?.[0] || (scoreAfterYear ? `${scoreAfterYear[1]}%` : '');
    const value = [
      graduate?.[1]?.trim() || institution.replace(/[,\s]+$/, ''),
      graduate?.[2]?.replace(/\b(?:19|20)\d{2}\b.*$/i, '').replace(/[,\s]+$/, '').trim(),
      year?.[0],
      resultScore,
    ].filter(Boolean).join(' — ');

    return value ? {
      key: `education-${index}`,
      label: match[0].replace(/\s+/g, ' ').trim(),
      value,
    } : null;
  }).filter(Boolean);

  const labeled = [];
  const labelPattern = /(?:^|\n)\s*(?:[-*•▪]\s*)?(School|10th|Tenth|12th|Twelfth|College|University|Degree|Qualification|CGPA|GPA)\s*[:\-]\s*([^\n]+)/gi;
  for (const match of text.matchAll(labelPattern)) {
    const label = match[1].replace(/^Tenth$/i, '10th').replace(/^Twelfth$/i, '12th');
    labeled.push({ key: `labeled-${labeled.length}`, label, value: match[2].trim() });
  }

  if (!labeled.length) return items;
  const educationGroup = (item) => {
    const value = `${item.label} ${item.key}`.toLowerCase();
    if (/10th|tenth|class x\b|class 10|ssc|matriculation/.test(value)) return 'secondary';
    if (/12th|twelfth|class xii|class 12|hsc|intermediate/.test(value)) return 'higher-secondary';
    if (/school|college|university|institution/.test(value)) return value.replace(/[^a-z]/g, '');
    if (/degree|qualification|b\.?tech|m\.?tech|bca|mca|mba|bachelor|master|diploma|ph\.?d|graduate/.test(value)) return 'degree';
    if (/cgpa|gpa/.test(value)) return 'grade-point';
    return value.replace(/[^a-z0-9]/g, '');
  };
  const result = [...labeled];
  const seen = new Set(result.map(educationGroup));
  items.forEach((item) => {
    const group = educationGroup(item);
    if (!seen.has(group)) {
      result.push(item);
      seen.add(group);
    }
  });
  return result;
};

const extractProjects = (text) => {
  const named = [...text.matchAll(/\bproject\s+name\s*[:\-]\s*([^:\n]+?)(?=\s+(?:duration|role|environment|description|testing environment)\s*[:\-]|\n|$)/gi)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const sectionProjects = [];
  let readingProjects = false;
  for (const line of lines) {
    if (/^(?:(?:personal|academic|key)\s+)?projects?\s*:?\s*$/i.test(line)) {
      readingProjects = true;
      continue;
    }
    if (readingProjects && /^(education|academics?|academia|skills|experience|profiles|personal details|training|achievements)\s*:?\s*$/i.test(line)) {
      readingProjects = false;
    }
    if (
      readingProjects &&
      line.length <= 120 &&
      !/:/.test(line) &&
      !/\b(?:is|are|comprises|provided|offers|module|experience|testing environment|development environment)\b/i.test(line)
    ) {
      sectionProjects.push(line.replace(/^[-*•▪]\s*/, '').trim());
    }
  }
  return [...new Set([...named, ...sectionProjects])];
};

const extractResumeDetails = (text = '') => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = text.match(/(?:\+\s?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d[\d\s().-]{7,}\d/)?.[0]?.trim() || '';
  const locationLabels = [
    'location', 'permanent address', 'contact address', 'current address',
    'present address', 'residential address', 'postal addresss?', 'address',
  ];
  const location = findFlattenedLabelValue(
    text,
    locationLabels,
    ['phone', 'phone no', 'phone number', 'contact number', 'mobile', 'email', 'gender', 'languages'],
    true
  );
  const place = findFlattenedLabelValue(text, ['place'], ['date'], true)
    .replace(/\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/, '')
    .trim();
  const nameMatch = [...text.matchAll(/\b(?:(?:candidate|full)\s+)?name\s*[:\-]\s*([^\r\n]+)/gi)]
    .find((match) => !/(?:father'?s|mother'?s|project|passport|school|college|university)\s*$/i
      .test(text.slice(Math.max(0, match.index - 24), match.index)));
  const fullName = nameMatch?.[1]
    ?.split(/\s+(?:phone|mobile|email|e-mail|location|address)\s*[:\-]/i)[0]
    .replace(/\s+/g, ' ')
    .trim() ||
    lines.find((line) => line.length <= 60 && !line.includes(':') && !/@/.test(line)) || '';

  return {
    fullName,
    personalInformation: { email, phone, location, place },
    education: extractEducation(text),
    projects: extractProjects(text),
  };
};

module.exports = { extractResumeDetails };
