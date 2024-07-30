import React, { useState, useEffect, useMemo, useRef } from 'react';
import './DroneMonitor.css';
import rotorIcon from './icons/rotor.png';
import cameraIcon from './icons/camera.png';
import weatherIcon from './icons/weather.png';
import sunIcon from './icons/weather/sun.png';
import rainIcon from './icons/weather/rain.png';
import snowIcon from './icons/weather/snow.png';
import fogIcon from './icons/weather/fog.png';
import extremeIcon from './icons/weather/extreme_weather.png';
import windIcon from './icons/wind.png';
import landingIcon from './icons/landing.png';
import flyIcon from './icons/zone/fly.png';
import noflyIcon from './icons/zone/no_fly.png';
import speedIcon from './icons/speed.png';
import horizontalIcon from './icons/speed/horizontal.png';
import verticalIcon from './icons/speed/vertical.png';
import batteryIcon from './icons/battery.png';
import altitudeIcon from './icons/altitude.png';
import distanceIcon from './icons/distance.png';
import elapsedIcon from './icons/elapsed.png';

const DroneBlock = ({ droneNumber, isFrozen, latestData, alarm, alarmInfo, sceneCounter, interval }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    let criticalTime = Number(alarmInfo[1]);
    if (isNaN(criticalTime)) {
      criticalTime = 0;
    }
    criticalTime = criticalTime * 24 - 1;

    const intervals = [
      { start: criticalTime, end: criticalTime + 24 },
      { start: criticalTime + 24 * 2, end: criticalTime + 24 * 3 },
      { start: criticalTime + 24 * 4, end: criticalTime + 24 * 5 },
      { start: criticalTime + 24 * 6, end: criticalTime + 24 * 7 },
      { start: criticalTime + 24 * 8, end: criticalTime + 24 * 9 },
    ];
  
    const shouldBlink = intervals.some(interval => latestData['time'] > interval.start && latestData['time'] < interval.end);
  

    if (alarm !== 0 && (alarmInfo[0] === "V" || alarmInfo[0] === "V/A") && shouldBlink) {
      setIsBlinking(true)
    } else {
      setIsBlinking(false);
    }

  }, [alarm, alarmInfo, latestData]);

  const weatherIcons = [
    { value: "sunny", icon: sunIcon },
    { value: "rainy", icon: rainIcon },
    { value: "snowy", icon: snowIcon },
    { value: "foggy", icon: fogIcon },
    { value: "extreme", icon: extremeIcon },
  ];

  const icons = [
    { name: 'battery', icon: batteryIcon },
    { name: 'wind', icon: windIcon },
    { name: 'horizontal_speed', icon: horizontalIcon },
    { name: 'rotor', icon: rotorIcon },
    { name: 'zone', icon: flyIcon },
    { name: 'vertical_speed', icon: verticalIcon },
    { name: 'altitude', icon: altitudeIcon },
    { name: 'distance', icon: distanceIcon }
  ];

  const iconHighlightMapping = {
    1: 'battery',
    2: 'wind',
    3: 'rotor',
    4: 'zone'
  };

  const getIconValue = useMemo(() => {
    const iconValues = {
      rotor: () => {
        const value = latestData.rotor === 1 ? 'working' : (latestData.rotor === 0 ? 'off' : 'unknown');
        return { value };
      },
      weather: () => {
        const icon = weatherIcons[latestData.weather] || { value: 'unknown' };
        return icon;
      },
      wind: () => {
        const value = latestData.wind ? (latestData.wind).toFixed(1) + 'm/s' : 'unknown';
        return { value };
      },
      battery: () => {
        const value = latestData.battery ? (100 * latestData.battery).toFixed(0) + '%' : 'unknown';
        return { value };
      },
      horizontal_speed: () => {
        const value = latestData.horizontal_speed ? (latestData.horizontal_speed).toFixed(0) + 'm/s' : 'unknown';
        return { value };
      },
      vertical_speed: () => {
        const value = latestData.vertical_speed !== undefined && latestData.vertical_speed !== null ? (latestData.vertical_speed).toFixed(1) + 'm/s' : 'unknown';
        return { value };
      },
      altitude: () => {
        const value = latestData.altitude !== undefined && latestData.altitude !== null ? (latestData.altitude).toFixed(0) + 'm' : 'unknown';
        return { value };
      },
      distance: () => {
        const value = latestData.distance ? latestData.distance.toFixed(0) + 'm' : 'unknown';
        return { value };
      },
      time: () => {
        const value = latestData.time ? latestData.time.toFixed(0) + 's' : 'unknown';
        return { value };
      },
      camera: () => {
        const value = latestData.camera === 1 ? 'working' : 'MALF';
        return { value };
      },
      landing: () => {
        const value = latestData.landing === 1 ? 'possible' : 'not possible';
        return { value };
      },
      zone: () => {
        const value = latestData.zone === 1 ? 'fly zone' : (latestData.zone === 0 ? 'no-fly' : 'unknown');
        return { value };
      },
    };

    return (iconKey) => {
      const iconValue = iconValues[iconKey];
      if (!iconValue) {
        return { value: 'unknown' };
      }
      const result = iconValue();
      if (result.value === undefined) {
        return { value: 'unknown' };
      }
      return result;
    };
  }, [latestData]);

  const IconComponent = ({ iconData }) => {
    const { name, icon } = iconData;
    const { value } = getIconValue(name);

    const isHighlighted = iconHighlightMapping[alarm] === name && isBlinking;


    return (
      <div className="icon-wrapper">
        <div
          className={`icon ${isHighlighted ? 'blink-yellow' : ''} `}
          title={`${name}: ${latestData[name] || 0}`}
          style={{
            backgroundImage: `url(${icon})`,
          }}
        ></div>
        <span className="icon-text">{value}</span>
      </div>
    );
  };

  return (
    <div className="drone-block">
      <div className="drone-number">Drone {droneNumber}</div>
      <div className="icon-grid">
        {icons.slice(0, 8).map((iconData, index) => (
          <IconComponent key={index} iconData={iconData} />
        ))}
      </div>
    </div>
  );
};

export default DroneBlock;
