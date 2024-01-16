import React from 'react';
import { SensorData } from '../util/RunData';
import './SensorDataDisplay.css';

interface Props {
  sensorData: SensorData;
}

const SensorDataDisplay = ({ sensorData } : Props) => {
  const renderMotorSpeed = (speed: number) => {
    // Calculate the height of the red rectangle based on the absolute value of the speed
    const height = Math.abs(speed) * 0.1;

    // Determine the classes for styling based on the sign of the speed
    const containerClass = speed >= 0 ? 'motor-speed-container-positive' : 'motor-speed-container-negative';
    const indicatorRectClass = speed >= 0 ? 'indicator-rectangle-positive' : 'indicator-rectangle-negative';

    return (
      <div className={`motor-speed-container ${containerClass}`}>
        <div className={`indicator-rectangle ${indicatorRectClass}`} style={{ height: `${height}%` }}></div>
        <div className="center-line"></div>
      </div>
    );
  };

  const renderColorSensorData = (data: number) => {
    const rectWidth = data * 1.6;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        border: 'solid black',
        width: '100px' 
      }}>
        <div
          style={{
            width: rectWidth + 'px',
            height: '20px',
            backgroundColor: 'rgb(' + (250 - data * 3) + ', 120, 120)',
          }}
        />
      </div>
    );
  };

  const renderInfraredSensorData = (data: number) => {
    const rectWidth = data;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        border: 'solid black', 
        width: '100px' 
      }}>
        <div
          style={{
            width: rectWidth + 'px',
            height: '20px',
            backgroundColor: 'rgb(0, 0, ' + data + ')',
          }}
        />
      </div>
    );
  };

  return (
    <div>
      <h2>Motor</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {renderMotorSpeed(sensorData.motor_left_speed)}
        {renderMotorSpeed(sensorData.motor_right_speed)}
      </div>

      <h2>Color</h2>
      {renderColorSensorData(sensorData.color_sensor)}

      <h2>Infrared</h2>
      {renderInfraredSensorData(sensorData.infrared_sensor)}
    </div>
  );
};

export default SensorDataDisplay;
