
const size = 4;
const tileSize = 120;
const wallSize = 12;

const tileCount = size;
const wallCount = size + 1;
const gridSegmentCounts = tileCount + wallCount;
const overallSize = tileCount * tileSize + wallCount * wallSize;

export { size, tileSize, wallSize, tileCount, wallCount, gridSegmentCounts, overallSize };

const getCanvasMiddleTilePosition = (xTile: number, yTile: number) => {
    const x = xTile * (tileSize + wallSize) + wallSize + tileSize / 2;
    const y = yTile * (tileSize + wallSize) + wallSize + tileSize / 2;
    return { x, y };
}

const getDiscoveryStateIndices = (tileIndices: [number, number]): [number, number] => {
    const x = tileIndices[0] * 2 + 1;
    const y = tileIndices[1] * 2 + 1;
    return [x, y];
}

const getWallNextWallIndices = (dsIndices: [number, number], direction: [number, number]): [number, number] => {
    const x = dsIndices[0] + direction[0];
    const y = dsIndices[1] + direction[1];
    return [x, y];
}

const getDistanceToWall = (tilePosition: [number, number], wallIndicies: [number, number]): number => {
    let xWall = wallIndicies[0] / 2 - 0.5;
    let yWall = wallIndicies[1] / 2 - 0.5;
    let xTile = tilePosition[0];
    let yTile = tilePosition[1];
    let xDiff = xWall - xTile;
    let yDiff = yWall - yTile;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

/** 
 * Returns the number of degrees the current rotation is off from the nearest cardinal direction.
 * For example, if the rotation is 45 degrees, the function should return 45.
 * If the rotation is 50 degrees, the function should return 40. 
 */
const getRotationOffsetFromCardinalDirection = (rotation: number): number => {
    let rotationOffset = rotation % 90;
    if (rotationOffset > 45) {
        rotationOffset = 90 - rotationOffset;
    }
    return rotationOffset;
}

export { getCanvasMiddleTilePosition, getDiscoveryStateIndices, getWallNextWallIndices, getDistanceToWall, getRotationOffsetFromCardinalDirection };