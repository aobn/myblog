/**
 * 博客首页组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Folder, Tag, ChevronLeft, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { ArticleCard } from '@/components/blog/article-card'
import { loadAllPosts } from '@/lib/simple-post-loader'
import type { Article } from '@/types/blog'



export function BlogHome() {
  const { slug } = useParams<{ slug: string }>()
  const [articles, setArticles] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)
  const [currentCategory, setCurrentCategory] = React.useState<string | null>(null)
  const [currentTag, setCurrentTag] = React.useState<string | null>(null)
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [totalPages, setTotalPages] = React.useState(1)
  
  // 判断当前是分类页面还是标签页面
  const isTagPage = window.location.pathname.startsWith('/tag/')
  const isCategoryPage = window.location.pathname.startsWith('/category/')

  // 加载文章数据
  React.useEffect(() => {
    const loadArticles = async () => {
      try {
        const posts = await loadAllPosts()
        setArticles(posts)
        
        if (slug) {
          if (isCategoryPage) {
            // 处理分类页面
            const categoryArticle = posts.find(post => 
              post.category?.name.toLowerCase().replace(/\s+/g, '-') === slug
            )
            if (categoryArticle) {
              setCurrentCategory(categoryArticle.category.name)
              setCurrentTag(null)
            }
          } else if (isTagPage) {
            // 处理标签页面
            const tagArticle = posts.find(post => 
              post.tags?.some(tag => tag.name.toLowerCase().replace(/\s+/g, '-') === slug)
            )
            if (tagArticle) {
              const tag = tagArticle.tags?.find(tag => 
                tag.name.toLowerCase().replace(/\s+/g, '-') === slug
              )
              if (tag) {
                setCurrentTag(tag.name)
                setCurrentCategory(null)
              }
            }
          }
        } else {
          setCurrentCategory(null)
          setCurrentTag(null)
        }
      } catch (error) {
        console.error('Error loading posts:', error)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }
    
    loadArticles()
  }, [slug, isCategoryPage, isTagPage])

  // 页面切换时滚动到顶部
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug, currentCategory, currentTag, currentPage])

  // 过滤文章（根据分类或标签）
  const filteredArticles = React.useMemo(() => {
    if (currentCategory) {
      return articles.filter(article => 
        article.category?.name === currentCategory
      )
    }
    if (currentTag) {
      return articles.filter(article => 
        article.tags?.some(tag => tag.name === currentTag)
      )
    }
    return articles
  }, [articles, currentCategory, currentTag])

  // 排序文章（按最新时间排序）
  const sortedArticles = React.useMemo(() => {
    return [...filteredArticles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }, [filteredArticles])

  // 精选文章（如果是分类或标签页面，不显示精选文章）
  const featuredArticles = React.useMemo(() => {
    if (currentCategory || currentTag) return []
    return [...articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 2)
  }, [articles, currentCategory, currentTag])

  // 普通文章列表
  const regularArticles = React.useMemo(() => {
    if (currentCategory || currentTag) {
      return sortedArticles
    }
    const featuredIds = new Set(featuredArticles.map(article => article.id))
    return sortedArticles.filter(article => !featuredIds.has(article.id))
  }, [sortedArticles, featuredArticles, currentCategory, currentTag])
  
  // 计算分页数据
  const paginatedArticles = React.useMemo(() => {
    // 只有在标签或分类页面才应用分页
    if (currentCategory || currentTag) {
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      return regularArticles.slice(startIndex, endIndex)
    }
    // 首页不应用分页，保持原有逻辑
    return regularArticles
  }, [regularArticles, currentPage, pageSize, currentCategory, currentTag])
  
  // 更新总页数
  React.useEffect(() => {
    if (currentCategory || currentTag) {
      const totalPages = Math.max(1, Math.ceil(regularArticles.length / pageSize))
      setTotalPages(totalPages)
      
      // 如果当前页超出了总页数，则重置为第一页
      if (currentPage > totalPages) {
        setCurrentPage(1)
      }
    }
  }, [regularArticles.length, pageSize, currentPage, currentCategory, currentTag])
  
  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // 处理每页显示数量变更
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1) // 重置到第一页
  }

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



  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区域 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 分类/标签页面标题 */}
            {(currentCategory || currentTag) && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  {currentCategory ? (
                    <Folder className="h-6 w-6 text-primary" />
                  ) : (
                    <Tag className="h-6 w-6 text-primary" />
                  )}
                  <h1 className="text-3xl font-bold">
                    {currentCategory || currentTag}
                  </h1>
                  <Badge variant="secondary">
                    {filteredArticles.length} 篇文章
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <Link to="/" className="hover:text-primary transition-colors">
                    首页
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                  {currentCategory ? (
                    <>
                      <Link to="/categories" className="hover:text-primary transition-colors">
                        分类
                      </Link>
                      <ChevronRight className="h-4 w-4" />
                      <span>{currentCategory}</span>
                    </>
                  ) : (
                    <>
                      <Link to="/tags" className="hover:text-primary transition-colors">
                        标签
                      </Link>
                      <ChevronRight className="h-4 w-4" />
                      <span>{currentTag}</span>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* 精选文章区域（仅首页显示） */}
            {!currentCategory && !currentTag && featuredArticles.length > 0 && (
              <>
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold">精选文章</h2>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {featuredArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        variant="featured"
                      />
                    ))}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* 文章列表区域 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {currentCategory ? `${currentCategory} 文章` : 
                   currentTag ? `${currentTag} 标签文章` : '最新文章'}
                </h2>
                {!currentCategory && !currentTag && (
                  <Link to="/articles">
                    <Button variant="outline">
                      查看全部文章
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* 文章列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(currentCategory || currentTag ? paginatedArticles : regularArticles.slice(0, 6)).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="default"
                  />
                ))}
              </div>
              
              {/* 分页控制 - 仅在标签或分类页面显示 */}
              {(currentCategory || currentTag) && regularArticles.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                  <div className="text-sm text-muted-foreground">
                    显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, regularArticles.length)} 篇，共 {regularArticles.length} 篇文章
                  </div>
                  
                  <div className="flex items-center gap-3">
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
                        {/* 显示页码 */}
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
                </div>
              )}

              {/* 如果没有文章 */}
              {regularArticles.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentCategory ? `${currentCategory} 分类下暂无文章` : 
                     currentTag ? `${currentTag} 标签下暂无文章` : '暂无文章'}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentCategory 
                      ? `${currentCategory} 分类下还没有发布任何文章`
                      : currentTag
                      ? `${currentTag} 标签下还没有发布任何文章`
                      : '还没有发布任何文章，请稍后再来查看'
                    }
                  </p>
                  {(currentCategory || currentTag) && (
                    <Link to="/" className="mt-4 inline-block">
                      <Button variant="outline">
                        返回首页
                      </Button>
                    </Link>
                  )}
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