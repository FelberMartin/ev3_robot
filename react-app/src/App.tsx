import Dropdown from "./components/Dropdown";
import Maze, { DiscoveryState } from "./components/Maze";
import MazeCanvas from "./components/MazeCanvas";
import './App.css';
import Robot from "./components/Robot";
import { useEffect, useState } from "react";
import { RunDisplayInfo, extractRunDisplayInfoTrunctated, getAllRunData } from "./util/RunData";
import PlayManager from "./components/PlayManager";
import SensorDataDisplay from "./components/SensorDataDisplay";


function App() {
  let [allRunData, setAllRunData] = useState<(any[] | null)[]>([]);
  let [displayInfo, setDisplayInfo] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun, setSelectedRun] = useState<string>("");
  let [selectedRunData, setSelectedRunData] = useState<any[]>([]);
  let [playTimestamps, setPlayTimestamps] = useState<Date[]>([]);

  useEffect(() => {
    getAllRunData().then((data) => {
      setAllRunData(data)
    })
  }, []);

  useEffect(() => {
    if (selectedRunData.length > 0) {
      let timestamps = selectedRunData.map(x => new Date(x["backendTimestampMs"]));
      setPlayTimestamps(timestamps);
    }
  }, [selectedRunData]);

  let onSelected = (item: string) => {
    setDisplayInfo(new RunDisplayInfo());
    setSelectedRun(item);
    let stringContent = allRunData.filter(x => x.id === item)[0].content;
    let parsedContent = JSON.parse(stringContent);
    setSelectedRunData(parsedContent);
  }

  let onPlayUpdate = (index: number, durationMs: number) => {
    console.log("onPlayUpdate", index, durationMs);
    let info = extractRunDisplayInfoTrunctated(selectedRunData, durationMs)
    console.log(info);
    setDisplayInfo(info);
  }


  return <div className="root">
    <h1>EV3 Maze Solver</h1>
    <br />
    <Dropdown items={allRunData.map(x => x.id)} onSelected={onSelected} />
    <PlayManager onUpdate={onPlayUpdate} timestamps={playTimestamps} />
    <div className="mazeSpacer" />
    <div style={{ display: 'flex' }}>
      <div>
        <MazeCanvas path={displayInfo.path} />
        <Robot info={displayInfo} show={selectedRun !== ""} />
        <Maze discoverStates={displayInfo.discoveryStates}/>
      </div>
      <div>
        <SensorDataDisplay sensorData={displayInfo.sensorData} />
      </div>
    </div>
  </div>
}

export default App;