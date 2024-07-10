import React, { useEffect, useState, useRef } from 'react';

const Audio = ({ alarm, taskStarted, sceneCounter, currentIndex, interval }) => {
  const [jsonData, setJsonData] = useState([]);
  const playedAlarms = useRef(new Set());
  const alarmTimestamps = [120, 168, 216, 264, 312, 360];

  // Load the JSON file
  useEffect(() => {
    const loadJson = async () => {
      const response = await fetch(`${process.env.PUBLIC_URL}/data/alarm_high.json`);
      const data = await response.json();
      setJsonData(data);
    };

    loadJson();
  }, []);

  useEffect(() => {
    const speakAlarm = () => {
      const utterance = new SpeechSynthesisUtterance('alarm');
      utterance.rate = 0.5; // Adjust the rate to slow down the speech
      window.speechSynthesis.speak(utterance);
    };

    if (alarm !== 2 && alarm !== 3) {
      return;
    }

    const timestampMod = currentIndex % 360;

    if (alarmTimestamps.includes(timestampMod)) {
      const alarmKey = `${sceneCounter}-${currentIndex}`;
      if (!playedAlarms.current.has(alarmKey)) {

        const matchedRow = jsonData.find(row => parseInt(row['Task No']) === sceneCounter && parseInt(row['Interval']) === interval);
        if (matchedRow && parseInt(matchedRow['Alarm']) !== 0) {
          speakAlarm();
          playedAlarms.current.add(alarmKey);
        }
      }
    }
  }, [alarm, taskStarted, sceneCounter, currentIndex, interval, jsonData]);

  return null;
};

export default Audio;