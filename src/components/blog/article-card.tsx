/**
 * 文章卡片组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Clock, Eye, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/types/blog'
import { cn } from '@/lib/utils'
import { useMouseTransform } from '@/hooks/use-mouse-transform'
import { useArticleStatsStorage } from '@/hooks/use-article-stats-storage'
import { NumberCounter } from '@/components/ui/number-counter'

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
  const mouseTransform = useMouseTransform<HTMLDivElement>({
    scale: 1.02,
    rotateX: 5,
    rotateY: 5,
    perspective: 1000
  });
  
  // 获取文章统计数据（包含本地存储）
  const { displayStats } = useArticleStatsStorage(article.slug || article.id);
  
  const cardVariants = {
    default: 'transition-all duration-300 bg-black/20 backdrop-blur-sm shadow-lg',
    featured: 'border-primary/20 bg-black/25 backdrop-blur-sm shadow-xl',
    compact: 'shadow-md bg-black/20 backdrop-blur-sm'
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
      ref={mouseTransform.ref}
      className={cn(
        cardVariants[variant], 
        className, 
        'p-0 cursor-pointer relative border-0 hover:bg-black/30 hover:shadow-xl'
      )}
      onClick={handleCardClick}
      onMouseMove={mouseTransform.onMouseMove}
      onMouseEnter={mouseTransform.onMouseEnter}
      onMouseLeave={mouseTransform.onMouseLeave}
    >
      {/* 响应式布局：大屏幕横向，小屏幕纵向 */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-4",
        variant === 'featured' ? 'p-6 gap-6' : 'p-4'
      )}>
        {/* 内容区域 */}
        <div className={cn(
          "flex-1 min-w-0",
          variant === 'featured' ? 'space-y-4' : 'space-y-3'
        )}>
          {/* 分类标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            {article.category && (
              <Badge 
                variant="secondary" 
                className="font-medium"
                style={{ 
                  color: article.category.color || '#64748b' 
                }}
              >
                {article.category.name}
              </Badge>
            )}
            {article.tags && article.tags.slice(0, 2).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs font-medium">
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* 文章标题 */}
          <Link to={`/article/${article.id}`} className="group">
            <h3 className={cn(
              "font-bold leading-tight group-hover:text-primary transition-colors text-gray-900 dark:text-gray-100",
              variant === 'featured' ? 'text-2xl' : 'text-xl',
              variant === 'compact' ? 'text-lg' : ''
            )}>
              {article.title}
            </h3>
          </Link>

          {/* 文章摘要 */}
          <p className={cn(
            "text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed",
            variant === 'featured' ? 'text-lg font-medium' : 'text-base'
          )}>
            {article.excerpt}
          </p>

          {/* 文章元信息 */}
          <div className={cn(
            "flex items-center gap-4 text-gray-600 dark:text-gray-400 flex-wrap font-medium",
            variant === 'featured' ? 'text-sm mt-4' : 'text-sm'
          )}>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{article.readTime || 0} 分钟阅读</span>
            </div>
            {/* 百度统计浏览量 */}
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>
                <NumberCounter 
                  value={displayStats.pvCount || article.viewCount || 0} 
                  duration={1000}
                  className="font-medium"
                /> 阅读
              </span>
            </div>
            {/* 百度统计访客量 */}
            {displayStats.visitorCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>
                  <NumberCounter 
                    value={displayStats.visitorCount} 
                    duration={1200}
                    className="font-medium"
                  /> 访客
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 图片区域 - 响应式尺寸 */}
        {article.coverImage && (
          <div className="relative w-full sm:w-32 md:w-40 h-32 sm:h-24 md:h-full flex-shrink-0">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105 shadow-md"
            />
          </div>
        )}
      </div>
    </Card>
  )
}