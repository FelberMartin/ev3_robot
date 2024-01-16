import exp from "constants";
import { DiscoveryState } from "../components/Maze";
import { gridSegmentCounts } from "./positions";

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
        let source = runDataEntry["stream:source"]
        if (source === "model") {
            let command = runDataEntry["stream:value"];
            // command can be "forward", "left", "right"
            if (command === "forward") {
                this._moveForward();
            } else if (command === "left") {
                this.rotation = (this.rotation + 270) % 360;
            } else if (command === "right") {
                this.rotation = (this.rotation + 90) % 360;
            }
        } else if (source === "robot") {
            let sensorData = runDataEntry["stream:value"];
            this.sensorData = sensorData;
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
        // TODO: update discoveryStates
    }

}

function extractRunDisplayInfoTrunctated(runData: Array<any>, durationMs: number) : RunDisplayInfo {
    let startString = runData[0]["stream:timestamp"];
    let start = new Date(startString);
    let end = new Date(start);
    end.setMilliseconds(end.getMilliseconds() + durationMs);
    let truncatedRunData = runData.filter((data) => {
        let timestamp = new Date(data["stream:timestamp"]);
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