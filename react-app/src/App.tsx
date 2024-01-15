import Dropdown from "./components/Dropdown";
import Maze, { DiscoveryState } from "./components/Maze";
import MazeCanvas from "./components/MazeCanvas";
import './App.css';
import Robot from "./components/Robot";
import { useEffect, useState } from "react";
import { RunDisplayInfo, getAllRunData } from "./util/RunData";


function App() {
  let [allRunData, setAllRunData] = useState<(any[] | null)[]>([]);
  let [displayInfo, setDisplayInfo] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun, setSelectedRun] = useState<string>("");

  useEffect(() => {
    getAllRunData().then((data) => {
      setAllRunData(data)
    })
  }, []);



  return <div className="root">
    <h1>EV3 Maze Solver</h1>
    <br />
    <Dropdown items={allRunData.map(x => x.id)} onSelected={setSelectedRun} />
    <div className="mazeSpacer" />
    <div>
      <MazeCanvas/>
      <Robot info={displayInfo} show={selectedRun !== ""} />
      <Maze discoverStates={displayInfo.discoveryStates}/>
    </div>
  </div>
}

export default App;