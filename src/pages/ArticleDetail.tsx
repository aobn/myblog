/**
 * 文章详情页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Bookmark, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import 'highlight.js/styles/github-dark.css'
import MarkdownRenderer from '@/components/blog/markdown-renderer'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { ArticleCard } from '@/components/blog/article-card'
import { getPostById, loadAllPosts } from '@/lib/simple-post-loader'
import type { Article } from '@/types/blog'
import { cn } from '@/lib/utils'



// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取作者姓名首字母
const getAuthorInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [article, setArticle] = React.useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [comment, setComment] = React.useState('')
  
  // 获取URL参数
  const highlightQuery = searchParams.get('highlight')
  const anchorText = searchParams.get('anchor')

  // 加载文章数据
  React.useEffect(() => {
    const loadArticle = async () => {
      if (!id) return
      
      setLoading(true)
      try {
        // 根据 ID 获取文章
        const currentArticle = await getPostById(id)
        setArticle(currentArticle)
        
        // 加载相关文章
        const allPosts = await loadAllPosts()
        const related = allPosts
          .filter(post => post.id !== currentArticle?.id)
          .slice(0, 2)
        setRelatedArticles(related)
        
      } catch (error) {
        console.error('Error loading article:', error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadArticle()
  }, [id])

  // 处理内容定位和高亮
  React.useEffect(() => {
    if (!article || !anchorText) return

    const locateContent = () => {
      console.log('尝试定位内容:', decodeURIComponent(anchorText))
      
      // 尝试通过文本内容定位
      const articleContent = document.querySelector('.markdown-content')
      if (!articleContent) {
        console.log('未找到文章内容容器')
        return false
      }

      const decodedAnchor = decodeURIComponent(anchorText).toLowerCase().trim()
      console.log('解码后的锚点文本:', decodedAnchor)
      
      // 获取所有文本节点
      const walker = document.createTreeWalker(
        articleContent,
        NodeFilter.SHOW_TEXT,
        null
      )

      const textNodes: Text[] = []
      let node
      while (node = walker.nextNode()) {
        if (node.textContent && node.textContent.trim()) {
          textNodes.push(node as Text)
        }
      }

      console.log('找到文本节点数量:', textNodes.length)

      // 尝试多种匹配策略
      const searchStrategies = [
        // 策略1: 精确匹配前30个字符
        (text: string) => text.includes(decodedAnchor.substring(0, 30)),
        // 策略2: 匹配前20个字符
        (text: string) => text.includes(decodedAnchor.substring(0, 20)),
        // 策略3: 匹配前15个字符
        (text: string) => text.includes(decodedAnchor.substring(0, 15)),
        // 策略4: 分词匹配
        (text: string) => {
          const anchorWords = decodedAnchor.split(/\s+/).filter(w => w.length > 2)
          return anchorWords.length > 0 && anchorWords.some(word => text.includes(word))
        }
      ]

      for (const strategy of searchStrategies) {
        for (const textNode of textNodes) {
          const textContent = textNode.textContent?.toLowerCase().trim() || ''
          
          if (strategy(textContent)) {
            const element = textNode.parentElement
            if (element) {
              console.log('找到匹配元素:', element.tagName, textContent.substring(0, 50))
              
              // 滚动到元素位置
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
              })
              
              // 添加临时高亮效果
              const originalBg = element.style.backgroundColor
              const originalTransition = element.style.transition
              
              element.style.backgroundColor = '#fef3c7'
              element.style.transition = 'background-color 0.3s ease'
              element.style.padding = '4px 8px'
              element.style.borderRadius = '4px'
              
              setTimeout(() => {
                element.style.backgroundColor = originalBg
                element.style.transition = originalTransition
                element.style.padding = ''
                element.style.borderRadius = ''
              }, 3000)
              
              return true
            }
          }
        }
      }

      console.log('未找到匹配的内容，尝试备用策略')
      
      // 备用策略：如果有高亮查询，尝试定位到第一个匹配的关键词
      if (highlightQuery) {
        const queryWords = highlightQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1)
        
        for (const word of queryWords) {
          for (const textNode of textNodes) {
            const textContent = textNode.textContent?.toLowerCase() || ''
            if (textContent.includes(word)) {
              const element = textNode.parentElement
              if (element) {
                console.log('备用策略找到匹配:', word, textContent.substring(0, 30))
                
                element.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center',
                  inline: 'nearest'
                })
                
                // 添加临时高亮效果
                const originalBg = element.style.backgroundColor
                element.style.backgroundColor = '#dbeafe'
                element.style.transition = 'background-color 0.3s ease'
                element.style.padding = '2px 4px'
                element.style.borderRadius = '4px'
                
                setTimeout(() => {
                  element.style.backgroundColor = originalBg
                  element.style.padding = ''
                  element.style.borderRadius = ''
                }, 2000)
                
                return true
              }
            }
          }
        }
      }
      
      return false
    }

    // 多次尝试定位，确保内容已完全渲染
    const attempts = [800, 1500, 2500]
    let attemptIndex = 0

    const tryLocate = () => {
      console.log(`第 ${attemptIndex + 1} 次尝试定位内容`)
      
      if (locateContent()) {
        console.log('定位成功！')
        return // 成功定位，停止尝试
      }
      
      attemptIndex++
      if (attemptIndex < attempts.length) {
        setTimeout(tryLocate, attempts[attemptIndex] - (attemptIndex > 0 ? attempts[attemptIndex - 1] : 0))
      } else {
        console.log('所有定位尝试都失败了')
      }
    }

    const timer = setTimeout(tryLocate, attempts[0])

    return () => clearTimeout(timer)
  }, [article, anchorText, highlightQuery])

  if (loading) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载中...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
            <p className="text-muted-foreground mb-6">抱歉，您访问的文章不存在或已被删除。</p>
            <Link to="/">
              <Button>返回首页</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // 处理点赞
  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  // 处理收藏
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  // 处理分享
  const handleShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      })
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
    }
  }

  // 提交评论
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      console.log('提交评论:', comment)
      setComment('')
    }
  }

  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主内容区域 */}
          <article className="lg:col-span-3">
            {/* 返回按钮 */}
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>

            {/* 文章头部 */}
            <header className="space-y-6 mb-8">
              {/* 封面图片 */}
              {article.coverImage && (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}

              {/* 分类和标签 */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: (article.category.color || '#6b7280') + '20', color: article.category.color || '#6b7280' }}
                >
                  {article.category.name}
                </Badge>
                {article.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* 文章标题 */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {article.title}
              </h1>

              {/* 文章元信息 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.author.avatar} alt={article.author.name} />
                    <AvatarFallback>
                      {getAuthorInitials(article.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{article.author.name}</p>
                    <p className="text-sm text-muted-foreground">{article.author.bio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{article.readTime} 分钟阅读</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.viewCount} 次阅读</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-3">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="gap-2"
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  {article.likeCount + (isLiked ? 1 : 0)}
                </Button>
                
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="gap-2"
                >
                  <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                  收藏
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  分享
                </Button>
              </div>
            </header>

            {/* 文章内容 */}
            <div className="mb-12">
              <MarkdownRenderer 
                content={article.content} 
                className="text-left [&>*]:text-left markdown-content"
                highlightQuery={highlightQuery}
              />
            </div>

            <Separator className="my-8" />

            {/* 评论区域 */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                评论
              </h3>

              {/* 评论表单 */}
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      placeholder="写下你的想法..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-24"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!comment.trim()}>
                        发表评论
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* 评论提示 */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    暂无评论，快来发表第一条评论吧！
                  </p>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-8" />

            {/* 相关文章 */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold">相关文章</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          </article>

          {/* 侧边栏 */}
          <aside className="lg:col-span-1">
            <BlogSidebar />
          </aside>
        </div>
      </main>
    </div>
  )
}