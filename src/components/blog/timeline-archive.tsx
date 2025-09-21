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
            {/* 年份标题 - 全新设计 */}
            <div className="relative mb-6">
              {/* 桌面端：年份圆圈在左侧 */}
              <div className="hidden md:block absolute -left-[60px] top-0 z-10">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                  {year}
                </div>
              </div>
              
              {/* 移动端：年份横条设计 */}
              <div className="md:hidden mb-4">
                <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {year}
                    </div>
                    <h2 className="text-lg font-bold text-primary">{year} 年</h2>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Object.values(yearData.months).reduce((acc, month) => acc + month.articles.length, 0)} 篇
                  </Badge>
                </div>
              </div>
              
              {/* 桌面端：年份信息条 */}
              <div className="hidden md:block sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2">
                <div className="flex items-center">
                  <div className="w-6 h-[2px] bg-primary"></div>
                  <Badge variant="outline" className="ml-2 text-sm">
                    {Object.values(yearData.months).reduce((acc, month) => acc + month.articles.length, 0)} 篇文章
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* 时间线 - 优化布局 */}
            <div className="relative ml-0 md:ml-6 pl-6 md:pl-8 border-l-2 border-dashed border-muted-foreground/30">
              {sortedMonths.map(monthKey => {
                const monthData = yearData.months[monthKey]
                const monthName = format(new Date(`${year}-${monthKey}-01`), 'MMMM')
                
                return (
                  <div key={`${year}-${monthKey}`} className="mb-8 relative">
                    {/* 月份标记点 - 优化设计 */}
                    <div className="absolute -left-[31px] md:-left-[41px] w-8 h-8 md:w-8 md:h-8 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground text-xs md:text-sm font-medium shadow-md border-2 border-background">
                      {monthKey}
                    </div>
                    
                    {/* 月份标题 - 优化样式 */}
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        {monthName}
                      </h3>
                      <div className="hidden md:block flex-1 h-px bg-border"></div>
                      <Badge variant="secondary" className="text-xs md:hidden">
                        {monthData.articles.length} 篇
                      </Badge>
                    </div>
                    
                    {/* 文章列表 - 优化设计 */}
                    <div className="space-y-1 md:space-y-2">
                      {monthData.articles.map(article => {
                        const publishDate = new Date(article.publishedAt)
                        const day = format(publishDate, 'dd')
                        
                        return (
                          <div key={article.id} className="relative group">
                            {/* 日期标记点 - 精致设计 */}
                            <div className="absolute -left-[27px] md:-left-[33px] top-1/2 -translate-y-1/2 w-6 h-6 md:w-6 md:h-6 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center text-xs text-muted-foreground font-medium shadow-sm group-hover:border-primary/60 group-hover:bg-primary/5 transition-all duration-200">
                              {day}
                            </div>
                            
                            {/* 文章展示 - 卡片化设计 */}
                            <div className="py-2 md:py-2.5 pl-2 pr-3 hover:bg-accent/30 rounded-lg transition-all duration-200 group-hover:shadow-sm border border-transparent hover:border-border/50">
                              <Link 
                                to={`/article/${article.id}`}
                                className="text-sm md:text-base font-medium hover:text-primary transition-colors block leading-relaxed group-hover:translate-x-1 transition-transform duration-200"
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