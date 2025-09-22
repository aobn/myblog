/**
 * 统计数据展示组件
 * 
 * @author xxh
 * @date 2025-09-23
 */


import { Eye, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleStats, useTotalStats } from '@/hooks/use-baidu-analytics';

// 文章统计展示组件属性
interface ArticleStatsDisplayProps {
  articleSlug: string;
  className?: string;
  variant?: 'inline' | 'card' | 'badge';
  showTitle?: boolean;
}

// 总体统计展示组件属性
interface TotalStatsDisplayProps {
  className?: string;
  variant?: 'card' | 'inline';
}

// 统计数字格式化
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * 文章统计展示组件
 */
export function ArticleStatsDisplay({ 
  articleSlug, 
  className = '', 
  variant = 'inline',
  showTitle = false 
}: ArticleStatsDisplayProps) {
  const { stats, loading, error } = useArticleStats(articleSlug);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const content = (
    <>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span className="text-sm">{formatNumber(stats.pvCount)}</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm">{formatNumber(stats.visitorCount)}</span>
      </div>
    </>
  );

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">文章统计</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            {content}
          </div>
          {showTitle && stats.title && (
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {stats.title}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {formatNumber(stats.pvCount)}
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {formatNumber(stats.visitorCount)}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {content}
    </div>
  );
}

/**
 * 总体统计展示组件
 */
export function TotalStatsDisplay({ 
  className = '', 
  variant = 'card' 
}: TotalStatsDisplayProps) {
  const { totalStats, loading, error } = useTotalStats();

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center text-muted-foreground ${className}`}>
        <p className="text-sm">统计数据加载失败</p>
      </div>
    );
  }

  const content = (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">总浏览量</span>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          {formatNumber(totalStats.totalPvCount)}
        </p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">总访客数</span>
        </div>
        <p className="text-2xl font-bold text-green-600">
          {formatNumber(totalStats.totalVisitorCount)}
        </p>
      </div>
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">网站统计</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

/**
 * 统计数据加载骨架屏
 */
export function StatsDisplaySkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}