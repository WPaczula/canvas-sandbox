import { useEffect, useRef, useState } from "react"
import styles from './app.module.css'

const setupResize = (canvas: HTMLCanvasElement) => {
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  const listener = () => {
    canvas.height = window.innerHeight
    canvas.width = window.innerWidth
  }
  window.addEventListener('resize', listener)

  return () => window.removeEventListener('resize', listener)
}

const animate = (canvas: HTMLCanvasElement, particles: Array<Particle>, hueRef: React.MutableRefObject<number>) => {
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i]

    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx ** 2 + dy ** 2)

      if (distance < 50) {
        const line = new Line(particles[i], particles[j]);
        line.draw(ctx)
      }
    }

    particle.draw(ctx)
    particle.update(canvas)

    if (particle.invisible) {
      particles.splice(i, 1)
      i--;
    }

  }

  hueRef.current += 1

  requestAnimationFrame(() => animate(canvas, particles, hueRef))
}

class Line {
  constructor(p1: Particle, p2: Particle) {
    this.p1 = p1
    this.p2 = p2
  }

  p1: Particle
  p2: Particle

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.strokeStyle = `#ffffff3d`
    ctx.moveTo(this.p1.x, this.p1.y)
    ctx.lineTo(this.p2.x, this.p2.y)
    ctx.stroke()
  }
}

class Particle {
  constructor(x: number, y: number, hue: number) {
    this.x = x
    this.y = y
    this.size = Math.random() * 10 + 2
    this.speedX = Math.random() * 4 - 2
    this.speedY = Math.random() * 4 - 2
    this.invisible = false
    this.color = `hsl(${hue}, 100%, 50%)`
  }

  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  invisible: boolean
  color: string

  update(canvas: HTMLCanvasElement) {
    this.x += this.speedX
    this.y += this.speedY

    if (this.x < 0 || this.x > canvas.width) {
      this.speedX = -1 * this.speedX
    }

    if (this.y < 0 || this.y > canvas.height) {
      this.speedY = -1 * this.speedY
    }

    if (this.size > 0.1) {
      this.size -= 0.1
    } else {
      this.invisible = true
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.shadowColor = this.color
    ctx.shadowBlur = 15
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI)
    ctx.fill()
  }
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Array<Particle>>([])
  const hueRef = useRef<number>(0)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const clear = setupResize(canvasRef.current!)

    return clear
  }, [])

  useEffect(() => {
    if (canvasRef.current && !animated) {
      animate(canvasRef.current, particlesRef.current, hueRef)
      setAnimated(true)
    }
  }, [canvasRef.current, animated])

  return (
    <canvas id="canvas" ref={canvasRef} className={styles.canvas} onMouseMove={(event) => {
      particlesRef.current.push(new Particle(event.clientX, event.clientY, hueRef.current))
      particlesRef.current.push(new Particle(event.clientX, event.clientY, hueRef.current))
      particlesRef.current.push(new Particle(event.clientX, event.clientY, hueRef.current))
    }} />
  )
}

export default App
