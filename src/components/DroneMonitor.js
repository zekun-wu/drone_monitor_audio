import React, { useState, useRef,useEffect, useMemo, useCallback } from 'react';
import DroneBlock from './DroneBlock';
import Audio from './Audio'; // Import the new Audio component
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './DroneMonitor.css';
import droneIconImg from './icons/zone/fly.png';

const DroneMonitor = ({  key, trial, calculatedTrial, taskStarted, sceneCounter, currentIndex, currentData, setSpacebarTimestamps, interval}) => {
  // console.log('currentIndex',currentIndex)
  // console.log('trial',trial)
  // console.log('currentData',currentData)


  const [taskData, setTaskData] = useState([]);
  const [alarms, setAlarm] = useState([]);
  const [alarmInfo, setAlarmInfo] = useState([]);

  const droneBlocks = new Array(4).fill(null);
  const [dataPlayed, setDataPlayed] = useState(false); 
  const [initialPositions, setInitialPositions] = useState({});

  const mapRef = useRef(null); // Add this ref
  const markersRef = useRef([]);

    // Load the task data JSON
    useEffect(() => {
      const loadTaskData = async () => {
        try {
          const response = await fetch(`${process.env.PUBLIC_URL}/data/task(audio).json`);
          const data = await response.json();
          setTaskData(data);
        } catch (error) {
          console.error("Error loading task data:", error);
        }
      };
  
      loadTaskData();
    }, []);
  

      // Update alarm and alarm info based on the current trial and currentIndex
    useEffect(() => {
      const trialData = taskData.find(data => data['Trial Number'] === calculatedTrial);
      if (trialData) {
        const alarms = [trialData.A1, trialData.A2, trialData.A3, trialData.A4];
        const alarmInfo = [trialData.Alarm, trialData['No Critical']];
        setAlarm(alarms);
        setAlarmInfo(alarmInfo); 
      }
    }, [taskData, trial, currentIndex]);

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

  const setInitialDronePositions = () => {

    if (!mapRef.current) return;

    const newInitialPositions = {};
    for (let index = 0; index < 4; index++) {
      const drone= currentData[index];
      if (!drone) continue;
      if (!drone.latitude || !drone.longitude) continue;
  
      const marker = L.marker([drone.latitude, drone.longitude], {
        icon: createDroneIcon(index + 1),
      });
  
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
  
      newInitialPositions[index + 1] = [drone.latitude, drone.longitude];
    }
    setInitialPositions(newInitialPositions);
  };

  const createGrid = (map) => {
    const bounds = map.getBounds();
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();

    const latStep = (northEast.lat - southWest.lat) / 5;
    const lngStep = (northEast.lng - southWest.lng) / 5;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const rect = [
          [southWest.lat + i * latStep, southWest.lng + j * lngStep],
          [southWest.lat + (i + 1) * latStep, southWest.lng + (j + 1) * lngStep]
        ];

        L.rectangle(rect, { color: '#000', weight: 0.5, opacity: 0.5 }).addTo(map);
      }
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      if (mapRef.current) return;

      const mapContainer = document.getElementById("map");
      if (!mapContainer) return;

      // Create LatLng objects for the corners
      var southWest = L.latLng(49.198, 6.936);
      var northEast = L.latLng(49.280, 7.068);
      var bounds = L.latLngBounds(southWest, northEast);

      const map = L.map(mapContainer, {
        maxBounds: bounds,
        center: [51.505, -0.09],
        zoom: 13,
        dragging: false, // Disable map dragging
        scrollWheelZoom: false, // Disable scroll wheel zoom
        zoomControl: false, // Disable zoom control buttons
      });

      map.setView([49.239, 7.002], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;

      createGrid(map); // Add grid to the map

      setInitialDronePositions();

      return () => {
          map.remove(); // Use Leaflet's map.remove() method for cleanup
      };
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (!taskStarted) {
      setInitialDronePositions();
    }
  }, [sceneCounter, taskStarted]);

  const updateMarkers = (timestampIndex) => {
    if (currentData?.question === 1) return; 
  
    // Remove existing markers
    markersRef.current.forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
  
    // Create new markers for each drone
    markersRef.current = [];
    for (let index = 0; index < 4; index++) {
      // const timestamps = droneData[index].timestamps;
  
  
      const drone = currentData[index];

      // console.log('drone',drone)
  
      if (!drone || !drone.latitude || !drone.longitude) continue;
  
      const marker = L.marker([drone.latitude, drone.longitude], {
        icon: createDroneIcon(index + 1),

      });
  
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    }
  };

  useEffect(() => {  
    if (
      mapRef.current &&
      (taskStarted || Object.keys(initialPositions).length > 0)
    ) {
      updateMarkers(currentIndex);
    }
  }, [currentIndex, taskStarted, sceneCounter]);

  useEffect(() => {
    if (mapRef.current && taskStarted) {
        updateMarkers(currentIndex);
    }
  }, [mapRef, currentIndex, taskStarted]);


  const handleSpacebarPress = (event) => {
    if (event.code === 'Space') {
      // Play sound feedback
      const audio = new window.Audio(`${process.env.PUBLIC_URL}/sound/beep.mp3`);
      audio.play();

      // Save timestamp and other data
      setSpacebarTimestamps((prevTimestamps) => [
        ...prevTimestamps,
        {
          timestamp: currentIndex,
          trial: calculatedTrial,
          interval: interval,
          task: sceneCounter
        }
      ]);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleSpacebarPress);
    return () => {
      window.removeEventListener('keydown', handleSpacebarPress);
    };
  }, [currentIndex, calculatedTrial, interval, sceneCounter]);
  


  return (
    <div className="drone-monitor-container">
      <div className="container">
        {!currentData? (
          <p>Loading...</p>
        ) : (
          droneBlocks.slice(0, 4).map((_, index) => (
            <DroneBlock
              droneNumber={index + 1}
              alarm={alarms[index]}
              alarmInfo={alarmInfo}
              isFrozen={!taskStarted}
              latestData={currentData[index]}
              sceneCounter={sceneCounter}
              interval={interval}
            />
          ))
        )}
        <Audio alarms={alarms} alarmInfo={alarmInfo} currentIndex={currentIndex}/>
      </div>
      <div className="map-container">
          <div id="map" style={{ width: '100%', height: '100%' }}></div>
        </div>
    </div>
  );
};
  
export default DroneMonitor;




