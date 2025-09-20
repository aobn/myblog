/**
 * 博客首页组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Folder, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  }, [slug, currentCategory, currentTag])

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
                {(currentCategory || currentTag ? regularArticles : regularArticles.slice(0, 6)).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="default"
                  />
                ))}
              </div>

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