import Dropdown from "./components/Dropdown";
import Maze from "./components/Maze";
import MazeCanvas from "./components/MazeCanvas";
import './App.css';
import Robot from "./components/Robot";
import { useEffect, useRef, useState } from "react";
import { RunDisplayInfo, applyNewRunData, getAllRunData, getCurrentRunData } from "./util/RunData";
import PlayManager from "./components/PlayManager";
import SensorDataDisplay from "./components/SensorDataDisplay";


function App() {
  // Data for all previous runs
  let [allRunData, setAllRunData] = useState<(any[] | null)[]>([]);

  // State variables for the selected run
  let [displayInfo, setDisplayInfo] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun, setSelectedRun] = useState<string>("Current");
  const selectedRunRef = useRef<string>();
  let [selectedRunData, setSelectedRunData] = useState<any[]>([]);

  // State variables for the second selected run (for comparison)
  let [displayInfo2, setDisplayInfo2] = useState<RunDisplayInfo>(new RunDisplayInfo());
  let [selectedRun2, setSelectedRun2] = useState<string>("None");
  let [selectedRunData2, setSelectedRunData2] = useState<any[]>([]);

  // Durations for the updates of the displayed run data (possibly two runs combined).
  // Each duration is a duration in milliseconds from the start of the run.
  let [playDurations, setPlayDurations] = useState<number[]>([]);



  // Fetch all run data from the server at the start.
  useEffect(() => {
    getAllRunData().then((data) => {
      setAllRunData(data)
    })
  }, []);

  // Update the playDurations when the selected run data changes
  useEffect(() => {
    if (selectedRunData.length > 0) {
      let timestamps = selectedRunData.map(x => new Date(x["backendTimestampMs"]));
      let durations = extractDurations(timestamps);
      let durations2: number[] = [];
      if (selectedRunData2.length > 0) {    // Second run can be empty
        let timestamps2 = selectedRunData2.map(x => new Date(x["backendTimestampMs"]));
        durations2 = extractDurations(timestamps2);
      }
      // Merge the durations to get update-calls for both runs
      let mergedDurations = durations.concat(durations2);
      mergedDurations.sort((a, b) => a - b);
      setPlayDurations(mergedDurations);
    }
    if (selectedRun === "Current") {
      // Apply the current run data immediately.
      // Use a duration of 1000_000 ms to display the whole run (with the latest live data).
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

  let onItemSelected = (item: string) => {
    setDisplayInfo(new RunDisplayInfo());
    setSelectedRun(item);
    if (item === "Current") {
      // Comparison with second run is not possible for live (current) run.
      setSelectedRun2("None");
      return;
    }
    let stringContent = allRunData.filter(x => x.id === item)[0].content;
    let parsedContent = JSON.parse(stringContent);
    setSelectedRunData(parsedContent);
  }

  // Workaround to fetch the fetch the current run data from the server
  // only when the selected run is "Current". Did not work without the
  // selectedRunRef.current workaround.
  // NOTE: There is still a bug, when you select an old run and then
  // select "Current" again, the current run data will not be fetched
  // again. No idea why this is happening. Workaround: Select "Current"
  // from the dropdown again.
  useEffect(() => {
    selectedRunRef.current = selectedRun;
  }, [selectedRun]);

  useEffect(() => {
    let isMounted = true;

    // Periodically fetch the current run data from the server.
    const updateCurrentRunData = async () => {
      if (selectedRunRef.current !== "Current") {
        return;   // Another run has been selected.
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

    return () => {
      isMounted = false;
    };
  }, [selectedRunRef.current]);

  let onItemSelected2 = (item: string) => {
    setDisplayInfo2(new RunDisplayInfo());
    setSelectedRun2(item);
    let stringContent = allRunData.filter(x => x.id === item)[0].content;
    let parsedContent = JSON.parse(stringContent);
    setSelectedRunData2(parsedContent);
  }

  // Using a combination of useEffect and a callback function (onInfoUpdate)
  // to reflect the updates properly in the UI. Without this approach, the
  // updates would not be reflected in the UI.
  useEffect(() => {
    displayInfo.onUpdate = onInfoUpdate;
  }, [displayInfo]);

  let onInfoUpdate = (info: RunDisplayInfo) => {
    const updatedDisplayInfo = info.copy();
    setDisplayInfo(updatedDisplayInfo);
  }

  useEffect(() => {
    displayInfo2.onUpdate = onInfo2Update;
  }, [displayInfo2]);
  
  let onInfo2Update = (info: RunDisplayInfo) => {
    setDisplayInfo2(info.copy());
  }

  // Called by the PlayManager to update the display info
  let onPlayUpdate = (index: number, durationMs: number) => {
    if (index === 0 && durationMs === 0) {  // Replay button pressed
      setDisplayInfo(new RunDisplayInfo());
      setDisplayInfo2(new RunDisplayInfo());
    } else {
      applyNewRunData(displayInfo, selectedRunData, durationMs);
      applyNewRunData(displayInfo2, selectedRunData2, durationMs);
    }
  }

  // Component of the whole maze with robot, path canvas, maze and sensor data
  let wholeMaze = function (info: RunDisplayInfo, showRobot: boolean) {
    return <div className="wholeMaze">
      <div>
        <MazeCanvas path={info.path} />
        <Robot position={info.position} rotation={info.rotation[0]} show={showRobot} />
        <Maze discoverStates={info.discoveryStates}/>
      </div>
      <div>
        <SensorDataDisplay sensorData={info.sensorData}/>
      </div>
    </div>
  }


  return <div className="root">
    <h1>EV3 Maze Solver</h1>
    <br />
    <div style={{ display: 'flex', alignItems: "", marginTop: "40px" }}>
      { selectedRun !== "Current" && <PlayManager onUpdate={onPlayUpdate} durations={playDurations} /> }
      <Dropdown items={allRunData.map(x => x.id)} onSelected={onItemSelected} defaultValue="Current"/>
      { selectedRun !== "Current" && <div style={{ display: "flex" }}>
          <div style={{margin: "8px", fontSize: "24px"}}>vs.</div> 
          <Dropdown items={allRunData.map(x => x.id)} onSelected={onItemSelected2} defaultValue="None" /> 
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