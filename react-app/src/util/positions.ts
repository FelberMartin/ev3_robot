
const size = 4;
const tileSize = 140;
const wallSize = 14;

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

const getDiscoveryStateIndices = (tileIndices: [number, number]) => {
    const x = tileIndices[0] * 2 + 1;
    const y = tileIndices[1] * 2 + 1;
    return [x, y];
}

const getWallIndices = (tileIndices: [number, number], rotation: number) => {
    let [x, y] = getDiscoveryStateIndices(tileIndices);
    switch (rotation) {
        case 0:
            y--;
            break;
        case 90:
            x++;
            break;
        case 180:
            y++;
            break;
        case 270:
            x--;
            break;
    }
    return [x, y];
}

export { getCanvasMiddleTilePosition, getDiscoveryStateIndices, getWallIndices };