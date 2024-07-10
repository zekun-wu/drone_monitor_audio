import React, { useState, useEffect } from 'react';
import './RestPage.css'; // Import the CSS file

const RestPage = () => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="rest-page">
      <p className="countdown-text" style={{ animation: 'fade-in-out 1s linear' }}>
        {countdown}
      </p>
      <p className="static-text">
        The next monitoring task will begin soon!
      </p>
    </div>
  );
};

export default RestPage;
