import React, { useEffect, useRef, useState } from 'react'

export default function JumpBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [reset, setReset] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const width = 300
    const height = 150
    canvas.width = width
    canvas.height = height

    const gravity = 0.5
    const jumpVel = -8
    let ball = { x: 40, y: height - 20, r: 10, vy: 0 }
    let obstacles: { x: number, y: number, w: number, h: number, type: 'ground' | 'bird' }[] = []
    let frame = 0
    let running = true
    let animationId: number

    function jump() {
      if (ball.y >= height - 20) {
        ball.vy = jumpVel
      }
    }

    function spawn() {
      const isBird = Math.random() < 0.3
      if (isBird) {
        obstacles.push({ x: width, y: 60, w: 30, h: 20, type: 'bird' })
      } else {
        obstacles.push({ x: width, y: height - 10, w: 20, h: 20, type: 'ground' })
      }
    }

    function loop() {
      if (!running) return
      frame++
      ctx.clearRect(0, 0, width, height)

      ball.vy += gravity
      ball.y += ball.vy
      if (ball.y > height - 20) {
        ball.y = height - 20
        ball.vy = 0
      }

      if (frame % 90 === 0) spawn()

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i]
        o.x -= 3
        ctx.fillStyle = o.type === 'bird' ? '#fbbf24' : '#ef4444'
        ctx.fillRect(o.x, o.y - o.h, o.w, o.h)

        const hitX = o.x < ball.x + ball.r && o.x + o.w > ball.x - ball.r
        const hitY = o.y > ball.y - ball.r && o.y - o.h < ball.y + ball.r
        if (hitX && hitY) {
          running = false
          setGameOver(true)
        }
        if (o.x + o.w < 0) {
          obstacles.splice(i, 1)
          setScore(s => s + 1)
        }
      }

      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, height - 10, width, 10)

      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(ball.x, ball.y - ball.r, ball.r, 0, Math.PI * 2)
      ctx.fill()

      if (running) animationId = requestAnimationFrame(loop)
    }

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space') jump()
    }

    canvas.addEventListener('mousedown', jump)
    window.addEventListener('keydown', keyHandler)
    loop()

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mousedown', jump)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [reset])

  const restart = () => {
    setScore(0)
    setGameOver(false)
    setReset(r => r + 1)
  }

  return (
    <div className="gamebox">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <div className="muted">Jump and avoid obstacles</div>
        <div className="muted">Score: <span className="score">{score}</span></div>
      </div>
      <canvas ref={canvasRef} style={{width:'100%',background:'#e2e8f0'}} />
      {gameOver && <div style={{marginTop:8}}>💥 Game Over</div>}
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button className="btn secondary" onClick={restart}>Restart</button>
      </div>
    </div>
  )
}
