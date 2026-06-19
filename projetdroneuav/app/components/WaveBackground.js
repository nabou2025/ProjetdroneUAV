'use client'
import { useEffect, useRef } from 'react'

export default function WaveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    requestAnimationFrame(resize)
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const W = canvas.width
      const H = canvas.height

      // 3 vagues bleues superposées
      const waves = [
        { color: 'rgba(15,40,90,0.95)', amp: 80, freq: 0.008, offset: 0 },
        { color: 'rgba(20,55,120,0.85)', amp: 60, freq: 0.010, offset: 2 },
        { color: 'rgba(30,70,150,0.75)', amp: 45, freq: 0.013, offset: 4 },
      ]

      waves.forEach(wave => {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        for (let x = 0; x <= W; x += 4) {
          const y = H * 0.5
            + Math.sin(x * wave.freq + t + wave.offset) * wave.amp
            + Math.sin(x * wave.freq * 1.7 + t * 0.6 + wave.offset) * (wave.amp * 0.4)
          ctx.lineTo(x, y)
        }
        ctx.lineTo(W, H)
        ctx.lineTo(0, H)
        ctx.closePath()
        ctx.fillStyle = wave.color
        ctx.fill()
      })

      t += 0.012
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}