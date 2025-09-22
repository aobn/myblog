/**
 * 文章目录组件
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'
import { List, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
  element: HTMLElement
}

interface ArticleTocProps {
  className?: string
}

export function ArticleToc({ className }: ArticleTocProps) {
  const [tocItems, setTocItems] = React.useState<TocItem[]>([])
  const [activeId, setActiveId] = React.useState<string>('')

  // 生成目录
  React.useEffect(() => {
    const generateToc = () => {
      const articleContent = document.querySelector('.markdown-content')
      if (!articleContent) return

      const headings = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const items: TocItem[] = []

      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1))
        const text = heading.textContent || ''
        const id = heading.id || `heading-${index}`
        
        // 如果没有 id，给标题添加 id
        if (!heading.id) {
          heading.id = id
        }

        items.push({
          id,
          text,
          level,
          element: heading as HTMLElement
        })
      })

      setTocItems(items)
    }

    // 延迟生成目录，确保内容已渲染
    const timer = setTimeout(generateToc, 500)
    return () => clearTimeout(timer)
  }, [])

  // 监听滚动，高亮当前章节
  React.useEffect(() => {
    if (tocItems.length === 0) return

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      
      // 找到当前可见的标题
      let currentId = ''
      
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i]
        const rect = item.element.getBoundingClientRect()
        
        // 如果标题在视口上方或刚进入视口
        if (rect.top <= windowHeight * 0.3) {
          currentId = item.id
          break
        }
      }
      
      setActiveId(currentId)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 初始调用

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  // 点击目录项跳转
  const handleTocClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80 // 考虑固定头部的高度
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) {
    return null
  }

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <List className="h-4 w-4" />
          文章目录
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-h-80 overflow-y-auto scrollbar-hide">
          <div className="space-y-0.5">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTocClick(item.id)}
                className={cn(
                  "w-full text-left text-xs py-1.5 px-2 rounded transition-colors hover:bg-accent hover:text-accent-foreground",
                  "flex items-center gap-1.5",
                  activeId === item.id && "bg-accent text-accent-foreground font-medium"
                )}
                style={{
                  paddingLeft: `${(item.level - 1) * 8 + 8}px`
                }}
              >
                {activeId === item.id && (
                  <ChevronRight className="h-2.5 w-2.5 text-primary flex-shrink-0" />
                )}
                <span className="line-clamp-1 flex-1 text-left">
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}