import React from 'react';

const Calibration = ({ onFinish }) => {
  const handleCalibration = () => {
    // Add any calibration logic here

    // Call onFinish function passed from App component
    onFinish();
  };

  return (
    <div className="calibration-page">
      <h2>Calibration</h2>
      {/* Add any calibration-related elements here */}
    </div>
  );
};

export default Calibration;
