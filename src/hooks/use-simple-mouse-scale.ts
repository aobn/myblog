/**
 * 简单鼠标缩放 Hook
 * 根据鼠标位置动态改变元素的缩放效果
 * 
 * @author xxh
 * @date 2025-09-22
 */

import { useRef, useCallback } from 'react'

interface SimpleMouseScaleOptions {
  baseScale?: number // 基础缩放倍数
  maxScale?: number // 最大缩放倍数
  intensity?: number // 效果强度 (0-1)
}

export function useSimpleMouseScale<T extends HTMLElement = HTMLButtonElement>(options: SimpleMouseScaleOptions = {}) {
  const {
    baseScale = 1,
    maxScale = 1.1,
    intensity = 0.5
  } = options

  const elementRef = useRef<T>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!elementRef.current) return

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    
    // 计算鼠标到元素中心的距离
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = Math.abs(e.clientX - centerX)
    const distanceY = Math.abs(e.clientY - centerY)
    const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2))
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
    
    // 计算缩放值 (距离中心越近，缩放越大)
    const normalizedDistance = Math.min(distance / maxDistance, 1)
    const scaleValue = baseScale + (maxScale - baseScale) * (1 - normalizedDistance) * intensity
    
    // 应用缩放
    element.style.transform = `scale(${scaleValue})`
  }, [baseScale, maxScale, intensity])

  const handleMouseEnter = useCallback(() => {
    if (!elementRef.current) return
    elementRef.current.style.transition = 'transform 0.1s ease-out'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current) return
    
    // 重置缩放
    elementRef.current.style.transform = `scale(${baseScale})`
    elementRef.current.style.transition = 'transform 0.3s ease-out'
  }, [baseScale])

  return {
    ref: elementRef,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }
}