import { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import ResumeViewer from './components/ResumeViewer';
import './index.css';

function App() {
  const [parsedResume, setParsedResume] = useState(null);

  const handleParsed = (data) => {
    setParsedResume(data);
  };

  const handleReset = () => {
    setParsedResume(null);
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* Header */}
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
              <h1 className="app-header__title">Resume Parser</h1>
              <span className="app-header__tagline">Upload · Parse · View</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content" id="main-content">
          {!parsedResume ? (
            <div className="page">
              <div className="page__header">
                <h2 className="page__title">Upload Resume</h2>
                <p className="page__subtitle">
                  Upload a PDF resume to extract and display its content
                </p>
              </div>
              <ResumeUpload onParsed={handleParsed} />
            </div>
          ) : (
            <div className="page">
              <div className="page__header">
                <h2 className="page__title">Parsed Resume</h2>
                <p className="page__subtitle">
                  Extracted content from your uploaded resume
                </p>
              </div>
              <ResumeViewer data={parsedResume} onReset={handleReset} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <span className="app-footer__text">Resume Parser · PDF to Text</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
