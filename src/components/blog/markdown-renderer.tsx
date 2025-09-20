/**
 * Markdown 渲染组件
 * 
 * @author CodeBuddy
 * @date 2025-09-20
 */

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { CodeBlock } from './code-block'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 自定义标题渲染
          h1: (props: any) => (
            <h1 className="text-3xl font-bold mb-6 mt-8 text-foreground border-b pb-2">
              {props.children}
            </h1>
          ),
          h2: (props: any) => (
            <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
              {props.children}
            </h2>
          ),
          h3: (props: any) => (
            <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">
              {props.children}
            </h3>
          ),
          
          // 自定义段落渲染
          p: (props: any) => (
            <p className="mb-4 leading-7 text-muted-foreground">
              {props.children}
            </p>
          ),
          
          // 自定义代码块渲染
          code: (props: any) => {
            const match = /language-(\w+)/.exec(props.className || '')
            // 行内代码
            if (!match) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                  {props.children}
                </code>
              )
            }
            // 代码块由pre标签处理
            return (
              <code className={props.className} {...props}>
                {props.children}
              </code>
            )
          },
          
          // 自定义预格式化文本渲染（代码块）
          pre: (props: any) => {
            // 获取代码语言
            const child = React.Children.toArray(props.children)[0] as React.ReactElement
            
            // 安全地访问props
            const childProps = child?.props as Record<string, any> | undefined
            const className = childProps?.className as string || ''
            
            const match = /language-(\w+)/.exec(className)
            const language = match ? match[1] : ''
            
            return (
              <CodeBlock language={language}>
                {props.children}
              </CodeBlock>
            )
          },
          
          // 自定义列表渲染
          ul: (props: any) => (
            <ul className="mb-4 ml-6 list-disc space-y-1">
              {props.children}
            </ul>
          ),
          ol: (props: any) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1">
              {props.children}
            </ol>
          ),
          li: (props: any) => (
            <li className="text-muted-foreground">
              {props.children}
            </li>
          ),
          
          // 自定义引用渲染
          blockquote: (props: any) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 bg-muted/50 rounded-r">
              {props.children}
            </blockquote>
          ),
          
          // 自定义链接渲染
          a: (props: any) => (
            <a 
              href={props.href} 
              className="text-primary hover:text-primary/80 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {props.children}
            </a>
          ),
          
          // 自定义表格渲染
          table: (props: any) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-border">
                {props.children}
              </table>
            </div>
          ),
          th: (props: any) => (
            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
              {props.children}
            </th>
          ),
          td: (props: any) => (
            <td className="border border-border px-4 py-2">
              {props.children}
            </td>
          ),
          
          // 自定义分割线渲染
          hr: () => (
            <hr className="my-8 border-border" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}