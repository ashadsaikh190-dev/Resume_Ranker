import { useState, useRef, useCallback } from 'react';
import { uploadResumes } from '../services/resumeService';
import './ResumeUpload.css';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MAX_FILES = 10;

const ResumeUpload = ({ onParsed }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const clearMessage = () => {
    setMessage(null);
    setMessageType('');
  };

  const validateFile = (incoming) => {
    const ext = incoming.name.split('.').pop().toLowerCase();
    if (incoming.type === 'application/pdf' && ext === 'pdf') {
      return true;
    }
    return false;
  };

  const addFiles = (incomingFiles) => {
    clearMessage();
    const fileList = Array.from(incomingFiles);
    const valid = fileList.filter((f) => validateFile(f));
    const rejected = fileList.length - valid.length;

    if (rejected > 0) {
      setMessage(`${rejected} file(s) rejected — only PDF files are allowed.`);
      setMessageType('warning');
    }

    if (valid.length === 0) return;

    setFiles((prev) => {
      // Deduplicate by name + size
      const existing = new Set(prev.map((f) => `${f.name}__${f.size}`));
      const unique = valid.filter((f) => !existing.has(`${f.name}__${f.size}`));
      const combined = [...prev, ...unique];

      if (combined.length > MAX_FILES) {
        setMessage(`Maximum ${MAX_FILES} files allowed. Some files were not added.`);
        setMessageType('warning');
        return combined.slice(0, MAX_FILES);
      }

      return combined;
    });
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    clearMessage();
  };

  const handleClearAll = () => {
    setFiles([]);
    clearMessage();
  };

  // Drag-and-drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one PDF resume.');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setProgress(0);
    clearMessage();

    try {
      const response = await uploadResumes(files, (percent) => {
        setProgress(percent);
      });

      const { summary } = response.data;
      if (summary.failed > 0) {
        setMessage(`${summary.successful} of ${summary.total} resume(s) parsed. ${summary.failed} failed.`);
        setMessageType('warning');
      } else {
        setMessage(`${summary.total} resume(s) parsed successfully!`);
        setMessageType('success');
      }
      setProgress(100);

      // Pass parsed data to parent
      if (onParsed && response.data.resumes) {
        onParsed(response.data.resumes);
      }

      setFiles([]);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        'Upload failed. Please try again.';
      setMessage(errMsg);
      setMessageType('error');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="upload-container">
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? 'drop-zone--active' : ''} ${files.length > 0 ? 'drop-zone--has-file' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => files.length === 0 && fileInputRef.current?.click()}
        id="drop-zone"
      >
        {files.length === 0 ? (
          <>
            <div className="drop-zone__icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="drop-zone__title">
              Drag &amp; Drop PDF files here
            </p>
            <p className="drop-zone__subtitle">OR</p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              id="choose-file-btn"
            >
              Choose Files
            </button>
            <p className="drop-zone__hint">Only .pdf files are accepted · Max 10 MB each · Up to {MAX_FILES} files</p>
          </>
        ) : (
          <div className="selected-files">
            <div className="selected-files__header">
              <div className="selected-files__summary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="selected-files__count">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </span>
                <span className="selected-files__total-size">
                  ({formatFileSize(totalSize)})
                </span>
              </div>
              <div className="selected-files__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  id="add-more-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add More
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm btn--danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  id="clear-all-btn"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="selected-files__list">
              {files.map((file, index) => (
                <div key={`${file.name}-${file.size}-${index}`} className="selected-file">
                  <div className="selected-file__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div className="selected-file__info">
                    <span className="selected-file__name">{file.name}</span>
                    <span className="selected-file__size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="selected-file__remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    title="Remove file"
                    id={`remove-file-btn-${index}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="drop-zone__input"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          multiple
          id="file-input"
        />
      </div>

      {/* Progress */}
      {uploading && (
        <div className="upload-progress" id="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="upload-progress__text">
            <div className="spinner" />
            <span>Uploading and parsing {files.length} resume{files.length !== 1 ? 's' : ''}…</span>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`upload-message upload-message--${messageType}`} id="upload-message">
          <span className="upload-message__icon">
            {messageType === 'success' && '✓'}
            {messageType === 'error' && '✕'}
            {messageType === 'warning' && '⚠'}
          </span>
          {message}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <button
          type="button"
          className="btn btn--primary btn--upload"
          onClick={handleUpload}
          disabled={uploading}
          id="upload-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Parse {files.length} Resume{files.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

export default ResumeUpload;
