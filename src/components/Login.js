import React, { useState } from "react";

export function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState('');
  const [alarm, setAlarm] = useState(0);

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ username, gender, age, experience, alarm: parseInt(alarm) });
  };

  return (
    <div className="app_container">
      <h1>Welcome to the Drone Monitor Task</h1>
      <div className="form_container">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Participant Number (0-100): </label>
            <input type="number" value={username} onChange={e => setUsername(e.target.value)} required min="0" max="100" />
          </div>
          <div>
            <label>Gender: </label>
            <select value={gender} onChange={e => setGender(e.target.value)} required>
              <option value="">Select...</option>
              <option value="m">M</option>
              <option value="f">F</option>
              <option value="prefer not to respond">Prefer not to respond</option>
            </select>
          </div>
          <div>
            <label>Age: </label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} required min="1" />
          </div>
          <div>
            <label>Drone Operation Experience (1-5): </label>
            <input type="number" value={experience} onChange={e => setExperience(e.target.value)} required min="1" max="5" />
            <p>Note: 1 for no experience and 5 for full experience</p>
          </div>
          <div>
            <label>Alarm: </label>
            <select value={alarm} onChange={e => setAlarm(e.target.value)} required>
              <option value="0">None</option>
              <option value="1">Visual</option>
              <option value="2">Audio</option>
              <option value="3">Mixed</option>
            </select>
          </div>
          <div className="button-wrapper">
            <button type="submit">Log In</button>
          </div>
        </form>
      </div>
    </div>
  );
}
