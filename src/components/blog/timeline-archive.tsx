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
          <div key={year} className="relative pl-0 md:pl-16">
            {/* 年份标题 - 全新设计 */}
            <div className="relative mb-6">
              {/* 桌面端：年份圆圈在左侧 */}
              <div className="hidden md:block absolute -left-16 top-0 z-10">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-xl border-4 border-background">
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
            <div className="relative ml-0 md:ml-2 pl-20 md:pl-24 border-l-2 border-dashed border-muted-foreground/30">
              {sortedMonths.map(monthKey => {
                const monthData = yearData.months[monthKey]
                const monthName = format(new Date(`${year}-${monthKey}-01`), 'MMMM')
                
                return (
                  <div key={`${year}-${monthKey}`} className="mb-8 relative">
                    {/* 月份标题 - 简化设计 */}
                    <div className="mb-3 -ml-20 md:-ml-24">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs md:text-sm font-medium shadow-lg border-2 border-background">
                          {monthKey}
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-foreground">
                          {monthName}
                        </h3>
                        <div className="hidden md:block flex-1 h-px bg-border ml-3"></div>
                        <Badge variant="secondary" className="text-xs">
                          {monthData.articles.length} 篇
                        </Badge>
                      </div>
                    </div>
                    
                    {/* 文章列表 - 优化设计 */}
                    <div className="space-y-0.5 md:space-y-1">
                      {monthData.articles.map(article => {
                        const publishDate = new Date(article.publishedAt)
                        const day = format(publishDate, 'dd')
                        
                        return (
                          <div key={article.id} className="relative group py-1">
                            {/* 左侧：月份.日期 */}
                            <div className="absolute -left-[80px] md:-left-[90px] top-1/2 -translate-y-1/2 text-right">
                              <div className="text-sm md:text-base font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                {monthKey}.{day}
                              </div>
                            </div>
                            
                            {/* 虚线连接点 */}
                            <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/20 border-2 border-primary/40 group-hover:bg-primary/40 group-hover:border-primary/60 transition-all duration-200"></div>
                            
                            {/* 右侧：文章标题和标签 */}
                            <div className="pl-4 pr-3">
                              <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-200">
                                <Link 
                                  to={`/article/${article.id}`}
                                  className="text-base font-medium hover:text-primary transition-colors flex-1 mr-4"
                                >
                                  {article.title}
                                </Link>
                                {article.tags && article.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {article.tags.map(tag => (
                                      <Badge 
                                        key={tag.id} 
                                        variant="secondary" 
                                        className="text-xs px-2 py-0.5"
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
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