import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 hidden md:block"
      animate={{ x: position.x - 16, y: position.y - 16 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.4 }}
    >
      <div className="w-8 h-8 rounded-full bg-cyan-400/40 border border-cyan-300/70 blur-sm mix-blend-screen" />
    </motion.div>
  )
}
