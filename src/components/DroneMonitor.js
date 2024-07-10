import React, { useState, useRef,useEffect, useMemo, useCallback } from 'react';
import DroneBlock from './DroneBlock';
import Audio from './Audio'; // Import the new Audio component
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './DroneMonitor.css';
import droneIconImg from './icons/zone/fly.png';

const DroneMonitor = ({  key, taskStarted, sceneCounter, currentIndex, currentData, droneData, setSpacebarTimestamps, interval, alarm, alarmInfo}) => {
  console.log('currentIndex',currentIndex)
  // console.log('currentData',currentData)

  const droneBlocks = new Array(4).fill(null);
  const [dataPlayed, setDataPlayed] = useState(false); 
  const [initialPositions, setInitialPositions] = useState({});

  const mapRef = useRef(null); // Add this ref
  const markersRef = useRef([]);

  const createDroneIcon = (droneNumber) => {
    const droneIconDiv = L.DomUtil.create('div', 'drone-icon-container');
    droneIconDiv.innerHTML = `
      <img src="${droneIconImg}" alt="Drone Icon" class="drone-icon" />
      <span class="drone-icon-number">${droneNumber}</span>
    `;
  
    return L.divIcon({
      html: droneIconDiv.innerHTML,
      iconSize: [30, 30], // Increase the icon size to 30x30
      iconAnchor: [15, 15], // Update the icon anchor to be centered
      className: 'drone-custom-icon',
    });
  };


  const handleSpacebarPress = (event) => {
    if (event.code === 'Space') {
      setSpacebarTimestamps((prevTimestamps) => [
        ...prevTimestamps, 
        {
          timestamp:currentIndex,
          interval:parseInt(currentIndex/(24*15))+1,
          task:sceneCounter
        }
      ]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSpacebarPress);
    return () => {
      window.removeEventListener('keydown', handleSpacebarPress);
    };
  }, []);

  return (
    <div className="drone-monitor-container">
      <div className="container">
        {!droneData[sceneCounter] ? (
          <p>Loading...</p>
        ) : (
          droneBlocks.slice(0, 4).map((_, index) => (
            <DroneBlock
              droneData={droneData[index]}
              droneNumber={index + 1}
              alarm={alarm}
              alarmInfo={alarmInfo}
              isFrozen={!taskStarted}
              latestData={currentData[index]}
              sceneCounter={sceneCounter}
              interval={interval}
            />
          ))
        )}
        <Audio alarm={alarm} taskStarted={taskStarted} sceneCounter={sceneCounter}  interval={interval} currentIndex={currentIndex}/>
      </div>
    </div>
  );
};
  
export default DroneMonitor;




