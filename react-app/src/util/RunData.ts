import { DiscoveryState } from "../components/Maze";

interface RunDisplayInfo {
    // Should contain: the position of the robot, the rotation, path (as an array of points), and the discovery states of the cells
    position: [number, number];
    rotation: number;
    path: [number, number][];
    discoveryStates: DiscoveryState[][];
}


function extractRunDisplayInfo(runData: Map<string, string>) : RunDisplayInfo {

}



async function getCurrentRunData() : Promise<Map<string, string>> {
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
    return new Map<string, string>();
}

async function getAllRunData() : Promise<Map<string, string>> {
    try {
        const response = await fetch('http://localhost:8080/allRunData');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('runData received');
        return result;
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
    return new Map<string, string>();
}