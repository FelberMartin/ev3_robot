# EV3 Maze Solver

## How to run

* **Python server**: `npm start`
* **Visualization**: `cd react-app && npm run serve` (may need `npm run build` to reflect code changes)
* **Robot**: Execute the `ev3/main.py` file from the brick's file browser. Needs to be restarted everytime the python server is restarted.


## Repo structure

### Robot

The code for the Lego EV3 robot is in the `./ev3` directory. The robot receives the commands from the python server and notifies the server when a command is done (eg moving a forward).

### Python server

The python server is responsible for 
- Brigding communictation between CPEE and the EV3 robot
- Retrieving and storing information from the CPEE (stream points, model activity data)
- Exposing the stored data to the react visualization app
- And forwarding requests for the react app to the public accessable url


### Visualization: React app

The React app uses vite and can display a current run of the robot or compare previous runs. The data for both current and previous runs is fetched from the python server.

This app expects to find the python server API exposed under `https://lehre.bpm.in.tum.de/ports/9901/`. 

To access the app from outside, use the redirect link from the python server: https://lehre.bpm.in.tum.de/ports/9901/app. 

