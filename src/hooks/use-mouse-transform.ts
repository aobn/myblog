/**
 * 鼠标动态变换 Hook
 * 根据鼠标位置动态改变元素的拉升效果
 * 
 * @author xxh
 * @date 2025-09-22
 */

import { useRef, useCallback } from 'react'

interface MouseTransformOptions {
  scale?: number // 最大缩放倍数
  rotateX?: number // X轴最大旋转角度
  rotateY?: number // Y轴最大旋转角度
  perspective?: number // 透视距离
}

export function useMouseTransform<T extends HTMLElement = HTMLDivElement>(options: MouseTransformOptions = {}) {
  const {
    scale = 1.05,
    rotateX = 10,
    rotateY = 10,
    perspective = 1000
  } = options

  const elementRef = useRef<T>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!elementRef.current) return

    const element = elementRef.current
    const rect = element.getBoundingClientRect()
    
    // 计算鼠标相对于元素中心的位置 (-1 到 1)
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    
    // 计算变换值
    const rotateXValue = -y * rotateX // 反向，鼠标向上时元素向前倾
    const rotateYValue = x * rotateY
    const scaleValue = scale
    
    // 应用变换
    element.style.transform = `
      perspective(${perspective}px)
      rotateX(${rotateXValue}deg)
      rotateY(${rotateYValue}deg)
      scale(${scaleValue})
    `
  }, [scale, rotateX, rotateY, perspective])

  const handleMouseEnter = useCallback(() => {
    if (!elementRef.current) return
    elementRef.current.style.transition = 'transform 0.1s ease-out'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!elementRef.current) return
    
    // 重置变换
    elementRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    elementRef.current.style.transition = 'transform 0.3s ease-out'
  }, [])

  return {
    ref: elementRef,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave
  }
}