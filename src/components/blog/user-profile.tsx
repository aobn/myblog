/**
 * 用户个人信息组件
 * 
 * @author xxh
 * @date 2025-09-22
 */

import { Card, CardContent } from '@/components/ui/card'
import { Github, Calendar } from 'lucide-react'
import { useMouseTransform } from '@/hooks/use-mouse-transform'

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
              <span>👁️ 观点 34319</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💬 访客 2773</span>
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