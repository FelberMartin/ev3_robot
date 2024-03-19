import { getCanvasMiddleTilePosition, overallSize, tileSize } from '../util/positions'

interface Props {
    position: [number, number],
    rotation: number,
    show: boolean
}

const Robot = ({ position, rotation, show } : Props) => {
    var {x, y} = getCanvasMiddleTilePosition(position[0], position[1]);
    const robotSize = tileSize * 0.8
    var imageTopLeft = {
        x: x - robotSize / 2,
        y: y - robotSize / 2
    }

    return <div className="robot" style={{
        width: overallSize,
        height: overallSize,
        opacity: show ? 1 : 0.5
    }}>
        <img src="https://lehre.bpm.in.tum.de/~ge35diz/practicum/ev3_robot/react-app/src/assets/robot.png" style={{
            width: robotSize,
            height: robotSize,
            marginLeft: imageTopLeft.x,
            marginTop: imageTopLeft.y,
            transform: `rotate(${rotation}deg)`
        }} />
    </div>
}

export default Robot