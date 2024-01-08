
interface Props {
  discoverStates: Array<Array<DiscoverState>>,
  size: number
}

export enum DiscoverState {
  hidden = "hidden", 
  wall = "wall", 
  no_wall = "no_wall",
  path = "path",
  target = "target"
}


const tileSize = 140;
const wallSize = 24;    // this is the minimum width for a column, so it cant get smaller than this

function Maze({ discoverStates, size = 4 } : Props) {
  const tileCount = size;
  const wallCount = size + 1;
  const gridSegmentCounts = tileCount + wallCount;
  const overallSize = tileCount * tileSize + wallCount * wallSize;

  const getDiscoverState = function(row: number, col: number) {
    return discoverStates[row][col]
  }

  return (
    <div className="container text-center maze">
      {[...Array(gridSegmentCounts)].map((_, index) => (
        <div
          key={index}
          className="row"
        >
          {[...Array(gridSegmentCounts)].map((_, colIndex) =>
            
            GridSegment(index, colIndex, getDiscoverState(index, colIndex))
          )}
        </div>
      ))}
    </div>
  );
}

function GridSegment(rowIndex: number, colIndex: number, state: DiscoverState) {
  const isVerticalWall = colIndex % 2 === 0;
  const isHorizontalWall = rowIndex % 2 === 0;
  const isWall = isVerticalWall || isHorizontalWall;
  return (
    <div
      key={colIndex}
      className={`col-auto ${isWall ? "wall" : "tile"} ${state.toString()}`}
      style={{
        width: isVerticalWall ? wallSize : tileSize,
        height: isHorizontalWall ? wallSize : tileSize,
      }}
    >
    </div>
  );
}

export default Maze;