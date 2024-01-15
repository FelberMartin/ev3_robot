import { RunDisplayInfo } from '../util/RunData';
import { getCanvasMiddleTilePosition, overallSize, tileSize } from '../util/positions'
import image from './../assets/robot.png'

interface Props {
    info: RunDisplayInfo
    show: boolean
}

const Robot = ({ info, show } : Props) => {
    const {x, y} = getCanvasMiddleTilePosition(info.position[0], info.position[1]);
    const robotSize = tileSize * 0.8
    const imageTopLeft = {
        x: x - robotSize / 2,
        y: y - robotSize / 2
    }

    if (!show) {
        return null
    }

    return <div className="robot" style={{
        width: overallSize,
        height: overallSize,
    }}>
        <img src={image} style={{
            width: robotSize,
            height: robotSize,
            marginLeft: imageTopLeft.x,
            marginTop: imageTopLeft.y,
            transform: `rotate(${info.rotation}deg)`
        }} />
    </div>
}

export default Robot