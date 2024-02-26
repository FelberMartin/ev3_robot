import Dropdown from "./components/Dropdown";
import Maze, { DiscoveryState } from "./components/Maze";
import MazeCanvas from "./components/MazeCanvas";
import './App.css';
import Robot from "./components/Robot";
import { useEffect, useRef, useState } from "react";
import { RunDisplayInfo, applyNewRunData, extractRunDisplayInfoTrunctated, getAllRunData, getCurrentRunData } from "./util/RunData";
import PlayManager from "./components/PlayManager";
import SensorDataDisplay from "./components/SensorDataDisplay";


function App() {
  let [allRunData, setAllRunData] = useState<(any[] | null)[]>([]);

  let [displayInfo, setDisplayInfo] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun, setSelectedRun] = useState<string>("Current");
  const selectedRunRef = useRef<string>();
  let [selectedRunData, setSelectedRunData] = useState<any[]>([]);
  let [playDurations, setPlayDurations] = useState<number[]>([]);

  let [displayInfo2, setDisplayInfo2] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun2, setSelectedRun2] = useState<string>("None");
  let [selectedRunData2, setSelectedRunData2] = useState<any[]>([]);


  useEffect(() => {
    getAllRunData().then((data) => {
      setAllRunData(data)
    })
  }, []);

  useEffect(() => {
    if (selectedRunData.length > 0) {
      let timestamps = selectedRunData.map(x => new Date(x["backendTimestampMs"]));
      let durations = extractDurations(timestamps);
      let durations2: number[] = [];
      if (selectedRunData2.length > 0) {
        let timestamps2 = selectedRunData2.map(x => new Date(x["backendTimestampMs"]));
        durations2 = extractDurations(timestamps2);
      }
      let mergedDurations = durations.concat(durations2);
      mergedDurations.sort((a, b) => a - b);
      setPlayDurations(mergedDurations);
    }
    if (selectedRun === "Current") {
      console.log("selectedRunData", selectedRunData);
      onPlayUpdate(0, 1000_000);
    }
  }, [selectedRunData, selectedRunData2]);

  const extractDurations = (timestamps: Date[]) => {
    let durations: number[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      durations.push(timestamps[i].getTime() - timestamps[0].getTime());
    }
    return durations;
  }

  let onSelected = (item: string) => {
    setDisplayInfo(new RunDisplayInfo());
    setSelectedRun(item);
    if (item === "Current") {
      setSelectedRun2("None");
      return;
    }
    let stringContent = allRunData.filter(x => x.id === item)[0].content;
    let parsedContent = JSON.parse(stringContent);
    setSelectedRunData(parsedContent);
  }

  useEffect(() => {
    selectedRunRef.current = selectedRun;
  }, [selectedRun]);

  useEffect(() => {
    let isMounted = true;

    const updateCurrentRunData = async () => {
      console.log("** updateCurrentRunData", selectedRunRef.current);
      if (selectedRunRef.current !== "Current") {
        return;
      }
      let data = await getCurrentRunData();
      console.log("data", data);
      if (isMounted && data !== null) {
        setSelectedRunData(data);
      }
      if (isMounted) {
        setTimeout(updateCurrentRunData, 200);
      }
    };

    updateCurrentRunData();

    // Cleanup function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [selectedRunRef.current]);

  let onSelected2 = (item: string) => {
    setDisplayInfo2(new RunDisplayInfo());
    setSelectedRun2(item);
    let stringContent = allRunData.filter(x => x.id === item)[0].content;
    let parsedContent = JSON.parse(stringContent);
    setSelectedRunData2(parsedContent);
  }

  useEffect(() => {
    displayInfo.onUpdate = onInfoUpdate;
  }, [displayInfo]);

  let onInfoUpdate = (info: RunDisplayInfo) => {
    setDisplayInfo(info.copy());
  }

  useEffect(() => {
    displayInfo2.onUpdate = onInfo2Update;
  }, [displayInfo2]);
  
  let onInfo2Update = (info: RunDisplayInfo) => {
    setDisplayInfo2(info.copy());
  }

  let onPlayUpdate = (index: number, durationMs: number) => {
    console.log("onPlayUpdate", index, durationMs);
    let info = applyNewRunData(displayInfo, selectedRunData, durationMs);
    setDisplayInfo(info);
    let info2 = applyNewRunData(displayInfo2, selectedRunData2, durationMs);
    setDisplayInfo2(info2);
  }

  let wholeMaze = function (info: RunDisplayInfo, showRobot: boolean) {
    return <div className="wholeMaze">
      <div>
        <MazeCanvas path={info.path} />
        <Robot position={info.position} rotation={info.rotation} show={showRobot} />
        <Maze discoverStates={info.discoveryStates}/>
      </div>
      <div>
        <SensorDataDisplay sensorData={info.sensorData} />
      </div>
    </div>
  }


  return <div className="root">
    <h1>EV3 Maze Solver</h1>
    <br />
    <div style={{ display: 'flex', alignItems: "", marginTop: "40px" }}>
      { selectedRun !== "Current" && <PlayManager onUpdate={onPlayUpdate} durations={playDurations} /> }
      <Dropdown items={allRunData.map(x => x.id)} onSelected={onSelected} defaultValue="Current"/>
      { selectedRun !== "Current" && <div style={{ display: "flex" }}>
          <div style={{margin: "8px", fontSize: "24px"}}>vs.</div> 
          <Dropdown items={allRunData.map(x => x.id)} onSelected={onSelected2} defaultValue="None" /> 
        </div>
      }
    </div>
    <div className="mazeSpacer" />
    <div style={{ display: 'flex' }}>
      {wholeMaze(displayInfo, selectedRunData.length > 0)}
      {selectedRun2 !== "None" && <div style={{width: "120px"}}/>}
      {selectedRun2 !== "None" && wholeMaze(displayInfo2, true)}
    </div>
  </div>
}

export default App;