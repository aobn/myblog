/**
 * 博客布局组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BlogHeader } from '@/components/blog/blog-header'
import { BlogFooter } from '@/components/blog/blog-footer'

/**
 * 博客布局组件
 * 包含头部导航、主要内容区域和底部信息
 */
export function BlogLayout() {
  const location = useLocation()

  // 路由变化时立即跳转到顶部
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 头部导航 */}
      <BlogHeader />
      
      {/* 主要内容区域 */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* 底部信息 */}
      <BlogFooter />
    </div>
  )
}