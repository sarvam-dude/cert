import React from 'react';

const ProgressBar = ({ progress, className = '' }) => {
  return (
    <div className={`progress-bar ${className}`}>
      <div 
        className="progress-fill"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;