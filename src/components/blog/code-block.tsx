/**
 * 代码块组件，支持复制功能
 * 
 * @author xxh
 * @date 2025-09-21
 */

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string
  language?: string
}

export function CodeBlock({ children, className, language }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const codeRef = React.useRef<HTMLPreElement>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleCopy = React.useCallback(() => {
    if (!codeRef.current) return
    
    // 获取纯文本内容
    const codeText = codeRef.current.textContent || ''
    
    // 复制到剪贴板
    navigator.clipboard.writeText(codeText)
      .then(() => {
        setCopied(true)
        
        // 2秒后重置复制状态
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
      .catch((error) => {
        console.error('复制失败:', error)
      })
  }, [])

  // 组件卸载时清除定时器
  React.useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="relative group">
      <pre
        ref={codeRef}
        className={cn(
          "rounded-lg p-4 overflow-x-auto text-sm font-mono",
          "bg-zinc-950 text-zinc-100", // 使用固定的深色背景和浅色文字
          "pt-10", // 增加顶部内边距，为顶部工具栏留出空间
          className
        )}
      >
        {children}
      </pre>
      
      {/* 顶部工具栏 - 使用相同的背景色 */}
      <div className="absolute top-0 right-0 left-0 h-8 flex items-center justify-between px-4 bg-zinc-950 text-zinc-100">
        {/* 语言标签 */}
        {language && (
          <div className="text-xs font-mono text-muted-foreground">
            {language}
          </div>
        )}
        
        {/* 复制按钮 - 始终显示在右上角，样式更明显 */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md",
            "bg-primary hover:bg-primary/90",
            "text-primary-foreground",
            "transition-all duration-200",
          )}
          aria-label="复制代码"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">复制</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}