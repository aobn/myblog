/**
 * 文章列表页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-20
 */

import * as React from 'react'
import { ChevronLeft, ChevronRight, Filter, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { ArticleCard } from '@/components/blog/article-card'
import { useBlogStore } from '@/store/blog-store'
import { loadAllPosts } from '@/lib/simple-post-loader'
import type { Article } from '@/types/blog'

export function ArticleList() {
  const { 
    currentPage, 
    totalPages, 
    pageSize,
    selectedCategory, 
    selectedTag,
    setCurrentPage,
    setTotalPages,
    setPageSize,
    resetFilters 
  } = useBlogStore()

  const [sortBy, setSortBy] = React.useState<'latest' | 'popular' | 'trending'>('latest')
  const [articles, setArticles] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)

  // 加载文章数据
  React.useEffect(() => {
    const loadArticles = async () => {
      try {
        const posts = await loadAllPosts()
        setArticles(posts)
      } catch (error) {
        console.error('Error loading posts:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    
    loadArticles()
  }, [])

  // 排序文章
  const sortedArticles = React.useMemo(() => {
    const sorted = [...articles]
    
    switch (sortBy) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      case 'popular':
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      case 'trending':
        return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
      default:
        return sorted
    }
  }, [articles, sortBy])
  
  // 计算分页数据
  const paginatedArticles = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedArticles.slice(startIndex, endIndex)
  }, [sortedArticles, currentPage, pageSize])
  
  // 更新总页数
  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(sortedArticles.length / pageSize))
    setTotalPages(totalPages)
    
    // 如果当前页超出了总页数，则重置为第一页
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [sortedArticles.length, pageSize, setTotalPages, currentPage, setCurrentPage])

  if (loading) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载文章中...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // 处理每页显示数量变更
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
  }

  // 清除筛选条件
  const handleClearFilters = () => {
    resetFilters()
  }

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区域 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 页面标题 */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">所有文章</h1>
              <p className="text-lg text-muted-foreground">
                浏览所有已发布的文章，发现更多精彩内容
              </p>
            </div>

            {/* 文章列表区域 */}
            <section>
              {/* 筛选和排序控制 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">
                      {sortBy === 'latest' && '按时间排序'}
                      {sortBy === 'popular' && '按热度排序'}
                      {sortBy === 'trending' && '按趋势排序'}
                    </h2>
                    <Badge variant="secondary" className="text-sm">
                      {sortedArticles.length} 篇
                    </Badge>
                  </div>
                  {(selectedCategory || selectedTag) && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Filter className="h-3 w-3 mr-1" />
                        {selectedCategory ? '分类筛选' : '标签筛选'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-xs"
                      >
                        清除筛选
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* 排序选择 */}
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">最新发布</SelectItem>
                      <SelectItem value="popular">最受欢迎</SelectItem>
                      <SelectItem value="trending">热门趋势</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* 每页显示数量 */}
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">每页 20 篇</SelectItem>
                      <SelectItem value="50">每页 50 篇</SelectItem>
                      <SelectItem value="100">每页 100 篇</SelectItem>
                    </SelectContent>
                  </Select>


                </div>
              </div>

              {/* 文章列表 */}
              <div className="flex flex-col space-y-4">
                {paginatedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="compact"
                  />
                ))}
              </div>

              {/* 空状态 */}
              {sortedArticles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
                  <p className="text-muted-foreground">
                    还没有发布任何文章，请稍后再来查看
                  </p>
                </div>
              )}

              {/* 分页控制 */}
              {sortedArticles.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="text-sm text-muted-foreground">
                    显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedArticles.length)} 篇，共 {sortedArticles.length} 篇文章
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {/* 显示前几页 */}
                      {totalPages <= 7 ? (
                        // 如果总页数小于等于7，显示所有页码
                        Array.from({ length: totalPages }, (_, i) => {
                          const page = i + 1
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          )
                        })
                      ) : (
                        // 如果总页数大于7，显示部分页码
                        <>
                          {/* 始终显示第一页 */}
                          <Button
                            variant={currentPage === 1 ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className="w-10"
                          >
                            1
                          </Button>
                          
                          {/* 如果当前页大于3，显示省略号 */}
                          {currentPage > 3 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10"
                              disabled
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* 显示当前页附近的页码 */}
                          {Array.from({ length: 3 }, (_, i) => {
                            let page
                            if (currentPage <= 3) {
                              // 如果当前页小于等于3，显示2-4页
                              page = i + 2
                            } else if (currentPage >= totalPages - 2) {
                              // 如果当前页接近末尾，显示倒数第4-2页
                              page = totalPages - 4 + i
                            } else {
                              // 否则显示当前页的前一页、当前页和后一页
                              page = currentPage - 1 + i
                            }
                            
                            // 确保页码在有效范围内
                            if (page > 1 && page < totalPages) {
                              return (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="w-10"
                                >
                                  {page}
                                </Button>
                              )
                            }
                            return null
                          })}
                          
                          {/* 如果当前页小于总页数-2，显示省略号 */}
                          {currentPage < totalPages - 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-10"
                              disabled
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* 始终显示最后一页 */}
                          <Button
                            variant={currentPage === totalPages ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            className="w-10"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </main>
    </div>
  )
}