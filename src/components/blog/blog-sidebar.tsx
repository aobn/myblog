/**
 * 博客侧边栏组件
 * 
 * @author xxh
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag, Folder, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { UserIpInfo } from './UserIpInfo'

import type { Article, Category, Tag as TagType } from '@/types/blog'
import { cn } from '@/lib/utils'
import { loadAllPosts } from '@/lib/simple-post-loader'

interface BlogSidebarProps {
  className?: string
}

// 处理分类数据
const processCategoriesData = (articles: Article[]): Category[] => {
  const categoryMap = new Map<string, { name: string; color: string }>()
  
  articles
    .filter(article => article.isPublished && article.category)
    .forEach(article => {
      const category = article.category
      const categoryName = category.name
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          color: category.color || '#6b7280'
        })
      }
    })
  
  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    id: `category-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name: data.name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    articleCount: articles.filter(article => 
      article.isPublished && article.category?.name === name
    ).length,
    color: data.color
  })).sort((a, b) => b.articleCount - a.articleCount).slice(0, 10) // 只取前10个分类
}

// 处理标签数据
const processTagsData = (articles: Article[]): TagType[] => {
  const tagMap = new Map<string, { name: string; color: string }>()
  
  articles
    .filter(article => article.isPublished && article.tags)
    .forEach(article => {
      const tags = Array.isArray(article.tags) ? article.tags : []
      tags.forEach(tag => {
        const tagName = tag.name
        if (tagName && !tagMap.has(tagName)) {
          tagMap.set(tagName, {
            name: tagName,
            color: tag.color || '#6b7280'
          })
        }
      })
    })
  
  return Array.from(tagMap.entries()).map(([name, data]) => ({
    id: `tag-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name: data.name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    articleCount: articles.filter(article => 
      article.isPublished && article.tags?.some(tag => tag.name === name)
    ).length
  })).sort((a, b) => b.articleCount - a.articleCount).slice(0, 6) // 只取前6个热门标签
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 归档数据处理
const processArchiveData = (articles: Article[]) => {
  const archiveMap = new Map<string, { month: string; count: number }>()
  
  articles
    .filter(article => article.isPublished && article.publishedAt)
    .forEach(article => {
      const date = new Date(article.publishedAt)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const monthName = `${year}年${month}月`
      
      if (!archiveMap.has(monthName)) {
        archiveMap.set(monthName, { month: monthName, count: 0 })
      }
      
      archiveMap.get(monthName)!.count++
    })
  
  // 按时间倒序排列，只取前4个月
  return Array.from(archiveMap.values())
    .sort((a, b) => {
      const [yearA, monthA] = a.month.replace('年', '-').replace('月', '').split('-').map(Number)
      const [yearB, monthB] = b.month.replace('年', '-').replace('月', '').split('-').map(Number)
      if (yearA !== yearB) return yearB - yearA
      return monthB - monthA
    })
    .slice(0, 4)
}

export function BlogSidebar({ className }: BlogSidebarProps) {
  const [articles, setArticles] = React.useState<Article[]>([])
  const [archiveData, setArchiveData] = React.useState<{ month: string; count: number }[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [tags, setTags] = React.useState<TagType[]>([])

  // 加载文章数据
  React.useEffect(() => {
    const loadArticles = async () => {
      try {
        const posts = await loadAllPosts()
        setArticles(posts)
        setArchiveData(processArchiveData(posts))
        setCategories(processCategoriesData(posts))
        setTags(processTagsData(posts))
      } catch (error) {
        console.error('Error loading articles:', error)
        setArticles([])
        setArchiveData([])
        setCategories([])
        setTags([])
      }
    }

    loadArticles()
  }, [])

  return (
    <aside className={cn("space-y-6", className)}>
      {/* 用户IP信息 */}
      <UserIpInfo />
      
      {/* 最新文章 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            最新文章
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {articles.slice(0, 3).map((article, index) => (
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
              {index < Math.min(articles.length, 3) - 1 && (
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
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.slug}`}>
              <Button
                variant="ghost"
                className="w-full justify-between h-auto p-3 hover:bg-accent hover:text-accent-foreground"
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
            </Link>
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
            {tags.map((tag) => (
              <Link key={tag.id} to={`/tag/${tag.slug}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
                >
                  {tag.name}
                  <Badge variant="secondary" className="ml-1.5 text-xs">
                    {tag.articleCount}
                  </Badge>
                </Button>
              </Link>
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
          {archiveData.map((archive) => (
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