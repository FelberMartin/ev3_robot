import React, { useRef, useEffect } from 'react'
import Maze, { overallSize } from './Maze'

const MazeCanvas = props => {
  
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
    
    // draw background a border around the canvas
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    

    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(50, 100, 20*2, 0, 2*Math.PI)
    ctx.fill()
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
  
  return <canvas ref={canvasRef} className="mazeCanvas" {...props} style={{
      width: overallSize,
      height: overallSize,
  }}
    />
}

export default MazeCanvas