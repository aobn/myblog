/**
 * 用户个人信息组件
 * 
 * @author xxh
 * @date 2025-09-22
 */

import { Card, CardContent } from '@/components/ui/card'
import { Github, Calendar, Eye, Users } from 'lucide-react'
import { useMouseTransform } from '@/hooks/use-mouse-transform'
import { useBaiduAnalytics } from '@/hooks/use-baidu-analytics'
import { NumberCounter } from '@/components/ui/number-counter'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useEffect } from 'react'

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const mouseTransform = useMouseTransform<HTMLDivElement>({
    scale: 1.03,
    rotateX: 8,
    rotateY: 8,
    perspective: 1000
  });

  // 本地存储的统计数据
  const [cachedStats, setCachedStats] = useLocalStorage('blog-total-stats', {
    totalPvCount: 0,
    totalVisitorCount: 0,
    lastUpdated: 0
  });

  // 获取百度统计总数据
  const { totalStats } = useBaiduAnalytics();

  // 当获取到新数据时，更新本地存储
  useEffect(() => {
    if (totalStats && (totalStats.totalPvCount > 0 || totalStats.totalVisitorCount > 0)) {
      const newStats = {
        totalPvCount: totalStats.totalPvCount,
        totalVisitorCount: totalStats.totalVisitorCount,
        lastUpdated: Date.now()
      };
      
      // 只有数据真正变化时才更新
      if (newStats.totalPvCount !== cachedStats.totalPvCount || 
          newStats.totalVisitorCount !== cachedStats.totalVisitorCount) {
        console.log('📊 更新本地存储的统计数据:', newStats);
        setCachedStats(newStats);
      }
    }
  }, [totalStats, cachedStats, setCachedStats]);

  // 显示的数据：优先使用最新数据，否则使用缓存数据
  const displayStats = {
    totalPvCount: totalStats?.totalPvCount || cachedStats.totalPvCount,
    totalVisitorCount: totalStats?.totalVisitorCount || cachedStats.totalVisitorCount
  };

  return (
    <Card 
      ref={mouseTransform.ref}
      className={`transition-all duration-300 bg-black/20 backdrop-blur-sm shadow-lg border-0 hover:bg-black/30 hover:shadow-xl ${className || ''}`}
      onMouseMove={mouseTransform.onMouseMove}
      onMouseEnter={mouseTransform.onMouseEnter}
      onMouseLeave={mouseTransform.onMouseLeave}
    >
      <CardContent className="p-1">
        <div className="flex flex-col items-center text-center space-y-1">
          {/* 头像 */}
          <div className="relative">
            <img
              src="/avatar.jpg"
              alt="xxh"
              className="w-50 h-50 rounded-lg object-cover border-2 border-border shadow-sm"
              onError={(e) => {
                // 如果头像加载失败，使用默认头像
                const target = e.target as HTMLImageElement
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' rx='8' fill='%23f3f4f6'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%236b7280'/%3E%3Cpath d='M20 65c0-11 9-20 20-20s20 9 20 20' fill='%236b7280'/%3E%3C/svg%3E"
              }}
            />
          </div>

          {/* 用户名 */}
          <div>
            <h3 className="font-semibold text-lg">xxh</h3>
            <p className="text-sm text-muted-foreground">Protect What You Love.</p>
          </div>

          {/* 简介 */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            热爱技术的前端开发者，专注于 React、TypeScript 和现代前端技术栈。
            喜欢分享技术心得，记录学习历程。
          </p>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>
                浏览 <NumberCounter 
                  value={displayStats.totalPvCount} 
                  duration={1500}
                  className="font-medium"
                />
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                访客 <NumberCounter 
                  value={displayStats.totalVisitorCount} 
                  duration={1800}
                  className="font-medium"
                />
              </span>
            </div>
          </div>

          {/* 社交链接 */}
          <div className="flex gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors jelly-light"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors jelly-light"
              title="日历"
            >
              <Calendar className="h-4 w-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}