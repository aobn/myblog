/**
 * 文章详情页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2, Bookmark, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { BlogSidebar } from '@/components/blog/blog-sidebar'
import { ArticleCard } from '@/components/blog/article-card'
import type { Article, Comment } from '@/types/blog'
import { cn } from '@/lib/utils'

// 模拟文章详情数据
const mockArticle: Article = {
  id: '1',
  title: 'React 19 新特性深度解析：并发渲染与 Suspense 的革命性改进',
  content: `
# React 19 新特性深度解析

React 19 带来了许多令人兴奋的新特性和改进，本文将深入探讨这些变化如何影响我们的开发方式。

## 并发渲染机制

React 19 的并发渲染机制是一个重大突破，它允许 React 在渲染过程中暂停和恢复工作，从而提供更好的用户体验。

### 主要特性

1. **时间切片（Time Slicing）**
   - 将长时间运行的任务分解为小块
   - 避免阻塞主线程
   - 提供更流畅的用户交互

2. **优先级调度**
   - 高优先级任务优先处理
   - 用户交互响应更快
   - 智能的任务调度算法

## Suspense 边界优化

Suspense 组件在 React 19 中得到了显著改进：

\`\`\`jsx
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  )
}
\`\`\`

### 新的 Hook API

React 19 引入了几个新的 Hook：

- **useTransition**: 处理非紧急更新
- **useDeferredValue**: 延迟值更新
- **useId**: 生成唯一标识符

## 性能优化建议

1. 合理使用 Suspense 边界
2. 利用并发特性优化用户体验
3. 避免不必要的重渲染

## 总结

React 19 的这些新特性为我们提供了更强大的工具来构建高性能的用户界面。通过合理使用这些特性，我们可以创建更流畅、更响应的应用程序。
  `,
  excerpt: '深入探讨 React 19 带来的并发渲染机制、Suspense 边界优化，以及新的 Hook API 如何改变我们的开发方式。',
  author: {
    id: '1',
    name: '张三',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    bio: '前端架构师，专注于 React 生态系统和性能优化',
    email: 'zhangsan@example.com',
    website: 'https://zhangsan.dev',
    socialLinks: [
      { platform: 'github', url: 'https://github.com/zhangsan' },
      { platform: 'twitter', url: 'https://twitter.com/zhangsan' }
    ]
  },
  category: { id: '1', name: 'React', slug: 'react', articleCount: 18, color: '#61dafb' },
  tags: [
    { id: '1', name: 'React', slug: 'react', articleCount: 32 },
    { id: '2', name: 'JavaScript', slug: 'javascript', articleCount: 45 },
    { id: '3', name: '前端开发', slug: 'frontend', articleCount: 28 }
  ],
  publishedAt: '2025-09-15T10:00:00Z',
  updatedAt: '2025-09-15T10:00:00Z',
  readTime: 12,
  viewCount: 1250,
  likeCount: 89,
  coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
  isPublished: true
}

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: '1',
    content: '非常详细的文章！React 19 的并发特性确实很令人期待。',
    author: {
      name: '李四',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      email: 'lisi@example.com'
    },
    articleId: '1',
    createdAt: '2025-09-15T12:30:00Z',
    replies: [
      {
        id: '2',
        content: '同感！特别是时间切片的概念很有意思。',
        author: {
          name: '王五',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
        },
        articleId: '1',
        parentId: '1',
        createdAt: '2025-09-15T14:15:00Z'
      }
    ]
  },
  {
    id: '3',
    content: '请问有实际的项目案例可以参考吗？',
    author: {
      name: '赵六',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    articleId: '1',
    createdAt: '2025-09-15T16:45:00Z'
  }
]

// 相关文章
const relatedArticles: Article[] = [
  {
    id: '2',
    title: 'TypeScript 5.0 实战指南',
    excerpt: '全面解析 TypeScript 5.0 的新特性',
    publishedAt: '2025-09-12T14:30:00Z',
    readTime: 15,
    viewCount: 980,
    likeCount: 67,
  } as Article,
  {
    id: '3',
    title: 'Vite 构建优化技巧',
    excerpt: '提升开发体验的实用方法',
    publishedAt: '2025-09-10T09:15:00Z',
    readTime: 8,
    viewCount: 756,
    likeCount: 45,
  } as Article
]

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
  const [isLiked, setIsLiked] = React.useState(false)
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [comment, setComment] = React.useState('')

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
    if (navigator.share) {
      navigator.share({
        title: mockArticle.title,
        text: mockArticle.excerpt,
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
              {mockArticle.coverImage && (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={mockArticle.coverImage}
                    alt={mockArticle.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}

              {/* 分类和标签 */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: mockArticle.category.color + '20', color: mockArticle.category.color }}
                >
                  {mockArticle.category.name}
                </Badge>
                {mockArticle.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* 文章标题 */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {mockArticle.title}
              </h1>

              {/* 文章元信息 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mockArticle.author.avatar} alt={mockArticle.author.name} />
                    <AvatarFallback>
                      {getAuthorInitials(mockArticle.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mockArticle.author.name}</p>
                    <p className="text-sm text-muted-foreground">{mockArticle.author.bio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(mockArticle.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{mockArticle.readTime} 分钟阅读</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{mockArticle.viewCount} 次阅读</span>
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
                  {mockArticle.likeCount + (isLiked ? 1 : 0)}
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
            <div className="prose prose-lg max-w-none mb-12">
              <div className="whitespace-pre-wrap leading-relaxed">
                {mockArticle.content}
              </div>
            </div>

            <Separator className="my-8" />

            {/* 评论区域 */}
            <section className="space-y-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                评论 ({mockComments.length})
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

              {/* 评论列表 */}
              <div className="space-y-6">
                {mockComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                          <AvatarFallback>
                            {getAuthorInitials(comment.author.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.author.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{comment.content}</p>
                          
                          {/* 回复 */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                                    <AvatarFallback className="text-xs">
                                      {getAuthorInitials(reply.author.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{reply.author.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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