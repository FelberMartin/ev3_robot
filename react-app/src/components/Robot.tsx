import { useEffect, useState } from 'react';
import { RunDisplayInfo } from '../util/RunData';
import { getCanvasMiddleTilePosition, overallSize, tileSize } from '../util/positions'
import image from './../assets/robot.png'
import { animateValue } from '../util/Animation';

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

    let [animatedX, setAnimatedX] = useState(imageTopLeft.x);
    let [animatedY, setAnimatedY] = useState(imageTopLeft.y);
    let [animatedRotation, setAnimatedRotation] = useState(info.rotation);

    useEffect(() => {
        animateValue(animatedX, imageTopLeft.x, setAnimatedX, 200);
        animateValue(animatedY, imageTopLeft.y, setAnimatedY, 200);
        animateValue(animatedRotation, info.rotation, setAnimatedRotation, 100);
    }, [info]);

    return <div className="robot" style={{
        width: overallSize,
        height: overallSize,
        opacity: show ? 1 : 0.5
    }}>
        <img src={image} style={{
            width: robotSize,
            height: robotSize,
            marginLeft: animatedX,
            marginTop: animatedY,
            transform: `rotate(${animatedRotation}deg)`
        }} />
    </div>
}

export default Robot