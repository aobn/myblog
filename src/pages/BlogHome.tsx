/**
 * 博客首页组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { ArticleCard } from '@/components/blog/article-card'
import { useBlogStore } from '@/store/blog-store'
import type { Article } from '@/types/blog'
import { cn } from '@/lib/utils'

// 模拟文章数据
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'React 19 新特性深度解析：并发渲染与 Suspense 的革命性改进',
    content: '',
    excerpt: '深入探讨 React 19 带来的并发渲染机制、Suspense 边界优化，以及新的 Hook API 如何改变我们的开发方式。',
    author: {
      id: '1',
      name: '张三',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      bio: '前端架构师'
    },
    category: { id: '1', name: 'React', slug: 'react', articleCount: 18, color: '#61dafb' },
    tags: [
      { id: '1', name: 'React', slug: 'react', articleCount: 32 },
      { id: '2', name: 'JavaScript', slug: 'javascript', articleCount: 45 }
    ],
    publishedAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z',
    readTime: 12,
    viewCount: 1250,
    likeCount: 89,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    isPublished: true
  },
  {
    id: '2',
    title: 'TypeScript 5.0 实战指南：类型系统的新突破',
    content: '',
    excerpt: '全面解析 TypeScript 5.0 的新特性，包括装饰器、const 断言、模板字面量类型等高级功能的实际应用。',
    author: {
      id: '2',
      name: '李四',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      bio: '全栈开发工程师'
    },
    category: { id: '2', name: 'TypeScript', slug: 'typescript', articleCount: 12, color: '#3178c6' },
    tags: [
      { id: '3', name: 'TypeScript', slug: 'typescript', articleCount: 28 },
      { id: '4', name: '类型系统', slug: 'type-system', articleCount: 15 }
    ],
    publishedAt: '2025-09-12T14:30:00Z',
    updatedAt: '2025-09-12T14:30:00Z',
    readTime: 15,
    viewCount: 980,
    likeCount: 67,
    coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
    isPublished: true
  },
  {
    id: '3',
    title: 'Tailwind CSS 最佳实践：构建可维护的设计系统',
    content: '',
    excerpt: '学习如何使用 Tailwind CSS 构建一致性强、可维护的设计系统，包括组件抽象和主题定制。',
    author: {
      id: '3',
      name: '王五',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
      bio: 'UI/UX 设计师'
    },
    category: { id: '3', name: 'CSS', slug: 'css', articleCount: 20, color: '#06b6d4' },
    tags: [
      { id: '5', name: 'CSS', slug: 'css', articleCount: 35 },
      { id: '6', name: 'Tailwind', slug: 'tailwind', articleCount: 18 }
    ],
    publishedAt: '2025-09-10T09:15:00Z',
    updatedAt: '2025-09-10T09:15:00Z',
    readTime: 8,
    viewCount: 756,
    likeCount: 45,
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    isPublished: true
  },
  {
    id: '4',
    title: 'Vite 构建优化：提升开发体验的实用技巧',
    content: '',
    excerpt: '深入了解 Vite 的构建机制，掌握性能优化、插件开发和部署配置的最佳实践。',
    author: {
      id: '1',
      name: '张三',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      bio: '前端架构师'
    },
    category: { id: '4', name: '工具', slug: 'tools', articleCount: 8, color: '#10b981' },
    tags: [
      { id: '7', name: 'Vite', slug: 'vite', articleCount: 12 },
      { id: '8', name: '构建工具', slug: 'build-tools', articleCount: 9 }
    ],
    publishedAt: '2025-09-08T16:45:00Z',
    updatedAt: '2025-09-08T16:45:00Z',
    readTime: 10,
    viewCount: 623,
    likeCount: 38,
    isPublished: true
  }
]

export function BlogHome() {
  const { 
    currentPage, 
    totalPages, 
    selectedCategory, 
    selectedTag,
    setCurrentPage,
    resetFilters 
  } = useBlogStore()

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = React.useState<'latest' | 'popular' | 'trending'>('latest')

  // 精选文章（取前2篇）
  const featuredArticles = mockArticles.slice(0, 2)
  // 普通文章列表
  const regularArticles = mockArticles.slice(2)

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 清除筛选条件
  const handleClearFilters = () => {
    resetFilters()
  }

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区域 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 精选文章区域 */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold">精选文章</h2>
                <Badge variant="secondary">Featured</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="featured"
                  />
                ))}
              </div>
            </section>

            <Separator />

            {/* 文章列表区域 */}
            <section>
              {/* 筛选和排序控制 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">最新文章</h2>
                  {(selectedCategory || selectedTag) && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {selectedCategory ? '分类筛选' : '标签筛选'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-xs"
                      >
                        清除筛选
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* 排序选择 */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">最新发布</SelectItem>
                      <SelectItem value="popular">最受欢迎</SelectItem>
                      <SelectItem value="trending">热门趋势</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 视图模式切换 */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 文章网格/列表 */}
              <div className={cn(
                "gap-6",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2" 
                  : "flex flex-col space-y-4"
              )}>
                {regularArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>

              {/* 分页控制 */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </section>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </main>
    </div>
  )
}