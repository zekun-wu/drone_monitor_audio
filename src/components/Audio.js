import React, { useEffect, useRef } from 'react';

const Audio = ({ alarms, alarmInfo, currentIndex }) => {
  const lastTriggeredIndex = useRef(null); // Track the last index at which the alarm was triggered

  useEffect(() => {
    if (!alarmInfo) return;

    const [alarmType, noCritical] = alarmInfo;
    const alarmTimestamps = [noCritical * 24, (noCritical + 2) * 24, (noCritical + 4) * 24];

    // console.log("Current index:", currentIndex);
    // console.log("Alarm info:", alarmInfo);
    // console.log("Alarm timestamps:", alarmTimestamps);
    // console.log("Alarm type:", alarmType);

    if ((alarmType === 'A' || alarmType === 'V/A') && alarmTimestamps.includes(currentIndex) && lastTriggeredIndex.current !== currentIndex) {
      let droneNumber = null;
      let iconType = null;

      // Find the drone with the alarm and determine the icon type
      for (let i = 0; i < alarms.length; i++) {
        if (alarms[i] !== 0) {
          droneNumber = i + 1; // Drone numbers are 1-based
          switch (alarms[i]) {
            case 1:
              iconType = 'low battery';
              break;
            case 2:
              iconType = 'extreme wind';
              break;
            case 3:
              iconType = 'rotor off';
              break;
            case 4:
              iconType = 'no-fly zone';
              break;
            default:
              console.log("No valid alarm found.");
              return;
          }
          break; // Exit the loop once the first non-zero alarm is found
        }
      }

      if (droneNumber && iconType) {
        const text = `Drone ${droneNumber}, ${iconType}.`;
        // console.log("Speaking text:", text);
        speak(text);
        lastTriggeredIndex.current = currentIndex; // Update the last triggered index
      }
    }
  }, [alarms, alarmInfo, currentIndex]);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
    // console.log("Speaking:", text);
  };

  return null; // This component does not render anything visually
};

export default Audio;
