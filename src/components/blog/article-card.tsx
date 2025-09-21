/**
 * 文章卡片组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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



export function ArticleCard({ article, variant = 'default', className }: ArticleCardProps) {
  const navigate = useNavigate();
  const cardVariants = {
    default: 'transition-all duration-300',
    featured: 'border-primary/20 bg-gradient-to-br from-primary/5 to-transparent',
    compact: 'shadow-sm'
  }
  
  // 处理卡片点击事件
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 检查点击的元素是否是链接或其子元素
    const isLinkClick = (e.target as HTMLElement).closest('a, button, .no-card-click');
    
    // 如果点击的是链接或其子元素，不执行导航操作
    if (!isLinkClick) {
      navigate(`/article/${article.id}`);
    }
  };

  return (
    <Card 
      className={cn(
        cardVariants[variant], 
        className, 
        'p-0 cursor-pointer relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50'
      )}
      onClick={handleCardClick}
    >

      {/* 响应式布局：大屏幕横向，小屏幕纵向 */}
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        {/* 内容区域 */}
        <div className="flex-1 space-y-2 min-w-0">
          {/* 分类标签 */}
          <div className="flex items-center gap-2 flex-wrap">
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
          <p className="text-muted-foreground text-sm line-clamp-2">
            {article.excerpt}
          </p>

          {/* 文章元信息 */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime || 0} 分钟阅读</span>
            </div>
          </div>
        </div>

        {/* 图片区域 - 响应式尺寸 */}
        {article.coverImage && (
          <div className="relative w-full sm:w-32 md:w-40 h-32 sm:h-24 md:h-full flex-shrink-0">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
      </div>
    </Card>
  )
}