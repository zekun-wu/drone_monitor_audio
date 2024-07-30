import React, { useState } from 'react';
import './GridMap.css';

const GridMap = ({ onGridSubmit, taskNo, interval }) => {
  const [selectedGrids, setSelectedGrids] = useState(new Set());

  const handleGridClick = (gridId) => {
    setSelectedGrids((prevSelectedGrids) => {
      const newSelectedGrids = new Set(prevSelectedGrids);
      if (newSelectedGrids.has(gridId)) {
        newSelectedGrids.delete(gridId);
      } else {
        newSelectedGrids.add(gridId);
      }
      return newSelectedGrids;
    });
  };

  const handleSubmit = () => {
    onGridSubmit(Array.from(selectedGrids));
  };

  return (
    <div className="grid-map-container">
      <div className="left-container"></div> {/* This will push the grid container to the right */}
      <div className="grid-container">
        <div className="grid-map">
          <img src={`${process.env.PUBLIC_URL}/image/map.png`} alt="Map" className="map-image" />
          <div className="grid-overlay">
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => {
                const gridId = `${row}-${col}`;
                return (
                  <div
                    key={gridId}
                    className={`grid-cell ${selectedGrids.has(gridId) ? 'selected' : ''}`}
                    onClick={() => handleGridClick(gridId)}
                  ></div>
                );
              })
            )}
          </div>
        </div>
        <button className="grid-submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default GridMap;
