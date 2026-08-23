import './ResumeViewer.css';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeViewer = ({ data, onReset }) => {
  if (!data) return null;

  return (
    <div className="viewer" id="resume-viewer">
      {/* Header Card */}
      <div className="viewer__header">
        <div className="viewer__header-top">
          <div className="viewer__header-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="viewer__header-info">
            <h2 className="viewer__filename">{data.fileName}</h2>
            <div className="viewer__meta">
              <span className="viewer__meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {formatFileSize(data.fileSize)}
              </span>
              <span className="viewer__meta-divider">·</span>
              <span className="viewer__meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="18" rx="2" />
                  <line x1="2" y1="9" x2="22" y2="9" />
                </svg>
                {data.pages} {data.pages === 1 ? 'page' : 'pages'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--ghost viewer__new-btn"
            onClick={onReset}
            id="upload-new-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload New
          </button>
        </div>
      </div>

      {/* Extracted Text */}
      <div className="viewer__content">
        <div className="viewer__content-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Extracted Content
          <span className="viewer__char-count">
            {data.text.length.toLocaleString()} characters
          </span>
        </div>
        {data.text ? (
          <div className="viewer__text" id="extracted-text">
            {data.text}
          </div>
        ) : (
          <div className="viewer__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>No readable text was found in this PDF.</p>
            <p className="viewer__empty-hint">The PDF might be image-based or contain only non-text elements.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeViewer;
