import { DiscoveryState } from "../components/Maze";
import { getDiscoveryStateIndices, getDistanceToWall, getWallNextWallIndices, gridSegmentCounts } from "./positions";
import { animateValue } from "./Animation";

// Looks like this: {"color_sensor": 0, "infrared_sensor": 67, "motor_left_angle": 58868, "motor_left_speed": 405, "motor_right_angle": 50868, "motor_right_speed": 399}
class SensorData {
    color_sensor: number;
    infrared_sensor: number;
    motor_left_angle: number;
    motor_left_speed: number;
    motor_right_angle: number;
    motor_right_speed: number;

    constructor() {
        this.color_sensor = 0;
        this.infrared_sensor = 0;
        this.motor_left_angle = 0;
        this.motor_left_speed = 0;
        this.motor_right_angle = 0;
        this.motor_right_speed = 0;
    }
}

export type { SensorData };

class RunDisplayInfo {
    /** Position of the robot in the grid. Can be non-integral. Note: this is different from the 
        discoveryState indices. */
    position: [number, number];

    /** Rotation of the robot in degrees. Not clamped to [0, 360). The robot starts with 180 degrees, 
        facing down in the visualization. */
    rotation: number;

    /** Path the robot has taken so far. In grid-coordinates. */
    path: [number, number][];

    /** The discovery states of the tiles in the grid. */
    discoveryStates: DiscoveryState[][];

    /** The current sensor data of the robot. */
    sensorData: SensorData;

    /** Timestamp of the latest update that was applied to this info. */
    lastUpdate: number;

    /** Callback for when the display info is updated and should be rerendered. */
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
        this.discoveryStates[1][0] = DiscoveryState.no_wall;    // Entry point
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
        copy.discoveryStates = this.discoveryStates;
        copy.sensorData = this.sensorData;
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
        } else if ("stream:source" in runDataEntry && runDataEntry["stream:source"] === "robot"){
            let sensorData = runDataEntry["stream:value"];
            if (sensorData != "") {
                this.sensorData.color_sensor = sensorData["color_sensor"];
                this.sensorData.infrared_sensor = sensorData["infrared_sensor"];
                this.sensorData.motor_left_angle = sensorData["motor_left_angle"];
                this.sensorData.motor_left_speed = sensorData["motor_left_speed"];
                this.sensorData.motor_right_angle = sensorData["motor_right_angle"];
                this.sensorData.motor_right_speed = sensorData["motor_right_speed"];
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
            this.onUpdate?.call(this, this);
        }, 1600);
        animateValue(this.position[1], y, (value) => {
            this.position[1] = value;
            this.path[this.path.length - 1][1] = value;
            this.onUpdate?.call(this, this);
        }, 1600);
    }

    /** Gets a vector indcating in which the robot is currently facing. If the robot is currently
     * no facing in a cardinal direction, returns the closest cardinal direction.
     */
    _getDirectionVector(): [number, number] {
        let rotation = this.rotation % 360;
        if (rotation >= 315 || rotation < 45) {
            return [0, -1]; // Up
        } else if (rotation >= 45 && rotation < 135) {
            return [1, 0];  // Right
        } else if (rotation >= 135 && rotation < 225) {
            return [0, 1];  // Down
        } else if (rotation >= 225 && rotation < 315) {
            return [-1, 0]; // Left
        }
    }

    _rotate(degree: number) {
        animateValue(this.rotation, this.rotation + degree, (value) => {
            this.rotation = value;
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
        if (this.sensorData.color_sensor >= 35) {
            this._setDiscoveryState(dsIndices, DiscoveryState.target);
        }

        // Walls
        let direction = this._getDirectionVector();
        let nextWallIndices = getWallNextWallIndices(dsIndices, direction);
        let distanceToWall = getDistanceToWall(this.position, nextWallIndices);
        if (distanceToWall > 0.1 && distanceToWall < 0.8) { // Don't update if the potential wall is too far away or too close 
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

/**
 * Applies new run data to the given run display info. The new run data is filtered to only include
 * data that was not yet applied to the info. The lastUpdate field of the info is used to determine
 * which data is new.
 */
function applyNewRunData(info: RunDisplayInfo, runData: Array<any>, durationMs: number) {
    if (runData.length === 0) {
        console.log("Trying to extract run display info from empty run data")
        return;
    }
    let startString = runData[0]["backendTimestampMs"];
    let start = Number(startString);
    let end = start + durationMs+ 10; // Add 10ms for dealing with rounding errors
    let truncatedRunData = runData.filter((data) => {
        let timestamp = data["backendTimestampMs"];
        return timestamp > info.lastUpdate && timestamp <= end;
    });
    if (truncatedRunData.length === 0) {
        return;
    }
    for (let i = 0; i < truncatedRunData.length; i++) {
        info.applyRunDataEntry(truncatedRunData[i]);
    }
    info.lastUpdate = truncatedRunData[truncatedRunData.length - 1]["backendTimestampMs"];
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

export { RunDisplayInfo, applyNewRunData, getCurrentRunData, getAllRunData };