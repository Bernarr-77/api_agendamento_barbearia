import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 40, text = '' }) {
  return (
    <div className="spinner-container" id="loading-spinner">
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 50 50"
      >
        <circle
          className="spinner-track"
          cx="25" cy="25" r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="spinner-head"
          cx="25" cy="25" r="20"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
