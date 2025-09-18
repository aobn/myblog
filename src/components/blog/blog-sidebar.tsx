/**
 * 博客侧边栏组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Link } from 'react-router-dom'
import { Calendar, Tag, Folder, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useBlogStore } from '@/store/blog-store'
import type { Article, Category, Tag as TagType } from '@/types/blog'
import { cn } from '@/lib/utils'

interface BlogSidebarProps {
  className?: string
}

// 模拟数据 - 实际项目中应该从API获取
const mockRecentArticles: Article[] = [
  {
    id: '1',
    title: 'React 19 新特性详解',
    excerpt: '深入了解 React 19 带来的革命性变化',
    publishedAt: '2025-09-15',
    readTime: 8,
    viewCount: 1250,
    likeCount: 89,
  } as Article,
  {
    id: '2',
    title: 'TypeScript 5.0 实战指南',
    excerpt: '掌握 TypeScript 最新版本的核心功能',
    publishedAt: '2025-09-12',
    readTime: 12,
    viewCount: 980,
    likeCount: 67,
  } as Article,
  {
    id: '3',
    title: 'Tailwind CSS 最佳实践',
    excerpt: '构建现代化 UI 的实用技巧',
    publishedAt: '2025-09-10',
    readTime: 6,
    viewCount: 756,
    likeCount: 45,
  } as Article,
]

const mockCategories: Category[] = [
  { id: '1', name: '前端开发', slug: 'frontend', articleCount: 25, color: '#3b82f6' },
  { id: '2', name: 'React', slug: 'react', articleCount: 18, color: '#06b6d4' },
  { id: '3', name: 'TypeScript', slug: 'typescript', articleCount: 12, color: '#8b5cf6' },
  { id: '4', name: '工具分享', slug: 'tools', articleCount: 8, color: '#10b981' },
]

const mockTags: TagType[] = [
  { id: '1', name: 'JavaScript', slug: 'javascript', articleCount: 32 },
  { id: '2', name: 'CSS', slug: 'css', articleCount: 28 },
  { id: '3', name: 'Vue.js', slug: 'vuejs', articleCount: 15 },
  { id: '4', name: 'Node.js', slug: 'nodejs', articleCount: 12 },
  { id: '5', name: '性能优化', slug: 'performance', articleCount: 9 },
  { id: '6', name: '设计模式', slug: 'design-patterns', articleCount: 7 },
]

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

export function BlogSidebar({ className }: BlogSidebarProps) {
  const { selectedCategory, selectedTag, setSelectedCategory, setSelectedTag } = useBlogStore()

  return (
    <aside className={cn("space-y-6", className)}>
      {/* 最新文章 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            最新文章
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRecentArticles.map((article, index) => (
            <div key={article.id}>
              <Link 
                to={`/article/${article.id}`}
                className="group block space-y-2"
              >
                <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{article.viewCount}</span>
                  </div>
                </div>
              </Link>
              {index < mockRecentArticles.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 文章分类 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Folder className="h-5 w-5" />
            文章分类
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className="w-full justify-between h-auto p-3"
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {category.articleCount}
              </Badge>
            </Button>
          ))}
          
          <Link to="/categories">
            <Button variant="outline" className="w-full mt-4">
              查看所有分类
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 热门标签 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            热门标签
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockTags.map((tag) => (
              <Button
                key={tag.id}
                variant={selectedTag === tag.id ? "default" : "outline"}
                size="sm"
                className="h-auto px-3 py-1.5 text-xs"
                onClick={() => setSelectedTag(
                  selectedTag === tag.id ? null : tag.id
                )}
              >
                {tag.name}
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {tag.articleCount}
                </Badge>
              </Button>
            ))}
          </div>
          
          <Link to="/tags">
            <Button variant="outline" className="w-full mt-4">
              查看所有标签
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 归档 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            文章归档
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { month: '2025年9月', count: 8 },
            { month: '2025年8月', count: 12 },
            { month: '2025年7月', count: 15 },
            { month: '2025年6月', count: 9 },
          ].map((archive) => (
            <Link
              key={archive.month}
              to={`/archive/${archive.month}`}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">{archive.month}</span>
              <Badge variant="secondary" className="text-xs">
                {archive.count}
              </Badge>
            </Link>
          ))}
          
          <Link to="/archive">
            <Button variant="outline" className="w-full mt-4">
              查看完整归档
            </Button>
          </Link>
        </CardContent>
      </Card>
    </aside>
  )
}