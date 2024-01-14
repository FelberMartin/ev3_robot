import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

let socket;

const WebSocketComponent = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        // open socket connection
        // create websocket
        socket = io("http://localhost:8080");
        console.log("here");

        socket.on('connect', () => {
            console.log('Connected to server with SocketIO');
        });

        socket.on('update', (newData) => {
            setData(JSON.parse(newData));
        }); 

        // when component unmounts, disconnect
        return (() => {
            socket.disconnect()
        })
    }, [])

    

    return (
        <div>
        <div>
            {data.length === 0 && <div>No data yet</div>}
            {data.map((item) => (
            <div key={item.id}>{item.content}</div>
            ))}
        </div>
        </div>
    );
};

export default WebSocketComponent;
