import React, { useRef, useEffect } from 'react'
import { getCanvasMiddleTilePosition, overallSize } from '../util/positions'

interface Props {
  path: number[][]
}

const MazeCanvas = ({ path } : Props) => {
  
  const canvasRef = useRef(null)

  function resizeCanvasToDisplaySize(canvas) {
    
    const { width, height } = canvas.getBoundingClientRect()

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      return true // here you can return some usefull information like delta width and delta height instead of just true
      // this information can be used in the next redraw...
    }

    return false
  }

  const draw = (ctx, frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // Draw the path
    ctx.beginPath()
    for (let i = 0; i < path.length; i++) {
        const {x, y} = getCanvasMiddleTilePosition(path[i][0], path[i][1]);
        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
    }
    ctx.lineWidth = 10
    ctx.strokeStyle = '#FFA500'
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    let frameCount = 0
    let animationFrameId: number

    resizeCanvasToDisplaySize(canvas)
    
    //Our draw came here
    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])
  
  return <canvas ref={canvasRef} className="mazeCanvas" style={{
      width: overallSize,
      height: overallSize,
  }}
    />
}

export default MazeCanvas