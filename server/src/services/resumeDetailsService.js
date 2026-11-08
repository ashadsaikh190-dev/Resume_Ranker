const SECTION_ENDINGS = 'training attended|technical skill summary|skills|experience|project|personal details|declaration';

const findFlattenedLabelValue = (text, labels, endings = []) => {
  const labelPattern = labels.join('|');
  const endingPattern = [...endings, 'permanent address', 'contact address', 'phone(?:\\s+no)?', 'email', 'gender', 'date', 'place', 'declaration', 'education', 'experience', 'skills', 'projects?', 'training']
    .join('|');
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const match = normalizedText.match(new RegExp(
    `\\b(?:${labelPattern})\\s*[:\\-]\\s*(.+?)(?=\\s+\\b(?:${endingPattern})\\b\\s*[:\\-]|$)`,
    'i'
  ));
  return match?.[1]?.trim() || '';
};

const extractEducation = (text) => {
  const labeled = [];
  const labelPattern = /(?:^|\n)\s*(?:[-*•▪]\s*)?(School|10th|Tenth|12th|Twelfth|College|University|Degree|Qualification|CGPA|GPA)\s*[:\-]\s*([^\n]+)/gi;
  for (const match of text.matchAll(labelPattern)) {
    const label = match[1].replace(/^Tenth$/i, '10th').replace(/^Twelfth$/i, '12th');
    labeled.push({ key: `education-${labeled.length}`, label, value: match[2].trim() });
  }
  if (labeled.length) return labeled;

  const start = text.search(/\beducation\b/i);
  if (start < 0) return [];
  const block = text.slice(start).split(new RegExp(`\\b(?:${SECTION_ENDINGS})\\b`, 'i'))[0];
  const qualification = /\b(B\.?\s?Tech(?:nology)?(?:\s*\([^)]*\))?|M\.?\s?Tech(?:nology)?(?:\s*\([^)]*\))?|B\.?\s?E\.?(?:\s*\([^)]*\))?|M\.?\s?E\.?(?:\s*\([^)]*\))?|B\.?\s?Sc\.?(?:\s*\([^)]*\))?|M\.?\s?Sc\.?(?:\s*\([^)]*\))?|BCA|MCA|MBA|Bachelor(?:'s)?(?:\s+of\s+[A-Za-z]+)?|Master(?:'s)?(?:\s+of\s+[A-Za-z]+)?|Diploma(?:\s+in\s+[A-Za-z]+)?|Ph\.?D\.?|12th|10th|HSC|SSC|Intermediate)(?=$|[\s,;])/gi;
  const matches = [...block.matchAll(qualification)];

  return matches.map((match, index) => {
    const startDetails = match.index + match[0].length;
    const endDetails = matches[index + 1]?.index ?? block.length;
    const details = block.slice(startDetails, endDetails).replace(/^[\s:()[\]-]+|[\s:()[\]-]+$/g, '').trim();
    if (!details) return null;

    const year = details.match(/\b(?:19|20)\d{2}\b/);
    const score = details.match(/\b\d{1,3}(?:\.\d+)?\s*%|\b(?:CGPA|GPA)\s*[:\-]?\s*\d+(?:\.\d+)?/i);
    const scoreAfterYear = year && details.slice(year.index + year[0].length).match(/^\s*(\d{1,3}(?:\.\d+)?)(?:\s*%|\s*$)/);
    let institution = year ? details.slice(0, year.index).trim() : details;
    if (!year && score) institution = institution.replace(score[0], '').trim();
    const resultScore = score?.[0] || (scoreAfterYear ? `${scoreAfterYear[1]}%` : '');
    const value = [institution.replace(/[,\s]+$/, ''), year?.[0], resultScore]
      .filter(Boolean)
      .join(' — ');
    return value ? { key: `education-${index}`, label: match[0].replace(/\s+/g, ' ').trim(), value } : null;
  }).filter(Boolean);
};

const extractProjects = (text) => {
  const named = [...text.matchAll(/\bproject\s+name\s*[:\-]\s*([^:\n]+?)(?=\s+(?:duration|role|environment|description|testing environment)\s*[:\-]|[\n.]|$)/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const inProjectSection = [];
  let readingProjects = false;
  for (const line of lines) {
    if (/^(?:personal\s+|academic\s+)?projects?\s*:?\s*$/i.test(line)) {
      readingProjects = true;
      continue;
    }
    if (readingProjects && /^(education|skills|experience|profiles|personal details)\s*:?\s*$/i.test(line)) {
      readingProjects = false;
    }
    if (readingProjects && !/^(?:[-*•▪]\s*)?$/.test(line)) {
      inProjectSection.push(line.replace(/^[-*•▪]\s*/, '').trim());
    }
  }
  return [...new Set([...named, ...inProjectSection])];
};

const extractResumeDetails = (text = '') => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = text.match(/(?:\+\s?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d[\d\s().-]{7,}\d/)?.[0]?.trim() || '';
  const location = findFlattenedLabelValue(
    text,
    ['location', 'permanent address', 'contact address', 'address'],
    ['phone', 'email', 'gender']
  );
  const place = findFlattenedLabelValue(text, ['place'], ['date'])
    .replace(/\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/, '')
    .trim();

  return {
    fullName: findFlattenedLabelValue(text, ['full name', 'name'], ['phone', 'email']) ||
      lines.find((line) => line.length <= 60 && !line.includes(':') && !/@/.test(line)) || '',
    personalInformation: { email, phone, location, place },
    education: extractEducation(text),
    projects: extractProjects(text),
  };
};

module.exports = { extractResumeDetails };
