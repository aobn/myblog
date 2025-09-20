/**
 * 标签页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { Tag, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Tag as TagType, Article } from '@/types/blog'
import { cn } from '@/lib/utils'
import { loadAllPosts } from '@/lib/simple-post-loader'

// 处理标签数据 - 只基于 tags 字段
const processTagsData = (articles: Article[]): TagType[] => {
  const tagMap = new Map<string, { color: string; count: number }>()
  
  // 只统计 tags 字段
  articles
    .filter(article => article.isPublished && article.tags)
    .forEach(article => {
      const tags = Array.isArray(article.tags) ? article.tags : []
      tags.forEach(tag => {
        const tagName = tag.name
        if (tagName) {
          if (!tagMap.has(tagName)) {
            tagMap.set(tagName, {
              color: tag.color || '#6b7280',
              count: 0
            })
          }
          tagMap.get(tagName)!.count++
        }
      })
    })
  
  return Array.from(tagMap.entries()).map(([name, data]) => ({
    id: `tag-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    articleCount: data.count,
    color: data.color
  })).sort((a, b) => b.articleCount - a.articleCount)
}

// 根据文章数量获取标签大小
const getTagSize = (count: number) => {
  if (count >= 30) return 'text-2xl'
  if (count >= 20) return 'text-xl'
  if (count >= 10) return 'text-lg'
  if (count >= 5) return 'text-base'
  return 'text-sm'
}

// 根据文章数量获取标签颜色
const getTagColor = (count: number) => {
  if (count >= 30) return 'bg-primary text-primary-foreground'
  if (count >= 20) return 'bg-blue-500 text-white'
  if (count >= 10) return 'bg-green-500 text-white'
  if (count >= 5) return 'bg-yellow-500 text-white'
  return 'bg-gray-500 text-white'
}

export default function Tags() {
  const [viewMode, setViewMode] = React.useState<'cloud' | 'list'>('cloud')
  const [tags, setTags] = React.useState<TagType[]>([])
  const [totalArticles, setTotalArticles] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadTags = async () => {
      try {
        const articles = await loadAllPosts()
        const processedTags = processTagsData(articles)
        setTags(processedTags)
        // 设置真实的文章总数
        setTotalArticles(articles.filter(article => article.isPublished).length)
      } catch (error) {
        console.error('Error loading tags:', error)
        setTags([])
        setTotalArticles(0)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  if (loading) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">加载标签中...</div>
          </div>
        </main>
      </div>
    )
  }

  // 按文章数量排序
  const sortedTags = [...tags].sort((a, b) => b.articleCount - a.articleCount)

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">标签云</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            通过标签快速找到相关主题的文章
          </p>
        </div>

        {/* 视图切换 */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'cloud' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cloud')}
              className="rounded-r-none"
            >
              标签云
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              列表视图
            </Button>
          </div>
        </div>

        {/* 标签云视图 */}
        {viewMode === 'cloud' && (
          <div className="mb-12">
            <div className="flex flex-wrap items-center justify-center gap-4 min-h-64">
              {sortedTags.map((tag) => (
                <Link key={tag.id} to={`/tag/${tag.slug}`}>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md px-4 py-2",
                      getTagSize(tag.articleCount),
                      getTagColor(tag.articleCount)
                    )}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag.name}
                    <span className="ml-2 text-xs opacity-80">
                      {tag.articleCount}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {sortedTags.map((tag) => (
              <Link key={tag.id} to={`/tag/${tag.slug}`}>
                <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {tag.name}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {tag.articleCount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">标签总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center text-primary">
                {tags.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">文章总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center text-primary">
                {totalArticles}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">最热标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {sortedTags[0]?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {sortedTags[0]?.articleCount} 篇文章
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}