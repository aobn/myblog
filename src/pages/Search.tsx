/**
 * 搜索页面组件
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search as SearchIcon, Clock, TrendingUp, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useBlogStore } from '@/store/blog-store'
import { searchArticles, type SearchResult, type SearchResultArticle } from '@/lib/search-service'
import { highlightText } from '@/lib/highlight-utils'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchQuery, setSearchQuery } = useBlogStore()
  const [sortBy, setSortBy] = React.useState<'relevance' | 'date' | 'popularity'>('relevance')
  const [filterBy, setFilterBy] = React.useState<'all' | 'title' | 'content' | 'tags' | 'category'>('all')
  const [searchResult, setSearchResult] = React.useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  
  const query = searchParams.get('q') || ''
  
  React.useEffect(() => {
    if (query) {
      setSearchQuery(query)
    }
  }, [query, setSearchQuery])

  // 执行搜索
  const performSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResult(null)
      return
    }

    setIsLoading(true)
    try {
      const result = await searchArticles({
        query: searchQuery,
        sortBy,
        filterBy,
        limit: 20
      })
      setSearchResult(result)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResult(null)
    } finally {
      setIsLoading(false)
    }
  }, [sortBy, filterBy])

  // 当查询参数或排序/筛选条件变化时执行搜索
  React.useEffect(() => {
    if (query) {
      performSearch(query)
    }
  }, [query, performSearch])

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
    setSearchResult(null)
  }

  // 处理排序变化
  const handleSortChange = (value: string) => {
    setSortBy(value as 'relevance' | 'date' | 'popularity')
  }

  // 处理筛选变化
  const handleFilterChange = (value: string) => {
    setFilterBy(value as 'all' | 'title' | 'content' | 'tags' | 'category')
  }

  return (
    <div>
      
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
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">
                        <div className="flex items-center">
                          <SearchIcon className="h-4 w-4 mr-2" />
                          相关性
                        </div>
                      </SelectItem>
                      <SelectItem value="date">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          发布时间
                        </div>
                      </SelectItem>
                      <SelectItem value="popularity">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          热门程度
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterBy} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="title">标题</SelectItem>
                      <SelectItem value="content">内容</SelectItem>
                      <SelectItem value="tags">标签</SelectItem>
                      <SelectItem value="category">分类</SelectItem>
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
              {/* 加载状态 */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">搜索中...</p>
                </div>
              )}

              {/* 结果统计 */}
              {!isLoading && searchResult && (
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">
                    搜索 "<span className="font-medium text-foreground">{query}</span>" 
                    找到 <span className="font-medium text-foreground">{searchResult.total}</span> 个结果
                    <Badge variant="outline" className="ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {searchResult.searchTime}ms
                    </Badge>
                  </div>
                </div>
              )}

              {/* 搜索结果列表 */}
              {!isLoading && searchResult && searchResult.articles.length > 0 && (
                <div className="space-y-4">
                  {searchResult.articles.map((article: SearchResultArticle) => (
                    <Card 
                      key={article.id} 
                      className="p-0 cursor-pointer relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
                      onClick={(e) => {
                        // 检查点击的是否是内容片段
                        const target = e.target as HTMLElement
                        const isSnippetClick = target.closest('.snippet-clickable')
                        
                        if (!isSnippetClick) {
                          // 如果不是点击内容片段，则跳转到文章页面
                          window.location.href = `/article/${article.id}`
                        }
                      }}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="secondary" 
                              style={{ 
                                backgroundColor: `${article.category.color}20`, 
                                color: article.category.color 
                              }}
                            >
                              {article.category.name}
                            </Badge>
                            {article.tags
                              .filter((tag) => {
                                const keywords = query.toLowerCase().split(' ').filter(k => k.trim())
                                return keywords.some(keyword => 
                                  tag.name.toLowerCase().includes(keyword)
                                )
                              })
                              .slice(0, 3)
                              .map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-xs">
                                  {highlightText(tag.name, query)}
                                </Badge>
                              ))}
                            {article.relevanceScore && (
                              <Badge variant="outline" className="text-xs">
                                匹配度: {Math.round(article.relevanceScore)}
                              </Badge>
                            )}
                          </div>
                          <a 
                            className="group" 
                            href={`/article/${article.id}`}
                            onClick={(e) => {
                              e.preventDefault()
                              window.location.href = `/article/${article.id}`
                            }}
                          >
                            <h3 className="font-semibold group-hover:text-primary transition-colors text-base">
                              {highlightText(article.title, query)}
                            </h3>
                          </a>
                          
                          {/* 文章摘要 */}
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {highlightText(article.excerpt, query)}
                          </p>
                          
                          {/* 上下文片段 */}
                          {article.contextSnippets && article.contextSnippets.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-muted-foreground">相关内容片段:</div>
                              {article.contextSnippets.map((snippet, index) => (
                                <div 
                                  key={index} 
                                  className="snippet-clickable bg-muted/50 rounded-md p-3 text-sm cursor-pointer hover:bg-muted/70 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-primary/20 relative group"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    
                                    console.log('片段被点击了!')
                                    
                                    // 生成内容锚点并跳转
                                    // 清理片段文本，移除省略号和多余空格
                                    const cleanSnippet = snippet
                                      .replace(/\.\.\./g, '')
                                      .replace(/\s+/g, ' ')
                                      .trim()
                                    
                                    // 取前50个字符作为锚点
                                    const anchorText = encodeURIComponent(cleanSnippet.substring(0, 50))
                                    
                                    console.log('跳转到文章:', article.id, '锚点:', cleanSnippet.substring(0, 50))
                                    
                                    // 直接跳转到带锚点的文章页面
                                    window.location.href = `/article/${article.id}?highlight=${encodeURIComponent(query)}&anchor=${anchorText}`
                                  }}
                                  title="点击跳转到文章中的对应位置"
                                >
                                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                    {highlightText(snippet, query)}
                                  </span>
                                  {/* 点击提示图标 */}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime} 分钟阅读</span>
                            </div>
                          </div>
                        </div>
                        {article.coverImage && (
                          <div className="relative w-full sm:w-32 md:w-40 h-32 sm:h-24 md:h-full flex-shrink-0">
                            <img 
                              alt={article.title}
                              className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                              src={article.coverImage}
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 无结果提示 */}
              {!isLoading && searchResult && searchResult.articles.length === 0 && (
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