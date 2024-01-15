import Dropdown from "./components/Dropdown";
import Maze, { DiscoveryState } from "./components/Maze";
import MazeCanvas from "./components/MazeCanvas";
import './App.css';
import Robot from "./components/Robot";
import { useEffect, useState } from "react";
import { RunDisplayInfo, extractRunDisplayInfoTrunctated, getAllRunData } from "./util/RunData";
import PlayManager from "./components/PlayManager";


function App() {
  let [allRunData, setAllRunData] = useState<(any[] | null)[]>([]);
  let [displayInfo, setDisplayInfo] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun, setSelectedRun] = useState<string>("");
  let [selectedRunData, setSelectedRunData] = useState<any[]>([]);

  useEffect(() => {
    getAllRunData().then((data) => {
      setAllRunData(data)
    })
  }, []);

  let onSelected = (item: string) => {
    setSelectedRun(item);
    setSelectedRunData(allRunData.filter(x => x.id === item)[0]);
  }

  let onPlayUpdate = (index: number, durationMs: number) => {
    let info = extractRunDisplayInfoTrunctated(selectedRunData, durationMs)
    setDisplayInfo(info);
  }


  return <div className="root">
    <h1>EV3 Maze Solver</h1>
    <br />
    <Dropdown items={allRunData.map(x => x.id)} onSelected={onSelected} />
    <PlayManager onUpdate={onPlayUpdate} timestamps={selectedRunData.map(x => new Date(x["stream:timestamp"]))} />
    <div className="mazeSpacer" />
    <div>
      <MazeCanvas/>
      <Robot info={displayInfo} show={selectedRun !== ""} />
      <Maze discoverStates={displayInfo.discoveryStates}/>
    </div>
  </div>
}

export default App;