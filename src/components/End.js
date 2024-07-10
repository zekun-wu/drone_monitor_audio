import React from 'react';
import './End.css';

const End = ({ results, spacebarTimestamps }) => {
  const handleDownload = () => {
    // Merge spacebarTimestamps with existing results
    const mergedResults = {
      ...results,
      spacebar_timestamps: spacebarTimestamps.map(({ timestamp, interval, task }) => ({
        timestamp,
        interval,
        task
      })),
    };

    // Download results as JSON file
    const json = JSON.stringify(mergedResults);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'results.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='endContainer'>
      <h2 className='endTitle'>
        Thank you for completing all the monitoring tasks!
      </h2>
      <button className='downloadButton' onClick={handleDownload}>
        Download Results
      </button>
    </div>
  );
};

export default End;