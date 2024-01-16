import { DiscoveryState } from "../components/Maze";
import { gridSegmentCounts } from "./positions";

class RunDisplayInfo {
    position: [number, number];
    rotation: number;
    path: [number, number][];
    discoveryStates: DiscoveryState[][];

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
    }
}

function extractRunDisplayInfoTrunctated(runData: Array<any>, durationMs: number) : RunDisplayInfo {
    let start = runData[0]["stream:timestamp"];
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
        let type = runData[i]["stream:source"]
        if (type === "model") {
            let command = runData[i]["stream:value"];
            // command can be "forward", "left", "right"
            if (command === "forward") {
                let position = runData[i]["stream:position"];
                info.position = [position[0], position[1]];
                info.path.push([position[0], position[1]]);
                // info.discoveryStates[position[0]][position[1]] = DiscoveryState.path;
            } else if (command === "left") {
                info.rotation = (info.rotation + 270) % 360;
            } else if (command === "right") {
                info.rotation = (info.rotation + 90) % 360;
            }
        }
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