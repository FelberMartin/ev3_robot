import { gridSegmentCounts, overallSize, tileSize, wallSize } from "../util/positions";

interface Props {
  discoverStates: Array<Array<DiscoveryState>>,
}

export enum DiscoveryState {
  hidden = "hidden", 
  wall = "wall", 
  no_wall = "no_wall",
  path = "path",
  target = "target"
}

function Maze({ discoverStates } : Props) {

  const getDiscoverState = function(row: number, col: number) {
    return discoverStates[col][row]
  }

  return (
    <div className="container text-center maze" style={{
      width: overallSize,
      height: overallSize,
    }}>
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

function GridSegment(rowIndex: number, colIndex: number, state: DiscoveryState) {
  const isVerticalWall = colIndex % 2 === 0;
  const isHorizontalWall = rowIndex % 2 === 0;
  const isWall = isVerticalWall || isHorizontalWall;
  return (
    <div
      key={colIndex}
      className={`col-auto g-0 ${isWall ? "wall" : "tile"} ${state.toString()}`}
      style={{
        width: isVerticalWall ? wallSize : tileSize,
        height: isHorizontalWall ? wallSize : tileSize,
      }}
    >
    </div>
  );
}

export default Maze;