import exp from "constants";
import { DiscoveryState } from "../components/Maze";
import { getDiscoveryStateIndices, getWallIndices, gridSegmentCounts } from "./positions";
import { get } from "http";

// Looks like this: {"color_sensor": 0, "infrared_sensor": 67, "motor_left_angle": 58868, "motor_left_speed": 405, "motor_right_angle": 50868, "motor_right_speed": 399}
interface SensorData {
    color_sensor: number;
    infrared_sensor: number;
    motor_left_angle: number;
    motor_left_speed: number;
    motor_right_angle: number;
    motor_right_speed: number;
}

export type { SensorData };

class RunDisplayInfo {
    position: [number, number];
    rotation: number;
    path: [number, number][];
    discoveryStates: DiscoveryState[][];
    sensorData: SensorData;

    constructor() {
        this.position = [0, -1];
        this.rotation = 180;
        this.path = [[0, -1]];
        this.discoveryStates = [];
        for (let i = 0; i < gridSegmentCounts; i++) {
            this.discoveryStates[i] = [];
            for (let j = 0; j < gridSegmentCounts; j++) {
                this.discoveryStates[i][j] = DiscoveryState.hidden;
            }
        }
        this.discoveryStates[1][0] = DiscoveryState.no_wall;
        this.sensorData = {
            color_sensor: 20,
            infrared_sensor: 50,
            motor_left_angle: 0,
            motor_left_speed: 0,
            motor_right_angle: 0,
            motor_right_speed: 0
        };
    }

    applyRunDataEntry(runDataEntry: any) {
        if ("activity" in runDataEntry) {
            if ("passthrough" in runDataEntry) {
                return;
            }
            let endpoint = runDataEntry["endpoint"];
            let command = endpoint.split("/").pop();
            // command can be "forward", "left", "right", "all_measures"
            if (command === "forward") {
                this._moveForward();
            } else if (command === "left") {
                this.rotation = (this.rotation + 270) % 360;
            } else if (command === "right") {
                this.rotation = (this.rotation + 90) % 360;
            } else if (command === "all_measures") {
                // Ignore for now
            }
            this._updateDiscoveryStates();
        } else if ("stream:source" in runDataEntry && runDataEntry["stream:source"] === "robot"){
            let sensorData = runDataEntry["stream:value"];
            if (sensorData != "") {
                this.sensorData = sensorData;
            }
            this._updateDiscoveryStates();
        }
    }

    _moveForward() {
        let x = this.position[0];
        let y = this.position[1];
        if (this.rotation === 0) {
            y--;
        } else if (this.rotation === 90) {
            x++;
        } else if (this.rotation === 180) {
            y++;
        } else if (this.rotation === 270) {
            x--;
        }
        this.position = [x, y];
        this.path.push([x, y]);
    }

    _updateDiscoveryStates() {
        // Tiles
        let [x, y] = getDiscoveryStateIndices(this.position);
        if (x < 0 || x >= gridSegmentCounts || y < 0 || y >= gridSegmentCounts) {
            // console.log("Position out of bounds: ", this.position);
            return;
        }

        this.discoveryStates[x][y] = DiscoveryState.path;
        if (this.sensorData.color_sensor >= 40) {
            this.discoveryStates[x][y] = DiscoveryState.target;
        }

        // Walls
        let [xWall, yWall] = getWallIndices(this.position, this.rotation);
        if (this.sensorData.infrared_sensor <= 40) {
            this.discoveryStates[xWall][yWall] = DiscoveryState.wall;
        } else {
            this.discoveryStates[xWall][yWall] = DiscoveryState.no_wall;
        }
    }

}

function extractRunDisplayInfoTrunctated(runData: Array<any>, durationMs: number) : RunDisplayInfo {
    if (runData.length === 0) {
        console.log("Trying to extract run display info from empty run data")
        return new RunDisplayInfo();
    }
    let startString = runData[0]["backendTimestampMs"];
    let start = Number(startString);
    let end = start + durationMs+ 10; // Add 10ms for dealing with rounding errors
    let truncatedRunData = runData.filter((data) => {
        let timestamp = data["backendTimestampMs"];
        return timestamp >= start && timestamp <= end;
    });
    return extractRunDisplayInfo(truncatedRunData);
}

function extractRunDisplayInfo(runData: Array<any>) : RunDisplayInfo {
    let info = new RunDisplayInfo();
    for (let i = 0; i < runData.length; i++) {
        info.applyRunDataEntry(runData[i]);
    }
    return info;
}



async function getCurrentRunData() : Promise<any[] | null> {
    try {
        const response = await fetch('http://localhost:8080/currentRunData');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('currentRunData received');
        return result;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
    return null;
}

async function getAllRunData() : Promise<(any[] | null)[]> {
    try {
        const response = await fetch('http://localhost:8080/allRunData');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        var result = await response.json();
        console.log('runData received');
        return result;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
    return [];
}

export { RunDisplayInfo, extractRunDisplayInfo, extractRunDisplayInfoTrunctated, getCurrentRunData, getAllRunData };