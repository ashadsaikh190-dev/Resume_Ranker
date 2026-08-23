import { useState, useRef, useCallback } from 'react';
import { uploadResume } from '../services/resumeService';
import './ResumeUpload.css';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeUpload = ({ onParsed }) => {
  const [file, setFile] = useState(null);
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
    setMessage('Only PDF files are allowed.');
    setMessageType('warning');
    return false;
  };

  const handleFileSelected = (incoming) => {
    clearMessage();
    const selected = incoming[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files);
    }
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setFile(null);
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
        handleFileSelected(e.dataTransfer.files);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a PDF resume.');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setProgress(0);
    clearMessage();

    try {
      const response = await uploadResume(file, (percent) => {
        setProgress(percent);
      });

      setMessage('Resume parsed successfully!');
      setMessageType('success');
      setProgress(100);

      // Pass parsed data to parent
      if (onParsed && response.data.resume) {
        onParsed(response.data.resume);
      }

      setFile(null);
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
        className={`drop-zone ${dragActive ? 'drop-zone--active' : ''} ${file ? 'drop-zone--has-file' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        id="drop-zone"
      >
        {!file ? (
          <>
            <div className="drop-zone__icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="drop-zone__title">
              Drag &amp; Drop a PDF file here
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
              Choose File
            </button>
            <p className="drop-zone__hint">Only .pdf files are accepted · Max 10 MB</p>
          </>
        ) : (
          <div className="selected-file">
            <div className="selected-file__icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                handleRemoveFile();
              }}
              title="Remove file"
              id="remove-file-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="drop-zone__input"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
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
            <span>Uploading and parsing resume…</span>
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
      {file && !uploading && (
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
          Parse Resume
        </button>
      )}
    </div>
  );
};

export default ResumeUpload;
