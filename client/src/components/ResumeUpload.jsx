import { useState, useRef, useCallback } from 'react';
import { uploadResumes } from '../services/resumeService';
import ProgressBar from './ProgressBar';
import LoadingSpinner from './LoadingSpinner';
import './ResumeUpload.css';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' | 'error' | 'warning'
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const clearMessage = () => {
    setMessage(null);
    setMessageType('');
  };

  const validateFiles = (incoming) => {
    const valid = [];
    const rejected = [];

    Array.from(incoming).forEach((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (file.type === 'application/pdf' && ext === 'pdf') {
        // Avoid duplicates
        if (!files.some((f) => f.name === file.name && f.size === file.size)) {
          valid.push(file);
        }
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length > 0) {
      setMessage(
        `Only PDF files are allowed. Rejected: ${rejected.join(', ')}`
      );
      setMessageType('warning');
    }

    return valid;
  };

  const handleFilesSelected = (incoming) => {
    clearMessage();
    const valid = validateFiles(incoming);
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
    }
  };

  const handleInputChange = (e) => {
    handleFilesSelected(e.target.files);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
        handleFilesSelected(e.dataTransfer.files);
      }
    },
    [files]
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

      setMessage(response.data.message || 'Resumes uploaded successfully!');
      setMessageType('success');
      setFiles([]);
      setProgress(100);
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

  return (
    <div className="upload-container">
      {/* Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? 'drop-zone--active' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="drop-zone"
      >
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
          id="choose-files-btn"
        >
          Choose Files
        </button>
        <p className="drop-zone__hint">Only .pdf files are accepted</p>
        <input
          type="file"
          ref={fileInputRef}
          className="drop-zone__input"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleInputChange}
          id="file-input"
        />
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="file-list" id="file-list">
          <h3 className="file-list__title">
            Selected Files
            <span className="file-list__count">{files.length}</span>
          </h3>
          <ul className="file-list__items">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="file-item">
                <div className="file-item__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="file-item__info">
                  <span className="file-item__name">{file.name}</span>
                  <span className="file-item__size">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  className="file-item__remove"
                  onClick={() => handleRemoveFile(index)}
                  title="Remove file"
                  id={`remove-file-${index}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <div className="upload-progress" id="upload-progress">
          <ProgressBar percent={progress} />
          <LoadingSpinner size={28} text="Uploading and processing resumes…" />
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
          Upload {files.length} Resume{files.length > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

export default ResumeUpload;
