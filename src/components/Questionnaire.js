import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './Questionnaire.css'; // Ensure to create this CSS file

const Questionnaire = forwardRef(({ onSubmit }, ref) => {
  const [relianceRating, setRelianceRating] = useState(null);
  const [trustRating, setTrustRating] = useState(null);

  useImperativeHandle(ref, () => ({
    handleSubmit() {
      if (relianceRating !== null && trustRating !== null) {
        onSubmit({ relianceRating, trustRating });
      } else {
        alert('Please select a rating for both questions before submitting.');
      }
    }
  }));

  return (
    <div className="questionnaire-container">
      <h2 className="questionnaire-title">Questionnaire</h2>
      
      <div className="question-container">
        <p className="questionnaire-prompt">I relied on the AI-assisted alarm in the previous task trial.</p>
        <div className="rating-scale">
          {[1, 2, 3, 4, 5].map(value => (
            <label key={value} className="rating-label">
              <input
                type="radio"
                name="reliance-rating"
                value={value}
                checked={relianceRating === String(value)}
                onChange={(e) => setRelianceRating(e.target.value)}
                className="rating-input"
              />
              <span className="rating-value">{value} ({['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'][value - 1]})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="question-container">
        <p className="questionnaire-prompt">I trust the AI-assisted alarm in the previous task trial.</p>
        <div className="rating-scale">
          {[1, 2, 3, 4, 5].map(value => (
            <label key={value} className="rating-label">
              <input
                type="radio"
                name="trust-rating"
                value={value}
                checked={trustRating === String(value)}
                onChange={(e) => setTrustRating(e.target.value)}
                className="rating-input"
              />
              <span className="rating-value">{value} ({['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'][value - 1]})</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Questionnaire;
