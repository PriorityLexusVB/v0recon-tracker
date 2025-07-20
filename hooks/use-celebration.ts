"use client"

import { useState, useCallback } from "react"

interface CelebrationSounds {
  completion: HTMLAudioElement | null
  confetti: HTMLAudioElement | null
  success: HTMLAudioElement | null
}

export function useCelebration() {
  const [sounds, setSounds] = useState<CelebrationSounds>({
    completion: null,
    confetti: null,
    success: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeSounds = useCallback(() => {
    if (typeof window === "undefined" || isInitialized) return

    try {
      // Create audio elements with fallback sounds
      const completionSound = new Audio()
      const confettiSound = new Audio()
      const successSound = new Audio()

      // Set audio sources - these will fallback to data URIs if files don't exist
      completionSound.src = "/sounds/completion.mp3"
      confettiSound.src = "/sounds/confetti.mp3"
      successSound.src = "/sounds/success.mp3"

      // Fallback to generated tones if files don't load
      completionSound.onerror = () => {
        completionSound.src = generateSuccessTone()
      }

      confettiSound.onerror = () => {
        confettiSound.src = generateCelebrationTone()
      }

      successSound.onerror = () => {
        successSound.src = generateChimeTone()
      }

      // Set volume
      completionSound.volume = 0.6
      confettiSound.volume = 0.4
      successSound.volume = 0.5

      setSounds({
        completion: completionSound,
        confetti: confettiSound,
        success: successSound,
      })

      setIsInitialized(true)
    } catch (error) {
      console.warn("Could not initialize celebration sounds:", error)
    }
  }, [isInitialized])

  const playCompletionSound = useCallback(() => {
    if (!isInitialized) initializeSounds()

    try {
      sounds.completion?.play().catch(() => {
        // Fallback to speech synthesis if audio fails
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance("Vehicle completed!")
          utterance.rate = 1.2
          utterance.pitch = 1.2
          utterance.volume = 0.3
          speechSynthesis.speak(utterance)
        }
      })
    } catch (error) {
      console.warn("Could not play completion sound:", error)
    }
  }, [sounds.completion, isInitialized, initializeSounds])

  const playConfettiSound = useCallback(() => {
    if (!isInitialized) initializeSounds()

    try {
      sounds.confetti?.play().catch(() => {
        // Silent fallback for confetti sound
      })
    } catch (error) {
      console.warn("Could not play confetti sound:", error)
    }
  }, [sounds.confetti, isInitialized, initializeSounds])

  const playSuccessSound = useCallback(() => {
    if (!isInitialized) initializeSounds()

    try {
      sounds.success?.play().catch(() => {
        // Silent fallback
      })
    } catch (error) {
      console.warn("Could not play success sound:", error)
    }
  }, [sounds.success, isInitialized, initializeSounds])

  return {
    initializeSounds,
    playCompletionSound,
    playConfettiSound,
    playSuccessSound,
  }
}

// Generate fallback audio tones using Web Audio API
function generateSuccessTone(): string {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
  } catch {
    return ""
  }
}

function generateCelebrationTone(): string {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Celebration arpeggio
    oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime) // C4
    oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.1) // E4
    oscillator.frequency.setValueAtTime(392.0, audioContext.currentTime + 0.2) // G4
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.3) // C5

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.6)

    return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
  } catch {
    return ""
  }
}

function generateChimeTone(): string {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5
    oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.2) // C#6

    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1.0)

    return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
  } catch {
    return ""
  }
}
