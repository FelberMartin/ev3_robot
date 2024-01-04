import Dropdown from "./components/Dropdown";


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
    <Dropdown items={items}/>
  </div>
}

export default App;