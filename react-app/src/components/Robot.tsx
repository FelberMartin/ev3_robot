import { getCanvasMiddleTilePosition, overallSize, tileSize } from '../positions'
import image from './../assets/robot.png'

interface Props {
    posX: number,
    posY: number,
    rotation: number,
}

const Robot = ({ posX, posY, rotation } : Props) => {
    const {x, y} = getCanvasMiddleTilePosition(posX, posY);
    const robotSize = tileSize * 0.8
    const imageTopLeft = {
        x: x - robotSize / 2,
        y: y - robotSize / 2
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
            transform: `rotate(${rotation}deg)`//translate(${x}px, ${y}px)`
        }} />
    </div>
}

export default Robot