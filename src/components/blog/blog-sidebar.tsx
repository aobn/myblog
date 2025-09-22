/**
 * 博客侧边栏组件
 * 
 * @author xxh
 * @date 2025-09-18
 */

import { cn } from '@/lib/utils'
import { UserProfile } from './user-profile'

interface BlogSidebarProps {
  className?: string
}

export function BlogSidebar({ className }: BlogSidebarProps) {
  return (
    <aside className={cn("space-y-6", className)}>
      {/* 个人信息 */}
      <UserProfile />
    </aside>
  )
}