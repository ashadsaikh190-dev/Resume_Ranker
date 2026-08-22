import { useState, useEffect } from 'react';
import { getJobs } from '../services/jobService';
import { matchResumesToJob, getDashboardStats } from '../services/matchService';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [results, setResults] = useState(null);
  const [jobInfo, setJobInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load jobs and stats on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          getJobs(),
          getDashboardStats(),
        ]);
        setJobs(jobsRes.data.jobs || []);
        setStats(statsRes.data.stats || null);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setStatsLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleMatch = async () => {
    if (!selectedJobId) {
      setError('Please select a job description first.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await matchResumesToJob(selectedJobId);
      setResults(res.data.results || []);
      setJobInfo(res.data.job || null);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to match resumes. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (pct) => {
    if (pct >= 70) return 'score--high';
    if (pct >= 40) return 'score--medium';
    return 'score--low';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__subtitle">
          Match uploaded resumes against a job description and see ranked results
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="dash-loading">
          <LoadingSpinner size={32} text="Loading dashboard…" />
        </div>
      ) : (
        stats && (
          <div className="stats-grid" id="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{stats.totalResumes}</div>
              <div className="stat-card__label">Total Resumes</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.parsedResumes}</div>
              <div className="stat-card__label">Parsed Resumes</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{stats.totalJobs}</div>
              <div className="stat-card__label">Job Descriptions</div>
            </div>
          </div>
        )
      )}

      {/* Job Selector */}
      <div className="match-panel" id="match-panel">
        <h2 className="match-panel__title">Run Matching</h2>
        <div className="match-panel__controls">
          <div className="form-group">
            <label className="form-label" htmlFor="job-select">
              Select Job Description
            </label>
            <select
              id="job-select"
              className="form-input form-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              disabled={loading}
            >
              <option value="">— Choose a job description —</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn--primary"
            onClick={handleMatch}
            disabled={loading || !selectedJobId}
            id="match-btn"
          >
            {loading ? 'Matching…' : 'Match Resumes'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="dash-error" id="dash-error">
          <span>✕</span> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="dash-loading">
          <LoadingSpinner size={36} text="Analyzing resumes against job description…" />
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="results-section" id="results-section">
          <div className="results-header">
            <h2 className="results-header__title">
              Matching Results
              <span className="results-header__count">{results.length} candidates</span>
            </h2>
            {jobInfo && (
              <p className="results-header__job">
                Job: <strong>{jobInfo.title}</strong>
              </p>
            )}
          </div>

          {results.length === 0 ? (
            <div className="results-empty">
              <p>No resumes with extracted text found. Upload and process resumes first.</p>
            </div>
          ) : (
            <div className="results-table-wrap">
              <table className="results-table" id="results-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>File</th>
                    <th>Match %</th>
                    <th>Keywords Matched</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className={r.rank <= 3 ? 'results-row--top' : ''}>
                      <td className="results-rank">
                        <span className="rank-badge">{getRankBadge(r.rank)}</span>
                      </td>
                      <td className="results-candidate">{r.candidateName}</td>
                      <td className="results-file">
                        <span className="file-tag">{r.originalFileName}</span>
                      </td>
                      <td className="results-pct">
                        <div className="pct-bar-container">
                          <div
                            className={`pct-bar-fill ${getScoreColor(r.matchPercentage)}`}
                            style={{ width: `${r.matchPercentage}%` }}
                          />
                        </div>
                        <span className={`pct-value ${getScoreColor(r.matchPercentage)}`}>
                          {r.matchPercentage}%
                        </span>
                      </td>
                      <td className="results-keywords">
                        {r.matchedKeywords.length} / {r.totalJobKeywords}
                      </td>
                      <td className="results-score-cell">
                        <div className={`score-ring ${getScoreColor(r.matchPercentage)}`}>
                          {r.matchPercentage}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
