import Dropdown from "./components/Dropdown";
import Maze from "./components/Maze";


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
    <Maze />
  </div>
}

export default App;