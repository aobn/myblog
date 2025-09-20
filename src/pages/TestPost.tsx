/**
 * 测试博客文章页面
 * 
 * @author CodeBuddy
 * @date 2025-09-20
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SimpleMarkdown from '@/components/blog/simple-markdown'
import { loadAllPosts } from '@/lib/simple-post-loader'
import type { Article } from '@/types/blog'

export function TestPost() {
  const [article, setArticle] = React.useState<Article | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadPost = async () => {
      try {
        const posts = await loadAllPosts()
        if (posts.length > 0) {
          setArticle(posts[0]) // 获取第一篇文章
        }
      } catch (error) {
        console.error('Error loading post:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPost()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
          <p className="text-muted-foreground mb-6">没有找到博客文章。</p>
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>

      {/* 文章标题 */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        <p className="text-lg text-muted-foreground mb-4">{article.excerpt}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>作者: {article.author.name}</span>
          <span>发布时间: {article.publishedAt}</span>
          <span>阅读时间: {article.readTime} 分钟</span>
        </div>
      </header>

      {/* 文章内容 */}
      <article className="max-w-none">
        <SimpleMarkdown content={article.content} />
      </article>
    </div>
  )
}