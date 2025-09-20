/**
 * 简化的 Markdown 渲染组件
 * 
 * @author CodeBuddy
 * @date 2025-09-20
 */



interface SimpleMarkdownProps {
  content: string
  className?: string
}

export default function SimpleMarkdown({ content, className = '' }: SimpleMarkdownProps) {
  // 简单的 Markdown 解析函数
  const parseMarkdown = (text: string) => {
    return text
      // 处理标题
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-3 mt-6 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-4 mt-8 text-foreground">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 mt-8 text-foreground border-b pb-2">$1</h1>')
      
      // 处理粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // 处理行内代码
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">$1</code>')
      
      // 处理链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary/80 underline underline-offset-4" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 处理代码块
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```(\w+)?\n?/, '').replace(/```$/, '')
        return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto mb-4 border"><code class="text-sm">${code}</code></pre>`
      })
      
      // 处理段落
      .replace(/\n\n/g, '</p><p class="mb-4 leading-7 text-muted-foreground">')
      
      // 处理列表
      .replace(/^\- (.*$)/gim, '<li class="text-muted-foreground">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="text-muted-foreground">$1</li>')
  }

  const htmlContent = parseMarkdown(content)

  return (
    <div 
      className={`prose prose-lg dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: `<p class="mb-4 leading-7 text-muted-foreground">${htmlContent}</p>` 
      }}
    />
  )
}