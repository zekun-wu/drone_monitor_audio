import React, { useState, useRef, useEffect } from "react";
import { Login } from './components/Login';
import Questionnaire from "./components/Questionnaire";
import DroneMonitor from "./components/DroneMonitor";
import Calibration from "./components/Calibration";
import End from "./components/End";
import RestPage from './components/RestPage';
import GridMap from "./components/Grid";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [results, setResults] = useState([]);
  const [taskStarted, setTaskStarted] = useState(false);
  const [calibration, setCalibration] = useState(false);
  const [allTaskEnded, setallTaskEnded] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [endQuestionnaire, setEndQuestionnaire] = useState(false);
  const questionnaireRef = useRef();
  const [droneData, setDroneData] = useState({});
  const [allDronesCurrentData, setAllDronesCurrentData] = useState([]);
  const [spacebarTimestamps, setSpacebarTimestamps] = useState([]);
  const [gridSubmitResults, setGridSubmitResults] = useState([]);
  const [isRestPeriod, setIsRestPeriod] = useState(false);
  const [showGridMap, setShowGridMap] = useState(false);

  // test
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneCounter, setSceneCounter] = useState(4);
  const [interval, setIntervalCount] = useState(1);
  const [trial, setTrialCount] = useState(75);
  const final_task = 4;
  const sub_task = 20;

  const [taskData, setTaskData] = useState([]);
  const [selectedGrids, setSelectedGrids] = useState(new Set());
  const [userTrials, setUserTrials] = useState({});
  const [username, setUsername] = useState('');
  const [calculatedTrialNumber, setCalculatedTrialNumber] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  function padTrialNumber(trial) {
    return String(trial).padStart(4, '0');
  }

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

    const loadUserTrials = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/data/user_trials.json`);
        const data = await response.json();
        setUserTrials(data);
      } catch (error) {
        console.error("Error loading user trials data:", error);
      }
    };

    loadTaskData();
    loadUserTrials();
  }, []);

  const handleLogin = (userData) => {
    setResults((prevResults) => [...prevResults, userData]);
    setLoggedIn(true);
    setUsername(userData.username);
  };

  useEffect(() => {
    const loadAllDronesData = async (trialNumber) => {
      const droneData = [];
      const allDronesCurrentData = [];
      if (!trialNumber) return;

      for (let drone = 1; drone <= 4; drone++) {
        try {
          const paddedTrialNumber = padTrialNumber(trialNumber);
          const response = await fetch(`${process.env.PUBLIC_URL}/data/trials/${paddedTrialNumber}/${drone}.json`);
          if (!response.ok) {
            console.error(`Error fetching data for trial ${trialNumber} and drone ${drone}:`, response.status, response.statusText);
            continue;
          }
          const data = await response.json();
          droneData[drone - 1] = data;
          allDronesCurrentData[drone - 1] = data.timestamps[currentIndex];
        } catch (error) {
          console.error(`Error fetching data for scene ${trialNumber} and drone ${drone}:`, error);
        }
      }
      setDroneData(droneData);
      setAllDronesCurrentData(allDronesCurrentData);
      setDataLoaded(true); // Set dataLoaded to true when data is loaded
    };

    if (username && userTrials[`user${username}`]) {
      const calculateTrialNumber = () => {
        const userTrialData = userTrials[`user${username}`];
        const subListIndex = Math.floor((trial - 1) / sub_task);
        const subList = userTrialData[subListIndex];
        const elementIndex = trial- (sceneCounter - 1) * sub_task-1;
        return subList[elementIndex];
      };

      setCalculatedTrialNumber(calculateTrialNumber());
      loadAllDronesData(calculateTrialNumber());
    }
  }, [username, userTrials, trial, sceneCounter, currentIndex]);

  const playData = () => {
    if (showQuestionnaire) {
      return;
    }

    if (!taskStarted) {
      setCurrentIndex(0); // Set currentIndex to 0
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        if (newIndex >= droneData[0].timestamps.length) {
          clearInterval(timer);
          return prevIndex;
        }
        const updatedDronesData = allDronesCurrentData.map((data, index) => {
          return droneData[index].timestamps[newIndex];
        });

        setAllDronesCurrentData(updatedDronesData);

        return newIndex;
      });
    }, 1000 / 24);
    return timer;
  };

  useEffect(() => {
    const timerId = playData();

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [taskStarted, showQuestionnaire, currentIndex, endQuestionnaire]);

  const handleCalibration = () => {
    setSceneCounter(sceneCounter + 1);
    setTrialCount((prevTrial) => prevTrial + 1);
    setCurrentIndex(0);
    setCalibration(false);
  };

  const handleQuestionnaireSubmit = (currentResult) => {
    setResults((prevResults) => {
      const updatedResults = [
        ...prevResults,
        {
          ...currentResult,         
          trial: calculatedTrialNumber,
          interval: interval,
          task: sceneCounter
        }
      ];
      return updatedResults;
    });
    setShowQuestionnaire(false);
    if(trial % sub_task === 0){
      if (sceneCounter === final_task) {
        setallTaskEnded(true);
      } else {
        setCalibration(true); // Transition to Calibration page
        setEndQuestionnaire(true);
      }
    } else {
      setIsRestPeriod(true);
      setTimeout(() => {
        setIsRestPeriod(false);
        setCurrentIndex(0);
      }, 3000); // Rest period duration is 3 seconds
      setTaskStarted(true);
      setIntervalCount((prevInterval) => prevInterval + 1);
      setTrialCount((prevTrial) => prevTrial + 1);
      setCurrentIndex(0);
    }
  };

  const handleGridSubmit = (selectedGrids) => {
    console.log('Selected grids:', selectedGrids);
    // Save grid submit results with the same metadata structure
    setGridSubmitResults((prevResults) => [
      ...prevResults,
      {
        selectedGrids: Array.from(selectedGrids),
        trial: calculatedTrialNumber,
        interval: interval,
        task: sceneCounter
      }
    ]);

    setShowGridMap(false);
    if(trial % sub_task === 0){
      if (sceneCounter === final_task) {
        setallTaskEnded(true);
      } else {
        setCalibration(true); // Transition to Calibration page
      }
    } else {
      setIsRestPeriod(true);
      setTimeout(() => {
        setIsRestPeriod(false);
        setCurrentIndex(0);
      }, 3000); // Rest period duration is 3 seconds
      setTaskStarted(true);
      setIntervalCount((prevInterval) => prevInterval + 1);
      setTrialCount((prevTrial) => prevTrial + 1);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    if (taskStarted && currentIndex !== 0 && (currentIndex + 1) % droneData[0].timestamps.length === 0) {
      const trialData = taskData.find(data => data['Trial Number'] === calculatedTrialNumber);
      setTaskStarted(false);
      console.log('calculatedTrialNumber',calculatedTrialNumber)
      console.log('trial',trial)
      if (trialData) {
        if (trialData.Question === 1) {
          setShowQuestionnaire(true);
          setTaskStarted(false);
        } else if (trialData.Map === 1) {
          setShowGridMap(true);
          setTaskStarted(false);
        } else {
          if(trial % sub_task === 0){
            if (sceneCounter === final_task) {
              setallTaskEnded(true);
            } else {
              setCalibration(true); // Transition to Calibration page
              setEndQuestionnaire(true);
            }
          } else {
            setIsRestPeriod(true);
            setTimeout(() => {
              setIsRestPeriod(false);
              setCurrentIndex(0);
            }, 3000); // Rest period duration is 3 seconds
            setTaskStarted(true);
            setIntervalCount((prevInterval) => prevInterval + 1);
            setTrialCount((prevTrial) => prevTrial + 1);
            setCurrentIndex(0);
          }
        }
      }
    }
  }, [taskStarted, currentIndex, droneData, taskData, trial]);

  useEffect(() => {
    setIntervalCount(1); // reset interval count when scene changes
  }, [sceneCounter]);

useEffect(()=>{
  console.log('spacebarTimestamps',spacebarTimestamps)
},[spacebarTimestamps])

  return (
    <div className="App">
      <div className={loggedIn && !showQuestionnaire ? "app_container no-scroll" : "app_container"}>
        {!loggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {calibration ? (
              <Calibration />
            ) : allTaskEnded ? (
              <End results={results} spacebarTimestamps={spacebarTimestamps} gridSubmitResults={gridSubmitResults} />
            ) : showGridMap ? (
              <GridMap 
                onGridSubmit={handleGridSubmit}
                taskNo={sceneCounter}
                interval={interval}
              />
            ) : showQuestionnaire ? (
              <Questionnaire
                ref={questionnaireRef}
                onSubmit={handleQuestionnaireSubmit}
              />
            ) : isRestPeriod ? (
              <RestPage />
            ) : dataLoaded ? ( // Only render DroneMonitor if data is loaded
              <DroneMonitor
                key={sceneCounter}
                trial={trial}
                calculatedTrial={calculatedTrialNumber}
                taskStarted={taskStarted}
                sceneCounter={sceneCounter}
                currentIndex={currentIndex}
                currentData={allDronesCurrentData}
                setSpacebarTimestamps={setSpacebarTimestamps}
                interval={interval}
              />
            ) : (
              <div>Loading data...</div>
            )}
            <div className="content-wrapper">
              <h3>Current Task: {sceneCounter}</h3>
              <div className="button-container">
                {showQuestionnaire ? (
                  <button type="submit" onClick={() => questionnaireRef.current && questionnaireRef.current.handleSubmit()}>
                    Submit and Proceed
                  </button>
                ) : calibration ? (
                  <button onClick={handleCalibration}>Next</button>
                ) : (
                  !allTaskEnded && !taskStarted && !showGridMap && !isRestPeriod && (
                    <button onClick={() => setTaskStarted(true)}>Start</button>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
