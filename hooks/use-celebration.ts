"use client"

import { useCallback, useEffect, useRef } from "react"
import confetti from "canvas-confetti"

export function useCelebration() {
  const confettiInstance = useRef<confetti.CreateTypes | null>(null)

  useEffect(() => {
    // Initialize confetti instance if not already
    if (!confettiInstance.current) {
      confettiInstance.current = confetti.create(undefined, {
        resize: true,
        useWorker: true,
      })
    }
  }, [])

  const fireConfetti = useCallback(
    (
      particleRatio = 0.6,
      opts: confetti.Options = {
        spread: 360,
        ticks: 100,
        gravity: 0.8,
        decay: 0.92,
        startVelocity: 35,
        colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
      },
    ) => {
      if (confettiInstance.current) {
        confettiInstance.current({
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        })
      }
    },
    [],
  )

  const fireRealisticConfetti = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
    }

    if (confettiInstance.current) {
      confettiInstance.current({
        ...defaults,
        particleCount: 50,
        scalar: 1.2,
        shapes: ["star"],
      })

      confettiInstance.current({
        ...defaults,
        particleCount: 25,
        scalar: 0.75,
        shapes: ["circle"],
      })
    }
  }, [])

  return { fireConfetti, fireRealisticConfetti }
}
