import { useEffect, useState } from 'react';
import { RunDisplayInfo } from '../util/RunData';
import { getCanvasMiddleTilePosition, overallSize, tileSize } from '../util/positions'
import image from './../assets/robot.png'
import { animateValue } from '../util/Animation';

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
        <img src={image} style={{
            width: robotSize,
            height: robotSize,
            marginLeft: imageTopLeft.x,
            marginTop: imageTopLeft.y,
            transform: `rotate(${rotation}deg)`
        }} />
    </div>
}

export default Robot