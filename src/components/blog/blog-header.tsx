/**
 * 博客头部导航组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { useBlogStore } from '@/store/blog-store'
import { ThemeToggle } from '@/components/theme-toggle'
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
  { name: '关于', href: '/about' },
]

export function BlogHeader({ siteName = 'My Blog', className }: BlogHeaderProps) {
  const location = useLocation()
  const { searchQuery, setSearchQuery } = useBlogStore()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

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

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // TODO: 实现搜索逻辑
      console.log('搜索:', searchQuery)
    }
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo 和站点名称 */}
          <Link to="/" className="flex items-center space-x-2">
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
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-transform duration-200 hover:scale-110 hover:bg-transparent active:scale-125 active:bg-transparent active:duration-100 focus:outline-none focus:bg-transparent bg-transparent disabled:pointer-events-none disabled:opacity-50",
                        isActiveLink(item.href, item.exact) && "font-bold bg-transparent"
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
            {/* 搜索框 */}
            <div className="hidden sm:block">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="search"
                    placeholder="搜索文章..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    搜索
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4 text-black" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">搜索</span>
                </Button>
              )}
            </div>

            {/* 主题切换按钮 */}
            <ThemeToggle />

            {/* 移动端搜索按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-4 w-4" />
            </Button>

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
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-transform duration-200 hover:scale-110 hover:bg-transparent active:scale-125 active:bg-transparent active:duration-100 focus:outline-none focus:bg-transparent bg-transparent disabled:pointer-events-none disabled:opacity-50",
                      isActiveLink(item.href, item.exact) && "font-bold bg-transparent"
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

        {/* 移动端搜索框（独立显示） */}
        {isSearchOpen && (
          <div className="sm:hidden animate-in slide-in-from-top-2 duration-200 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
            <div className="container mx-auto px-4 pt-4">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  type="search"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <Button type="submit" size="sm">
                  搜索
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}