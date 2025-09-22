/**
 * 页面过渡组件（无动画）
 * 
 * @author xxh
 * @date 2025-09-22
 */

import * as React from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}