/**
 * 文章卡片组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Link } from 'react-router-dom'
import { Calendar, Clock, Eye, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Article } from '@/types/blog'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取作者姓名首字母
const getAuthorInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const cardVariants = {
    default: 'hover:shadow-lg transition-all duration-300',
    featured: 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent',
    compact: 'shadow-sm'
  }

  return (
    <Card className={cn(cardVariants[variant], className)}>
      {/* 封面图片 */}
      {article.coverImage && variant !== 'compact' && (
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {variant === 'featured' && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
              精选文章
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="space-y-3">
        {/* 分类标签 */}
        <div className="flex items-center gap-2">
          {article.category && (
            <Badge 
              variant="secondary" 
              style={{ 
                backgroundColor: article.category.color ? article.category.color + '20' : '#f1f5f9', 
                color: article.category.color || '#64748b' 
              }}
            >
              {article.category.name}
            </Badge>
          )}
          {article.tags && article.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* 文章标题 */}
        <Link to={`/article/${article.id}`} className="group">
          <h3 className={cn(
            "font-semibold leading-tight group-hover:text-primary transition-colors",
            variant === 'featured' ? 'text-xl' : 'text-lg',
            variant === 'compact' ? 'text-base' : ''
          )}>
            {article.title}
          </h3>
        </Link>

        {/* 文章摘要 */}
        {variant !== 'compact' && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {article.excerpt}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 作者信息 */}
        {article.author && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.author.avatar} alt={article.author.name} />
              <AvatarFallback className="text-xs">
                {getAuthorInitials(article.author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{article.author.name}</p>
            </div>
          </div>
        )}

        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime || 0} 分钟</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{article.viewCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{article.likeCount || 0}</span>
            </div>
          </div>
        </div>

        {/* 阅读更多按钮 */}
        {variant === 'featured' && (
          <Link to={`/article/${article.id}`}>
            <Button variant="outline" className="w-full">
              阅读全文
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}