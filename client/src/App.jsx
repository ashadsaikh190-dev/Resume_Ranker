import { useEffect, useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import ResumeViewer from './components/ResumeViewer';
import { getJobs, createJob, matchResumesToJob } from './services/jobService';
import { getDashboardStats } from './services/resumeService';
import './index.css';

const emptyJob = { title: '', description: '' };

function App() {
  const [parsedResumes, setParsedResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobForm, setJobForm] = useState(emptyJob);
  const [rankings, setRankings] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalResumes: 0, parsedResumes: 0, readyForReview: 0 });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshJobs();
    refreshStats();
  }, []);

  const refreshJobs = async () => {
    try {
      const response = await getJobs();
      setJobs(response.data?.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    }
  };

  const refreshStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data?.stats || { totalJobs: 0, totalResumes: 0, parsedResumes: 0, readyForReview: 0 });
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    }
  };

  const handleParsed = (data) => {
    setParsedResumes(Array.isArray(data) ? data : []);
    setStatus({ type: 'success', message: 'Resumes uploaded and parsed successfully.' });
  };

  const handleReset = () => {
    setParsedResumes([]);
    setRankings([]);
    setSelectedJobId('');
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await createJob(jobForm);
      const created = response.data?.job;
      if (created) {
        setJobs((prev) => [created, ...prev]);
        setSelectedJobId(created.id);
        setJobForm(emptyJob);
        setStatus({ type: 'success', message: 'Job description saved.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to save job description.' });
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async () => {
    if (!selectedJobId) {
      setStatus({ type: 'error', message: 'Please select a job description.' });
      return;
    }

    const successfulResumes = parsedResumes.filter((resume) => resume.success);
    if (!successfulResumes.length) {
      setStatus({ type: 'error', message: 'Upload at least one successfully parsed resume before matching.' });
      return;
    }

    setLoading(true);
    try {
      const response = await matchResumesToJob({
        jobId: selectedJobId,
        resumes: successfulResumes,
      });
      setRankings(response.data?.results || []);
      setStatus({ type: 'success', message: 'Matching complete. Ranking updated.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Unable to match resumes.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header" id="app-header">
          <div className="app-header__brand">
            <div className="app-header__logo">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="app-header__text">
              <h1 className="app-header__title">Resume Ranker</h1>
              <span className="app-header__tagline">Upload · Rank · Review</span>
            </div>
          </div>
        </header>

        <main className="main-content" id="main-content">
          <div className="dashboard-grid">
            <section className="panel panel--wide">
              <div className="page__header">
                <h2 className="page__title">Upload Resumes</h2>
                <p className="page__subtitle">Upload one or more PDF resumes to extract their text and prepare them for matching.</p>
              </div>
              <ResumeUpload onParsed={handleParsed} />
            </section>

            <section className="panel">
              <div className="page__header small-gap">
                <h2 className="page__title">Job Description</h2>
              </div>
              <form onSubmit={handleJobSubmit} className="job-form">
                <label>
                  <span>Job title</span>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(event) => setJobForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="e.g. Full Stack Developer"
                  />
                </label>
                <label>
                  <span>Job description</span>
                  <textarea
                    value={jobForm.description}
                    onChange={(event) => setJobForm((prev) => ({ ...prev, description: event.target.value }))}
                    rows="8"
                    placeholder="List required skills, qualifications, and responsibilities"
                  />
                </label>
                <button type="submit" className="btn btn--primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Job'}
                </button>
              </form>
            </section>
          </div>

          <section className="panel panel--wide match-panel">
            <div className="page__header small-gap">
              <h2 className="page__title">Candidate Ranking</h2>
            </div>
            <div className="match-controls">
              <label>
                <span>Select saved job</span>
                <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
                  <option value="">Choose a job description</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn btn--secondary" onClick={runMatching} disabled={loading || !selectedJobId}>
                {loading ? 'Matching...' : 'Match Resumes'}
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><span>Total Jobs</span><strong>{stats.totalJobs || jobs.length}</strong></div>
              <div className="stat-card"><span>Parsed Resumes</span><strong>{stats.parsedResumes || parsedResumes.filter((r) => r.success).length}</strong></div>
              <div className="stat-card"><span>Ready for Review</span><strong>{stats.readyForReview || parsedResumes.filter((r) => r.success).length}</strong></div>
            </div>

            {status.message && (
              <div className={`upload-message upload-message--${status.type || 'info'}`}>
                {status.message}
              </div>
            )}

            {rankings.length > 0 && (
              <div className="ranking-table-wrap">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Candidate</th>
                      <th>Match %</th>
                      <th>Key Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((item) => (
                      <tr key={item.id || item.fileName}>
                        <td>#{item.rank}</td>
                        <td>{item.fileName}</td>
                        <td>{item.matchPercentage}%</td>
                        <td>{item.matchedSkills.length ? item.matchedSkills.join(', ') : 'No strong overlap'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
