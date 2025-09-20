/**
 * 博客路由配置
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { BlogHome } from '@/pages/BlogHome'
import { ArticleDetail } from '@/pages/ArticleDetail'
import { ArticleList } from '@/pages/ArticleList'
import { TestPost } from '@/pages/TestPost'

// 懒加载其他页面组件
const CategoriesPage = React.lazy(() => import('@/pages/Categories'))
const TagsPage = React.lazy(() => import('@/pages/Tags'))
const AboutPage = React.lazy(() => import('@/pages/About'))
const SearchPage = React.lazy(() => import('@/pages/Search'))
const ArchivePage = React.lazy(() => import('@/pages/Archive'))

// 加载中组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export function BlogRoutes() {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 首页 */}
        <Route path="/" element={<BlogHome />} />
        
        {/* 文章详情 */}
        <Route path="/article/:id" element={<ArticleDetail />} />
        
        {/* 测试文章页面 */}
        <Route path="/test-post" element={<TestPost />} />
        
        {/* 文章列表 */}
        <Route path="/articles" element={<ArticleList />} />
        
        {/* 分类页面 */}
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:slug" element={<BlogHome />} />
        
        {/* 标签页面 */}
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/tag/:slug" element={<BlogHome />} />
        
        {/* 搜索页面 */}
        <Route path="/search" element={<SearchPage />} />
        
        {/* 归档页面 */}
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/archive/:month" element={<ArchivePage />} />
        
        {/* 关于页面 */}
        <Route path="/about" element={<AboutPage />} />
        
        {/* 404 页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </React.Suspense>
  )
}

// 404 页面组件
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold">页面未找到</h2>
        <p className="text-muted-foreground">抱歉，您访问的页面不存在。</p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}