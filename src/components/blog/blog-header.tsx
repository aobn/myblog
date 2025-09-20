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
  { name: '关于', href: '/about' },
]

export function BlogHeader({ siteName = 'My Blog', className }: BlogHeaderProps) {
  const location = useLocation()
  const { searchQuery, setSearchQuery } = useBlogStore()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

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
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:shadow-md focus:-translate-y-0.5 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActiveLink(item.href, item.exact) && "font-bold shadow-md -translate-y-0.5"
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
                    <X className="h-4 w-4" />
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
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* 移动端搜索 */}
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  type="search"
                  placeholder="搜索文章..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  搜索
                </Button>
              </form>

              {/* 移动端导航菜单 */}
              <nav className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-center rounded-md px-3 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      isActiveLink(item.href, item.exact) && "bg-accent text-accent-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* 移动端主题切换 */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">主题设置</span>
                <ThemeToggle />
              </div>
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
                  className="flex-1"
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