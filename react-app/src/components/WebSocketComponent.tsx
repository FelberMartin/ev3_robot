import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

const WebSocketComponent = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Function to fetch data from the backend
        const fetchData = async () => {
          try {
            const response = await fetch('http://localhost:8080/currentRunData');
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
    
            const result = await response.json();
            console.log('result', result);
            setData(result);
          } catch (error) {
            console.error('Error fetching data:', error.message);
          }
        };
    
        // Fetch data initially
        fetchData();
    
        // Set up periodic fetching using setInterval
        const intervalId = setInterval(fetchData, 50000); // Fetch every 5 seconds
    
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
      }, []); 

    

    return (
        <div>
        <div>
            {data === undefined && <div>No data yet</div>}
            {data.map((item) => (
            <div key={item.id}>
                <h3>{item.id}</h3>
                <p style={{
                    fontSize: 12,
                }}>{JSON.stringify(item.content).substring(0, 120)} ... </p>
            </div>
            ))}
        </div>
        </div>
    );
};

export default WebSocketComponent;
