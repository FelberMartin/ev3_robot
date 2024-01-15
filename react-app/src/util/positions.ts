
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

export { getCanvasMiddleTilePosition };