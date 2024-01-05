import Dropdown from "./components/Dropdown";
import Maze, { DiscoverState } from "./components/Maze";



function initStates(size: number) {
  const stateDimension = 2*size + 1;
  const states: Array<Array<DiscoverState>> = [];
  for (let i = 0; i < stateDimension; i++) {
    states[i] = [];
    for (let j = 0; j < stateDimension; j++) {
      states[i][j] = DiscoverState.hidden;
    }
  }

  states[0][1] = DiscoverState.no_wall;
  states[1][1] = DiscoverState.path;
  states[1][0] = DiscoverState.wall;
  states[2][1] = DiscoverState.wall;
  states[1][2] = DiscoverState.no_wall;
  states[1][3] = DiscoverState.target;

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

  return <div>
    <h1>EV3 Maze Solver</h1>
    <br />
    <Dropdown items={items}/>
    <br />
    <Maze size={4} discoverStates={initStates(4)}/>
  </div>
}

export default App;