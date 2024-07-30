import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './Questionnaire.css'; // Ensure to create this CSS file

const Questionnaire = forwardRef(({ onSubmit }, ref) => {
  const [rating, setRating] = useState(null);

  useImperativeHandle(ref, () => ({
    handleSubmit() {
      if (rating !== null) {
        onSubmit({ rating });
      } else {
        alert('Please select a rating before submitting.');
      }
    }
  }));

  return (
    <div className="questionnaire-container">
      <h2 className="questionnaire-title">Questionnaire</h2>
      <p className="questionnaire-prompt">I relied on the AI-assisted alarm in the previous task trial.</p>
      <div className="rating-scale">
        {[1, 2, 3, 4, 5].map(value => (
          <label key={value} className="rating-label">
            <input
              type="radio"
              name="rating"
              value={value}
              checked={rating === String(value)}
              onChange={(e) => setRating(e.target.value)}
              className="rating-input"
            />
            {value} ({['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'][value - 1]})
          </label>
        ))}
      </div>
    </div>
  );
});

export default Questionnaire;
