import React, { useEffect, useState } from 'react';
import { SensorData } from '../util/RunData';
import './SensorDataDisplay.css';
import { animateValue } from '../util/Animation';

interface Props {
  sensorData: SensorData;
}

const SensorDataDisplay = ({ sensorData } : Props) => {
  // State variables to track the animated values
  const [animatedMotorLeftSpeed, setAnimatedMotorLeftSpeed] = useState(sensorData.motor_left_speed);
  const [animatedMotorRightSpeed, setAnimatedMotorRightSpeed] = useState(sensorData.motor_right_speed);
  const [animatedColorSensor, setAnimatedColorSensor] = useState(sensorData.color_sensor);
  const [animatedInfraredSensor, setAnimatedInfraredSensor] = useState(sensorData.infrared_sensor);

  // Use useEffect to trigger animation when sensorData changes
  useEffect(() => {
    animateValue(animatedMotorLeftSpeed, sensorData.motor_left_speed, setAnimatedMotorLeftSpeed);
    animateValue(animatedMotorRightSpeed, sensorData.motor_right_speed, setAnimatedMotorRightSpeed);
    animateValue(animatedColorSensor, sensorData.color_sensor, setAnimatedColorSensor);
    var infraredTarget = sensorData.infrared_sensor;
    if (infraredTarget > 99) {
      infraredTarget = 99;
    }
    animateValue(animatedInfraredSensor, infraredTarget, setAnimatedInfraredSensor);
  }, [sensorData]);


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
        width: '100px',
        borderRadius: '4px'
      }}>
        <div
          style={{
            width: rectWidth + 'px',
            height: '20px',
            backgroundColor: 'rgb(' + 255 + ', ' + (100 + data * 3) + ', ' + (100 + data * 3) + ')',
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
        width: '100px', 
        borderRadius: '4px'
      }}>
        <div
          style={{
            width: rectWidth + 'px',
            height: '20px',
            backgroundColor: 'rgb(' + data + ', 0, ' + data * 3 + ')',
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ marginLeft: "-60px"}}>
      <h5>Motors</h5>
      <div style={{ display: 'flex' }}>
        {renderMotorSpeed(animatedMotorLeftSpeed)}
        {renderMotorSpeed(animatedMotorRightSpeed)}
      </div>
      <br />
      <h5>Color <br/>Sensor: {Math.round(animatedColorSensor)}</h5>
      {renderColorSensorData(animatedColorSensor)}
      <br />
      <h5>Infrared <br/>Sensor: {Math.round(animatedInfraredSensor)}</h5>
      {renderInfraredSensorData(animatedInfraredSensor)}
    </div>
  );
};

export default SensorDataDisplay;
