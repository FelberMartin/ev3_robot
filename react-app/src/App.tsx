import Dropdown from "./components/Dropdown";
import Maze, { DiscoveryState } from "./components/Maze";
import MazeCanvas from "./components/MazeCanvas";
import './App.css';
import Robot from "./components/Robot";
import WebSocketComponent from "./components/WebSocketComponent";


function initStates(size: number) {
  const stateDimension = 2*size + 1;
  const states: Array<Array<DiscoveryState>> = [];
  for (let i = 0; i < stateDimension; i++) {
    states[i] = [];
    for (let j = 0; j < stateDimension; j++) {
      states[i][j] = DiscoveryState.hidden;
    }
  }

  states[0][1] = DiscoveryState.no_wall;
  states[1][1] = DiscoveryState.path;
  states[1][0] = DiscoveryState.wall;
  states[2][1] = DiscoveryState.wall;
  states[1][2] = DiscoveryState.no_wall;
  states[1][3] = DiscoveryState.target;

  return states;
}


function App() {
  const items = [
    "left",
    "right",
    "random",
    "right2",
    "right3"
  ]

  return <div className="root">
    <WebSocketComponent />
    <h1>EV3 Maze Solver</h1>
    <br />
    <Dropdown items={items}/>
    <div className="mazeSpacer" />
    <div>
      <MazeCanvas/>
      <Robot posX={0} posY={-1} rotation={180} />
      <Maze discoverStates={initStates(4)}/>
    </div>
  </div>
}

export default App;