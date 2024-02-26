import exp from "constants";
import { DiscoveryState } from "../components/Maze";
import { getDiscoveryStateIndices, getDistanceToWall, getWallNextWallIndices, gridSegmentCounts } from "./positions";
import { get } from "http";
import { animateValue } from "./Animation";

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

    lastUpdate: number;

    onUpdate?: (info: RunDisplayInfo) => void;

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
        this.lastUpdate = -1;
    }

    copy(): RunDisplayInfo {
        let copy = new RunDisplayInfo();
        copy.position = [this.position[0], this.position[1]];
        copy.rotation = this.rotation;
        copy.path = this.path.map((x) => [x[0], x[1]]);
        copy.discoveryStates = this.discoveryStates.map((x) => x.map((y) => y));
        copy.sensorData = {
            color_sensor: this.sensorData.color_sensor,
            infrared_sensor: this.sensorData.infrared_sensor,
            motor_left_angle: this.sensorData.motor_left_angle,
            motor_left_speed: this.sensorData.motor_left_speed,
            motor_right_angle: this.sensorData.motor_right_angle,
            motor_right_speed: this.sensorData.motor_right_speed
        };
        copy.lastUpdate = this.lastUpdate;
        copy.onUpdate = this.onUpdate;
        return copy;
    }

    applyRunDataEntry(runDataEntry: any) {
        if ("activity" in runDataEntry) {
            if (!("passthrough" in runDataEntry)) {
                return;
            }
            let endpoint = runDataEntry["endpoint"];
            let command = endpoint.split("/").pop();
            // command can be "forward", "left", "right", "all_measures"
            if (command === "forward") {
                this._moveForward();
            } else if (command === "left") {
                this._rotate(-90);
            } else if (command === "right") {
                this._rotate(90);
            } else if (command === "all_measures") {
                // Nothing to do here
            }
            this._updateDiscoveryStates();
        } else if ("stream:source" in runDataEntry && runDataEntry["stream:source"] === "robot"){
            let sensorData = runDataEntry["stream:value"];
            if (sensorData != "") {
                this.sensorData = sensorData;
            }
            this._updateDiscoveryStates();
        }
        this.onUpdate?.call(this, this);
    }

    _moveForward() {
        let direction = this._getDirectionVector();
        let x = this.position[0] + direction[0];
        let y = this.position[1] + direction[1];

        this.path.push([this.position[0], this.position[1]]);
        animateValue(this.position[0], x, (value) => {
            this.position[0] = value;
            this.path[this.path.length - 1][0] = value;
            this._updateDiscoveryStates();
            this.onUpdate?.call(this, this);
        }, 1600);
        animateValue(this.position[1], y, (value) => {
            this.position[1] = value;
            this.path[this.path.length - 1][1] = value;
            this.onUpdate?.call(this, this);
        }, 1600);
    }

    _getDirectionVector(): [number, number] {
        let rotation = this.rotation % 360;
        if (rotation >= 315 || rotation < 45) {
            return [0, -1];
        } else if (rotation >= 45 && rotation < 135) {
            return [1, 0];
        } else if (rotation >= 135 && rotation < 225) {
            return [0, 1];
        } else if (rotation >= 225 && rotation < 315) {
            return [-1, 0];
        }
    }

    _rotate(degree: number) {
        animateValue(this.rotation, this.rotation + degree, (value) => {
            this.rotation = value;
            this._updateDiscoveryStates();
            this.onUpdate?.call(this, this);
        }, 1000);
    }

    _updateDiscoveryStates() {
        // Tiles
        let [x, y] = this.position;
        if (x < 0 || x >= gridSegmentCounts || y < 0 || y >= gridSegmentCounts) {
            return;
        }

        let [xRounded, yRounded] = [Math.round(x), Math.round(y)];
        let dsIndices = getDiscoveryStateIndices([xRounded, yRounded]);
        this._setDiscoveryState(dsIndices, DiscoveryState.path);
        if (this.sensorData.color_sensor >= 40) {
            this._setDiscoveryState(dsIndices, DiscoveryState.target);
        }

        // Walls
        let direction = this._getDirectionVector();
        let nextWallIndices = getWallNextWallIndices(dsIndices, direction);
        let distanceToWall = getDistanceToWall(this.position, nextWallIndices);
        console.log(distanceToWall, this.sensorData.infrared_sensor);
        if (distanceToWall > 0.2 && distanceToWall < 0.8) {
            if (this.sensorData.infrared_sensor < 40) {
                this._setDiscoveryState(nextWallIndices, DiscoveryState.wall);
            } else {
                this._setDiscoveryState(nextWallIndices, DiscoveryState.no_wall);
            }
        }
    }

    _setDiscoveryState(indices: [number, number], state: DiscoveryState) {
        this.discoveryStates[indices[0]][indices[1]] = state;
    }

}

function applyNewRunData(info: RunDisplayInfo, runData: Array<any>, durationMs: number) : RunDisplayInfo {
    if (runData.length === 0) {
        console.log("Trying to extract run display info from empty run data")
        return info;
    }
    let startString = runData[0]["backendTimestampMs"];
    let start = Number(startString);
    let end = start + durationMs+ 10; // Add 10ms for dealing with rounding errors
    let truncatedRunData = runData.filter((data) => {
        let timestamp = data["backendTimestampMs"];
        return timestamp > info.lastUpdate && timestamp <= end;
    });
    for (let i = 0; i < truncatedRunData.length; i++) {
        info.applyRunDataEntry(truncatedRunData[i]);
    }
    info.lastUpdate = end;
    return info;
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

export { RunDisplayInfo, applyNewRunData, extractRunDisplayInfo, extractRunDisplayInfoTrunctated, getCurrentRunData, getAllRunData };