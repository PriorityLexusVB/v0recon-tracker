"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"
import { useCelebrationStore } from "@/hooks/use-celebration"

export function ConfettiCelebration() {
  const { showConfetti, hideConfetti } = useCelebrationStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (showConfetti && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      })

      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
      }).then(() => {
        // Optional: Hide confetti after it finishes
        setTimeout(hideConfetti, 3000) // Hide after 3 seconds
      })
    }
  }, [showConfetti, hideConfetti])

  if (!showConfetti) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  )
}
