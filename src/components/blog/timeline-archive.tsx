/**
 * 时间线风格的文章归档组件
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/blog'

interface TimelineArchiveProps {
  articles: Article[]
  className?: string
}

interface GroupedArticles {
  [key: string]: {
    year: string
    months: {
      [key: string]: {
        month: string
        articles: Article[]
      }
    }
  }
}

export function TimelineArchive({ articles, className }: TimelineArchiveProps) {
  // 按年份和月份分组文章
  const groupedArticles = React.useMemo(() => {
    const grouped: GroupedArticles = {}
    
    articles.forEach(article => {
      const date = new Date(article.publishedAt)
      const year = date.getFullYear().toString()
      const month = format(date, 'MM')
      
      // 初始化年份对象
      if (!grouped[year]) {
        grouped[year] = {
          year,
          months: {}
        }
      }
      
      // 初始化月份对象
      if (!grouped[year].months[month]) {
        grouped[year].months[month] = {
          month,
          articles: []
        }
      }
      
      // 添加文章到对应月份
      grouped[year].months[month].articles.push(article)
    })
    
    return grouped
  }, [articles])
  
  // 获取排序后的年份（降序）
  const sortedYears = React.useMemo(() => {
    return Object.keys(groupedArticles).sort((a, b) => parseInt(b) - parseInt(a))
  }, [groupedArticles])

  return (
    <div className={cn("space-y-8", className)}>
      {sortedYears.map(year => {
        const yearData = groupedArticles[year]
        // 获取排序后的月份（降序）
        const sortedMonths = Object.keys(yearData.months).sort((a, b) => parseInt(b) - parseInt(a))
        
        return (
          <div key={year} className="relative">
            {/* 年份标题 - 桌面端在左侧，移动端在右侧 */}
            <div className="relative">
              {/* 桌面端年份圆圈 - 左侧 */}
              <div className="absolute -left-[60px] top-0 z-10 hidden md:block">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {year}
                </div>
              </div>
              
              {/* 移动端年份圆圈 - 右侧 */}
              <div className="absolute -right-[30px] top-0 z-10 md:hidden">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base">
                  {year}
                </div>
              </div>
              
              <div className="sticky top-0 z-10 py-2">
                <div className="flex items-center">
                  <div className="w-6 h-[2px] bg-primary"></div>
                  <Badge variant="outline" className="ml-2 text-sm">
                    {Object.values(yearData.months).reduce((acc, month) => acc + month.articles.length, 0)} 篇文章
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* 时间线 */}
            <div className="relative ml-6 pl-8 border-l-2 border-dashed border-muted-foreground/30">
              {sortedMonths.map(monthKey => {
                const monthData = yearData.months[monthKey]
                const monthName = format(new Date(`${year}-${monthKey}-01`), 'MMMM')
                
                return (
                  <div key={`${year}-${monthKey}`} className="mb-8 relative">
                    {/* 月份标记点 - 响应式调整 */}
                    <div className="absolute -left-[41px] w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {monthKey}
                    </div>
                    
                    {/* 月份标题 */}
                    <h3 className="text-xl font-semibold mb-4 text-foreground">
                      {monthName}
                    </h3>
                    
                    {/* 文章列表 - 简化版 */}
                    <div className="space-y-3">
                      {monthData.articles.map(article => {
                        const publishDate = new Date(article.publishedAt)
                        const day = format(publishDate, 'dd')
                        
                        return (
                          <div key={article.id} className="relative group">
                            {/* 日期标记点 - 响应式调整 */}
                            <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground">
                              {day}
                            </div>
                            
                            {/* 简化的文章展示 - 只显示标题 */}
                            <div className="py-2 pl-1 hover:bg-accent/20 rounded-md transition-colors">
                              <Link 
                                to={`/article/${article.id}`}
                                className="text-sm font-medium hover:text-primary transition-colors block"
                              >
                                {article.title}
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      
      {/* 如果没有文章 */}
      {sortedYears.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
          <p className="text-muted-foreground">
            还没有发布任何文章，请稍后再来查看
          </p>
        </div>
      )}
    </div>
  )
}