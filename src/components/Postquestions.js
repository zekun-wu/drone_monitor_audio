import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './PostQuestionnaire.css';

const questions = [
  "The AI system accurately detected critical situations.",
  "The AI system's alerts were clear and easy to understand.",
  "I felt confident in the AI system's capabilities.",
  "The AI system was reliable in its performance.",
  "I trusted the AI system's recommendations.",
  "I was able to understand why the AI system provided certain alerts.",
  "The AI system sometimes gave incorrect alerts."
];

const options = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Rather disagree" },
  { value: 3, label: "Neither disagree nor agree" },
  { value: 4, label: "Rather agree" },
  { value: 5, label: "Strongly agree" }
];

const PostQuestionnaire = forwardRef(({ onSubmit, sceneCounter }, ref) => {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));

  useImperativeHandle(ref, () => ({
    handleSubmit() {
      if (answers.every(answer => answer !== null)) {
        onSubmit({ answers, sceneCounter });
      } else {
        alert('Please answer all the questions before submitting.');
      }
    }
  }));

  const handleOptionChange = (questionIndex, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmitButtonClick = () => {
    if (answers.every(answer => answer !== null)) {
      onSubmit({ answers, sceneCounter });
    } else {
      alert('Please answer all the questions before submitting.');
    }
  };

  return (
    <div className="post-questionnaire-container">
      <h2 className="post-questionnaire-title">Post-Experiment Questionnaire</h2>
      <p className="post-questionnaire-note">
        Please rate your agreement with the following statements, where 1 means "Strongly disagree", 2 means "Disagree", 3 means "Neutral", 4 means "Agree" and 5 means "Strongly agree".
      </p>
      {questions.map((question, index) => (
        <div key={index} className="post-question-container">
          <p className="post-question-prompt">{question}</p>
          <div className="post-rating-scale">
            {options.map(option => (
              <label key={option.value} className="post-rating-label">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option.value}
                  checked={answers[index] === option.value}
                  onChange={() => handleOptionChange(index, option.value)}
                  className="post-rating-input"
                />
                <span className="post-rating-value">{option.value}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="button-container">
        <button type="submit" onClick={handleSubmitButtonClick}>
          Submit and Proceed
        </button>
      </div>
    </div>
  );
});

export default PostQuestionnaire;
