/**
 * 搜索页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlogHeader } from '@/components/blog/blog-header'
import { ArticleCard } from '@/components/blog/article-card'
import { useBlogStore } from '@/store/blog-store'
import type { Article } from '@/types/blog'

// 模拟搜索结果
const mockSearchResults: Article[] = [
  {
    id: '1',
    title: 'React 19 新特性深度解析',
    excerpt: '深入探讨 React 19 带来的并发渲染机制、Suspense 边界优化',
    publishedAt: '2025-09-15T10:00:00Z',
    readTime: 12,
    viewCount: 1250,
    likeCount: 89,
  } as Article,
  {
    id: '2',
    title: 'TypeScript 5.0 实战指南',
    excerpt: '全面解析 TypeScript 5.0 的新特性，包括装饰器、const 断言',
    publishedAt: '2025-09-12T14:30:00Z',
    readTime: 15,
    viewCount: 980,
    likeCount: 67,
  } as Article,
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchQuery, setSearchQuery } = useBlogStore()
  const [sortBy, setSortBy] = React.useState<'relevance' | 'date' | 'popularity'>('relevance')
  const [filterBy, setFilterBy] = React.useState<'all' | 'articles' | 'categories' | 'tags'>('all')
  
  const query = searchParams.get('q') || ''
  
  React.useEffect(() => {
    if (query) {
      setSearchQuery(query)
    }
  }, [query, setSearchQuery])

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() })
    }
  }

  // 清除搜索
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchParams({})
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader siteName="技术博客" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 搜索标题 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <SearchIcon className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">搜索文章</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              在这里搜索你感兴趣的技术内容
            </p>
          </div>

          {/* 搜索表单 */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="search"
                    placeholder="输入关键词搜索文章..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">
                    <SearchIcon className="h-4 w-4 mr-2" />
                    搜索
                  </Button>
                </div>

                {/* 筛选选项 */}
                <div className="flex flex-wrap gap-4">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">相关性</SelectItem>
                      <SelectItem value="date">发布时间</SelectItem>
                      <SelectItem value="popularity">热门程度</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="articles">文章</SelectItem>
                      <SelectItem value="categories">分类</SelectItem>
                      <SelectItem value="tags">标签</SelectItem>
                    </SelectContent>
                  </Select>

                  {query && (
                    <Button variant="outline" onClick={handleClearSearch}>
                      清除搜索
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 搜索结果 */}
          {query ? (
            <div className="space-y-6">
              {/* 结果统计 */}
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">
                  搜索 "<span className="font-medium text-foreground">{query}</span>" 
                  找到 <span className="font-medium text-foreground">{mockSearchResults.length}</span> 个结果
                </div>
              </div>

              {/* 搜索结果列表 */}
              <div className="space-y-4">
                {mockSearchResults.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="compact"
                  />
                ))}
              </div>

              {/* 无结果提示 */}
              {mockSearchResults.length === 0 && (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">未找到相关内容</h3>
                    <p className="text-muted-foreground mb-4">
                      尝试使用不同的关键词或浏览我们的分类和标签
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => window.location.href = '/categories'}>
                        浏览分类
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/tags'}>
                        浏览标签
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* 搜索建议 */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>热门搜索</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'JavaScript', 'CSS', 'Vue.js', '性能优化', 'Webpack', 'Node.js'].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(term)
                          setSearchParams({ q: term })
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>搜索技巧</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">基础搜索</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 输入关键词直接搜索</li>
                        <li>• 支持中英文搜索</li>
                        <li>• 自动匹配相关内容</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">高级搜索</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• 使用引号精确匹配</li>
                        <li>• 多个关键词用空格分隔</li>
                        <li>• 支持按分类和标签筛选</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}