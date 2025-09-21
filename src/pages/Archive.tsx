/**
 * 归档页面组件
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Archive as ArchiveIcon, ChevronDown, ChevronRight, List, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { TimelineArchive } from '@/components/blog/timeline-archive'
import type { Article } from '@/types/blog'
import { loadAllPosts } from '@/lib/simple-post-loader'

// 归档数据类型
interface ArchiveMonth {
  year: number
  month: number
  monthName: string
  articles: Article[]
  count: number
}

// 视图类型
type ViewType = 'list' | 'timeline'

// 处理归档数据
const processArchiveData = (articles: Article[]): ArchiveMonth[] => {
  const archiveMap = new Map<string, ArchiveMonth>()
  
  articles
    .filter(article => article.isPublished && article.publishedAt)
    .forEach(article => {
      const date = new Date(article.publishedAt)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const key = `${year}-${month}`
      const monthName = `${year}年${month}月`
      
      if (!archiveMap.has(key)) {
        archiveMap.set(key, {
          year,
          month,
          monthName,
          articles: [],
          count: 0
        })
      }
      
      const archiveItem = archiveMap.get(key)!
      archiveItem.articles.push(article)
      archiveItem.count++
    })
  
  // 按时间倒序排列
  return Array.from(archiveMap.values())
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

export default function Archive() {
  const { month } = useParams()
  const [articles, setArticles] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)
  const [openMonths, setOpenMonths] = React.useState<Set<string>>(new Set())
  const [viewType, setViewType] = React.useState<ViewType>('timeline')

  // 加载文章数据
  React.useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true)
        const posts = await loadAllPosts()
        setArticles(posts)
      } catch (error) {
        console.error('Error loading articles:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  // 处理归档数据
  const archiveData = React.useMemo(() => processArchiveData(articles), [articles])
  
  // 默认展开最新月份
  React.useEffect(() => {
    if (archiveData.length > 0 && openMonths.size === 0) {
      setOpenMonths(new Set([archiveData[0].monthName]))
    }
  }, [archiveData, openMonths.size])

  // 切换月份展开状态
  const toggleMonth = (monthName: string) => {
    const newOpenMonths = new Set(openMonths)
    if (newOpenMonths.has(monthName)) {
      newOpenMonths.delete(monthName)
    } else {
      newOpenMonths.add(monthName)
    }
    setOpenMonths(newOpenMonths)
  }

  // 如果指定了月份，只显示该月份的文章
  const filteredData = month 
    ? archiveData.filter(archive => archive.monthName === month)
    : archiveData

  // 统计总数
  const totalArticles = archiveData.reduce((sum, archive) => sum + archive.count, 0)
  const totalMonths = archiveData.length

  // 切换视图类型
  const handleViewChange = (value: string) => {
    if (value) {
      setViewType(value as ViewType)
    }
  }

  if (loading) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">加载归档数据中...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <ArchiveIcon className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">
                {month ? `${month} 归档` : '文章归档'}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {month 
                ? `查看 ${month} 发布的所有文章`
                : '按时间浏览所有文章，回顾技术成长历程'
              }
            </p>
          </div>

          {/* 统计信息 */}
          {totalArticles > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">{totalArticles}</div>
                  <div className="text-sm text-muted-foreground">篇文章</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">{totalMonths}</div>
                  <div className="text-sm text-muted-foreground">个月份</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {totalMonths > 0 ? Math.round(totalArticles / totalMonths) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">月均文章</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 视图切换 */}
          <div className="flex justify-center">
            <ToggleGroup type="single" value={viewType} onValueChange={handleViewChange}>
              <ToggleGroupItem 
                value="timeline" 
                aria-label="时间线视图"
                className="hover:scale-110 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none active:scale-125 active:bg-transparent data-[state=on]:bg-transparent data-[state=on]:text-current transition-transform duration-200 active:duration-100"
              >
                <Clock className="h-4 w-4 mr-2" />
                时间线视图
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="list" 
                aria-label="列表视图"
                className="hover:scale-110 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none active:scale-125 active:bg-transparent data-[state=on]:bg-transparent data-[state=on]:text-current transition-transform duration-200 active:duration-100"
              >
                <List className="h-4 w-4 mr-2" />
                列表视图
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* 列表视图 */}
          {viewType === 'list' && (
            <div className="space-y-4">
              {filteredData.map((archive) => (
                <Card key={archive.monthName}>
                  <Collapsible
                    open={openMonths.has(archive.monthName)}
                    onOpenChange={() => toggleMonth(archive.monthName)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">{archive.monthName}</CardTitle>
                            <Badge variant="secondary">{archive.count} 篇</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {!month && (
                              <Link to={`/archive/${archive.monthName}`}>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  查看全部
                                </Button>
                              </Link>
                            )}
                            {openMonths.has(archive.monthName) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {archive.articles.map((article) => (
                            <Link
                              key={article.id}
                              to={`/article/${article.id}`}
                              className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors group"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                    {article.title}
                                  </h3>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span>{formatDate(article.publishedAt)}</span>
                                    {article.readTime && <span>{article.readTime} 分钟阅读</span>}
                                    {article.viewCount && <span>{article.viewCount} 次阅读</span>}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}

          {/* 时间线视图 */}
          {viewType === 'timeline' && (
            <div className="mt-8">
              <TimelineArchive articles={articles} />
            </div>
          )}

          {/* 返回按钮 */}
          {month && (
            <div className="text-center">
              <Link to="/archive">
                <Button variant="outline">
                  返回完整归档
                </Button>
              </Link>
            </div>
          )}

          {/* 空状态 */}
          {filteredData.length === 0 && (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <ArchiveIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无归档内容</h3>
                <p className="text-muted-foreground mb-4">
                  {month ? `${month} 还没有发布文章` : '还没有发布任何文章'}
                </p>
                <Link to="/">
                  <Button variant="outline">返回首页</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}