import './ProgressBar.css';

const ProgressBar = ({ percent = 0 }) => {
  return (
    <div className="progress-bar-wrapper">
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="progress-bar-label">{percent}%</span>
    </div>
  );
};

export default ProgressBar;
