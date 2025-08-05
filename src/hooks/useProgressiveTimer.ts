import { useState, useEffect, useRef, useCallback } from 'react'
import { AIGenerationStatus } from '@/types/aiGeneration'

interface UseProgressiveTimerOptions {
  status: AIGenerationStatus
  isActive: boolean
}

interface UseProgressiveTimerReturn {
  progress: number
  phase: 'validating' | 'initial' | 'main' | 'final' | 'waiting'
  elapsedTime: number
}

/**
 * Progressive timer hook for AI generation loading states
 * Provides smooth, time-based progress updates with multiple phases
 * 
 * Timeline (24 seconds total):
 * - Validating: Static 10%
 * - Initial: Static 15% 
 * - Main: 15% → 95% over 20 seconds (4% per second)
 * - Final: 95% → 99% over 4 seconds (1% per second)
 * - Waiting: Hold at 99% until completion
 */
export const useProgressiveTimer = ({ 
  status, 
  isActive 
}: UseProgressiveTimerOptions): UseProgressiveTimerReturn => {
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [phase, setPhase] = useState<UseProgressiveTimerReturn['phase']>('validating')
  
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const isRunningRef = useRef(false)
  const speedMultiplierRef = useRef(1.0) // Current speed multiplier (±2%)
  const lastSpeedChangeRef = useRef(0) // Last time speed was changed
  const accumulatedProgressRef = useRef(0) // Accumulated progress for smooth transitions

  // Update speed multiplier every 6 seconds during main processing
  const updateSpeedMultiplier = useCallback((elapsed: number) => {
    const timeSinceLastChange = elapsed - lastSpeedChangeRef.current
    
    // Change speed every 6 seconds during main processing phase (but not in final 4 seconds)
    if (elapsed >= 0.1 && elapsed <= 16 && timeSinceLastChange >= 6) {
      // Generate random speed variation: ±20% (0.8 to 1.2)
      const variation = (Math.random() - 0.5) * 0.4 // -0.2 to +0.2
      speedMultiplierRef.current = 1.0 + variation
      lastSpeedChangeRef.current = elapsed
    }
  }, [])

  // Calculate progress based on elapsed time with speed variations
  const calculateProgress = useCallback((elapsed: number): { progress: number; phase: UseProgressiveTimerReturn['phase'] } => {
    // Update speed multiplier if needed
    updateSpeedMultiplier(elapsed)

    // Phase 1: Validating (static)
    if (status === 'validating') {
      return { progress: 10, phase: 'validating' }
    }

    // Phase 2: Initial jump (static)
    if (elapsed < 0.1) { // First 100ms
      return { progress: 15, phase: 'initial' }
    }

    // Phase 3: Main processing with speed variations (15% → 95% over 20 seconds)
    if (elapsed <= 20) {
      // Calculate target progress (what we should be at without variations)
      const targetProgress = 15 + ((elapsed / 20) * 80)
      
      // Calculate ideal progress with speed variations
      const idealProgress = 15 + ((elapsed / 20) * 80 * speedMultiplierRef.current)
      
      // Apply stronger correction in final 4 seconds (16-20 seconds)
      let correctionFactor
      if (elapsed <= 16) {
        // Light correction during variation period
        correctionFactor = elapsed / 40 // Gentle correction factor
      } else {
        // Strong correction in final 4 seconds to ensure exact timing
        const finalPhaseProgress = (elapsed - 16) / 4 // 0 to 1 over final 4 seconds
        correctionFactor = 0.4 + (finalPhaseProgress * 0.6) // Ramp from 0.4 to 1.0
      }
      
      const finalProgress = idealProgress * (1 - correctionFactor) + targetProgress * correctionFactor
      
      return { progress: Math.min(finalProgress, 95), phase: 'main' }
    }

    // Phase 4: Final stretch (95% → 99% over 4 seconds)
    if (elapsed <= 24) {
      const finalElapsed = elapsed - 20 // Time since entering final phase
      const finalProgress = 95 + (finalElapsed * 1) // 1% per second
      return { progress: Math.min(finalProgress, 99), phase: 'final' }
    }

    // Phase 5: Waiting (hold at 99%)
    return { progress: 99, phase: 'waiting' }
  }, [status, updateSpeedMultiplier])

  // Animation loop
  const animate = useCallback(() => {
    if (!isRunningRef.current || !startTimeRef.current) return

    const now = Date.now()
    const elapsed = (now - startTimeRef.current) / 1000 // Convert to seconds
    
    const { progress: newProgress, phase: newPhase } = calculateProgress(elapsed)
    
    setProgress(newProgress)
    setElapsedTime(elapsed)
    setPhase(newPhase)

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [calculateProgress])

  // Start timer
  const startTimer = useCallback(() => {
    if (isRunningRef.current) return

    startTimeRef.current = Date.now()
    isRunningRef.current = true
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [animate])

  // Stop timer
  const stopTimer = useCallback(() => {
    isRunningRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
  }, [])

  // Reset timer
  const resetTimer = useCallback(() => {
    stopTimer()
    setProgress(0)
    setElapsedTime(0)
    setPhase('validating')
    startTimeRef.current = undefined
    // Reset speed variation tracking
    speedMultiplierRef.current = 1.0
    lastSpeedChangeRef.current = 0
    accumulatedProgressRef.current = 0
  }, [stopTimer])

  // Handle status changes
  useEffect(() => {
    const shouldRun = isActive && ['validating', 'generating', 'regenerating'].includes(status)
    
    if (shouldRun) {
      // Start or continue timer
      if (!isRunningRef.current) {
        startTimer()
      }
    } else {
      // Stop and reset timer
      resetTimer()
    }

    return () => {
      stopTimer()
    }
  }, [status, isActive, startTimer, stopTimer, resetTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  return {
    progress: Math.round(progress * 100) / 100, // Round to 2 decimal places
    phase,
    elapsedTime: Math.round(elapsedTime * 100) / 100 // Round to 2 decimal places
  }
}