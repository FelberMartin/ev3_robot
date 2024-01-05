
interface Props {
  discoverStates: Array<Array<DiscoverState>>,
  size: number
}

export enum DiscoverState {
  hidden, wall, no_wall, path, target
}


const tileSize = 90;
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
    <div className="container text-center">
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
      className="col-auto"
      style={{
        width: isVerticalWall ? wallSize : tileSize,
        height: isHorizontalWall ? wallSize : tileSize,
        backgroundColor: isWall ? "grey" : "blue",
        border: "1px solid black", // Add this line for borders
      }}
    >
      {state === DiscoverState.hidden && <h4>?</h4>}
    </div>
  );
}

export default Maze;