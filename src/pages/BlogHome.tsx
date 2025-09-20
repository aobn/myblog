/**
 * 博客首页组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { ArticleCard } from '@/components/blog/article-card'
import { useBlogStore } from '@/store/blog-store'
import { loadAllPosts } from '@/lib/simple-post-loader'
import type { Article } from '@/types/blog'



export function BlogHome() {
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

  // 排序文章（首页只按最新时间排序）
  const sortedArticles = React.useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }, [articles])

  // 精选文章（取前2篇，始终按最新排序）
  const featuredArticles = React.useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 2)
  }, [articles])

  // 普通文章列表（使用排序后的文章，跳过精选文章）
  const regularArticles = React.useMemo(() => {
    const featuredIds = new Set(featuredArticles.map(article => article.id))
    return sortedArticles.filter(article => !featuredIds.has(article.id))
  }, [sortedArticles, featuredArticles])

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
            {/* 欢迎区域 */}
            <section className="text-center py-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <h1 className="text-4xl font-bold mb-4">欢迎来到我的博客</h1>
              <p className="text-xl text-muted-foreground mb-6">
                分享技术见解，记录成长历程，探索编程世界的无限可能
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/articles">
                  <Button size="lg">
                    浏览所有文章
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    了解更多
                  </Button>
                </Link>
              </div>
            </section>

            {/* 精选文章区域 */}
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

            {/* 最新文章预览区域 */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">最新文章</h2>
                <Link to="/articles">
                  <Button variant="outline">
                    查看全部文章
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {/* 最新文章列表（只显示前6篇） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regularArticles.slice(0, 6).map((article) => (
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
                  <h3 className="text-xl font-semibold mb-2">暂无文章</h3>
                  <p className="text-muted-foreground">
                    还没有发布任何文章，请稍后再来查看
                  </p>
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