"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
}

interface ConfettiCelebrationProps {
  trigger: boolean
  onComplete?: () => void
}

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
]

export default function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isActive, setIsActive] = useState(false)
  const animationRef = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const hasTriggeredRef = useRef(false)

  const handleComplete = useCallback(() => {
    if (onComplete) {
      // Use setTimeout to avoid calling setState during render
      setTimeout(() => {
        onComplete()
      }, 0)
    }
  }, [onComplete])

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsActive(false)
    setConfetti([])
    hasTriggeredRef.current = false
    handleComplete()
  }, [handleComplete])

  const animateConfetti = useCallback(() => {
    setConfetti((prevConfetti) => {
      const updatedConfetti = prevConfetti
        .map((piece) => ({
          ...piece,
          x: piece.x + piece.vx,
          y: piece.y + piece.vy,
          vy: piece.vy + 0.1, // gravity
          rotation: piece.rotation + piece.rotationSpeed,
        }))
        .filter((piece) => piece.y < window.innerHeight + 50)

      if (updatedConfetti.length === 0) {
        // Schedule cleanup for next tick to avoid state update during render
        setTimeout(() => {
          stopAnimation()
        }, 0)
        return []
      }

      return updatedConfetti
    })

    animationRef.current = requestAnimationFrame(animateConfetti)
  }, [stopAnimation])

  const startConfetti = useCallback(() => {
    if (hasTriggeredRef.current || typeof window === "undefined") return

    hasTriggeredRef.current = true
    setIsActive(true)

    // Create confetti pieces
    const pieces: ConfettiPiece[] = []
    const pieceCount = 50

    for (let i = 0; i < pieceCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }

    setConfetti(pieces)

    // Start animation
    animationRef.current = requestAnimationFrame(animateConfetti)

    // Auto-cleanup after 5 seconds
    timeoutRef.current = setTimeout(() => {
      stopAnimation()
    }, 5000)
  }, [animateConfetti, stopAnimation])

  useEffect(() => {
    if (trigger && !hasTriggeredRef.current) {
      startConfetti()
    }
  }, [trigger, startConfetti])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!isActive || confetti.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
        />
      ))}
    </div>
  )
}
