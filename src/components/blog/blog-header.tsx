/**
 * 博客头部导航组件
 * 
 * @author xxh
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { getAnalyticsConfig } from '@/config/analytics'
import { cn } from '@/lib/utils'

interface BlogHeaderProps {
  siteName?: string
  className?: string
}

// 导航菜单项
const navigationItems = [
  { name: '首页', href: '/', exact: true },
  { name: '文章', href: '/articles' },
  { name: '分类', href: '/categories' },
  { name: '标签', href: '/tags' },
  { name: '归档', href: '/archive' },
  { name: '统计', href: '/analytics' },
  { name: '关于', href: '/about' },
]

export function BlogHeader({ siteName = 'My Blog', className }: BlogHeaderProps) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // 百度统计代码
  React.useEffect(() => {
    // 初始化百度统计
    if (typeof window !== 'undefined') {
      const config = getAnalyticsConfig();
      (window as any)._hmt = (window as any)._hmt || [];
      (function() {
        const hm = document.createElement("script");
        hm.src = `https://hm.baidu.com/hm.js?${config.siteCode}`;
        const s = document.getElementsByTagName("script")[0]; 
        s.parentNode?.insertBefore(hm, s);
      })();
    }
  }, [])

  // 监听页面滚动，自动关闭移动端菜单
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      // 延迟添加滚动监听器，避免菜单打开时立即触发
      timeoutId = setTimeout(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
      }, 100)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobileMenuOpen])

  // 检查当前路径是否激活
  const isActiveLink = (href: string, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }



  return (
    <header className={cn("w-full", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo 和站点名称 */}
          <Link to="/" className="flex items-center space-x-2 jelly-light">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl">{siteName}</span>
          </Link>

          {/* 桌面端导航菜单 */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium jelly-light focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActiveLink(item.href, item.exact) && "font-bold"
                      )}
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* 搜索和移动端菜单 */}
          <div className="flex items-center space-x-2">
            {/* 搜索按钮 - 直接跳转到搜索页面 */}
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link to="/search">
                <Search className="h-4 w-4" />
                <span className="sr-only">搜索</span>
              </Link>
            </Button>

            {/* 主题切换按钮 */}
            <ThemeToggle />

            {/* 移动端菜单按钮 */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">切换菜单</span>
            </Button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4 py-4">
              {/* 移动端导航菜单和主题切换 */}
              <nav className="flex flex-wrap justify-center gap-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium jelly-light focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      isActiveLink(item.href, item.exact) && "font-bold"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <ThemeToggle />
              </nav>
            </div>
          </div>
        )}


      </div>
    </header>
  )
}