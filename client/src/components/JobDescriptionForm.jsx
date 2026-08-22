import { useState } from 'react';
import { createJob } from '../services/jobService';
import LoadingSpinner from './LoadingSpinner';
import './JobDescriptionForm.css';

const JobDescriptionForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [errors, setErrors] = useState({});

  const clearMessage = () => {
    setMessage(null);
    setMessageType('');
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Job title is required.';
    }
    if (!description.trim()) {
      newErrors.description = 'Job description is required.';
    } else if (description.trim().length < 20) {
      newErrors.description =
        'Job description should be at least 20 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessage();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await createJob({
        title: title.trim(),
        description: description.trim(),
      });

      setMessage(
        response.data.message || 'Job description saved successfully!'
      );
      setMessageType('success');
      setTitle('');
      setDescription('');
      setErrors({});
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        'Failed to save job description. Please try again.';
      setMessage(errMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setDescription('');
    setErrors({});
    clearMessage();
  };

  return (
    <form className="job-form" onSubmit={handleSubmit} id="job-form">
      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="job-title">
          Job Title
        </label>
        <input
          type="text"
          id="job-title"
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder="e.g. MERN Stack Developer"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          disabled={loading}
        />
        {errors.title && (
          <p className="form-error">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="job-description">
          Job Description
        </label>
        <textarea
          id="job-description"
          className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
          placeholder="Enter the complete job description, including required skills, responsibilities, and qualifications…"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: '' }));
          }}
          rows={8}
          disabled={loading}
        />
        {errors.description && (
          <p className="form-error">{errors.description}</p>
        )}
        <span className="form-charcount">
          {description.length} characters
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="form-loading">
          <LoadingSpinner size={28} text="Saving job description…" />
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`form-message form-message--${messageType}`}
          id="job-message"
        >
          <span className="form-message__icon">
            {messageType === 'success' ? '✓' : '✕'}
          </span>
          {message}
        </div>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={loading}
          id="save-job-btn"
        >
          {loading ? 'Saving…' : 'Save Job Description'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleClear}
          disabled={loading}
          id="clear-job-btn"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default JobDescriptionForm;
