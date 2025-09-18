/**
 * 归档页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Archive as ArchiveIcon, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { Article } from '@/types/blog'

// 归档数据类型
interface ArchiveMonth {
  year: number
  month: number
  monthName: string
  articles: Article[]
  count: number
}

// 模拟归档数据
const mockArchiveData: ArchiveMonth[] = [
  {
    year: 2025,
    month: 9,
    monthName: '2025年9月',
    count: 8,
    articles: [
      {
        id: '1',
        title: 'React 19 新特性深度解析',
        publishedAt: '2025-09-15T10:00:00Z',
        readTime: 12,
        viewCount: 1250,
      } as Article,
      {
        id: '2',
        title: 'TypeScript 5.0 实战指南',
        publishedAt: '2025-09-12T14:30:00Z',
        readTime: 15,
        viewCount: 980,
      } as Article,
      {
        id: '3',
        title: 'Tailwind CSS 最佳实践',
        publishedAt: '2025-09-10T09:15:00Z',
        readTime: 8,
        viewCount: 756,
      } as Article,
    ]
  },
  {
    year: 2025,
    month: 8,
    monthName: '2025年8月',
    count: 12,
    articles: [
      {
        id: '4',
        title: 'Vite 构建优化技巧',
        publishedAt: '2025-08-28T16:45:00Z',
        readTime: 10,
        viewCount: 623,
      } as Article,
      {
        id: '5',
        title: 'Vue 3 Composition API 深入理解',
        publishedAt: '2025-08-25T11:20:00Z',
        readTime: 14,
        viewCount: 892,
      } as Article,
    ]
  },
  {
    year: 2025,
    month: 7,
    monthName: '2025年7月',
    count: 15,
    articles: [
      {
        id: '6',
        title: 'JavaScript 性能优化实践',
        publishedAt: '2025-07-30T14:15:00Z',
        readTime: 11,
        viewCount: 1045,
      } as Article,
      {
        id: '7',
        title: 'CSS Grid 布局完全指南',
        publishedAt: '2025-07-28T09:30:00Z',
        readTime: 9,
        viewCount: 734,
      } as Article,
    ]
  },
  {
    year: 2025,
    month: 6,
    monthName: '2025年6月',
    count: 9,
    articles: [
      {
        id: '8',
        title: 'Node.js 微服务架构设计',
        publishedAt: '2025-06-25T13:45:00Z',
        readTime: 16,
        viewCount: 567,
      } as Article,
    ]
  }
]

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

export default function Archive() {
  const { month } = useParams()
  const [openMonths, setOpenMonths] = React.useState<Set<string>>(new Set(['2025年9月']))

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
    ? mockArchiveData.filter(archive => archive.monthName === month)
    : mockArchiveData

  // 统计总数
  const totalArticles = mockArchiveData.reduce((sum, archive) => sum + archive.count, 0)
  const totalMonths = mockArchiveData.length

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
                  {Math.round(totalArticles / totalMonths)}
                </div>
                <div className="text-sm text-muted-foreground">月均文章</div>
              </CardContent>
            </Card>
          </div>

          {/* 归档列表 */}
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
                                  <span>{article.readTime} 分钟阅读</span>
                                  <span>{article.viewCount} 次阅读</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                        
                        {/* 显示更多按钮 */}
                        {archive.articles.length < archive.count && (
                          <div className="text-center pt-2">
                            <Link to={`/archive/${archive.monthName}`}>
                              <Button variant="outline" size="sm">
                                查看更多 ({archive.count - archive.articles.length} 篇)
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

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