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

  let [displayInfo2, setDisplayInfo2] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun2, setSelectedRun2] = useState<string>("");
  let [selectedRunData2, setSelectedRunData2] = useState<any[]>([]);
  let [playTimestamps2, setPlayTimestamps2] = useState<Date[]>([]);


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

  let onSelected2 = (item: string) => {
    setDisplayInfo2(new RunDisplayInfo());
    setSelectedRun2(item);
    let stringContent = allRunData.filter(x => x.id === item)[0].content;
    let parsedContent = JSON.parse(stringContent);
    setSelectedRunData2(parsedContent);
  }

  let onPlayUpdate = (index: number, durationMs: number) => {
    console.log("onPlayUpdate", index, durationMs);
    let info = extractRunDisplayInfoTrunctated(selectedRunData, durationMs)
    console.log(info);
    setDisplayInfo(info);
  }

  const wholeMaze = function (info: RunDisplayInfo, showRobot: boolean) {
    return <div className="wholeMaze">
      <div>
        <MazeCanvas path={displayInfo.path} />
        <Robot info={displayInfo} show={showRobot} />
        <Maze discoverStates={displayInfo.discoveryStates}/>
      </div>
      <div>
        <SensorDataDisplay sensorData={displayInfo.sensorData} />
      </div>
    </div>
  }


  return <div className="root" style={{ dataBsTheme: "dark" }}>
    <h1>EV3 Maze Solver</h1>
    <br />
    <div style={{ display: 'flex', alignItems: "", marginTop: "40px" }}>
      <PlayManager onUpdate={onPlayUpdate} timestamps={playTimestamps} />
      <Dropdown items={allRunData.map(x => x.id)} onSelected={onSelected} defaultValue="Current"/>
      <div style={{margin: "8px", fontSize: "24px"}}>vs.</div> 
      <Dropdown items={allRunData.map(x => x.id)} onSelected={onSelected2} defaultValue="None" />
    </div>
    <div className="mazeSpacer" />
    <div style={{ display: 'flex' }}>
      {wholeMaze(displayInfo, selectedRun !== "")}
      {selectedRun2 !== "None" && <div style={{width: "120px"}}/>}
      {selectedRun2 !== "None" && wholeMaze(displayInfo2, true)}
    </div>
  </div>
}

export default App;