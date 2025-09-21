/**
 * 博客文章加载器 - 从 posts 文件夹动态加载 Markdown 文件
 * 
 * @author CodeBuddy
 * @date 2025-09-20
 */

import type { Article } from '@/types/blog'

// 动态导入所有 posts 文件夹下的 Markdown 文件
const postModules = import.meta.glob('/src/posts/*.md', { 
  query: '?raw', 
  import: 'default',
  eager: true 
}) as Record<string, string>

// 解析 Front Matter
function parseFrontMatter(content: string) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)
  
  if (!match) {
    return {
      frontMatter: {},
      content: content
    }
  }
  
  const frontMatterText = match[1]
  const markdownContent = match[2]
  
  // 简单的 YAML 解析
  const frontMatter: Record<string, any> = {}
  const lines = frontMatterText.split('\n')
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()
      
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      // 处理数组（简单的方括号格式）
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1)
        const arrayValue = arrayContent.split(',').map(item => 
          item.trim().replace(/^["']|["']$/g, '')
        )
        frontMatter[key] = arrayValue
        continue
      }
      
      // 处理布尔值
      if (value === 'true') {
        frontMatter[key] = true
        continue
      }
      if (value === 'false') {
        frontMatter[key] = false
        continue
      }
      
      // 处理数字
      if (!isNaN(Number(value)) && value !== '') {
        frontMatter[key] = Number(value)
        continue
      }
      
      frontMatter[key] = value
    }
  }
  
  return {
    frontMatter,
    content: markdownContent
  }
}

// 生成文章 ID
function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// 计算阅读时间（基于字数）
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// 生成摘要
function generateExcerpt(content: string, maxLength: number = 150): string {
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  return plainText.substring(0, maxLength).trim() + '...'
}

// 获取分类颜色
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    '技术教程': '#10b981',
    'React': '#61dafb',
    'TypeScript': '#3178c6',
    'JavaScript': '#f7df1e',
    'CSS': '#06b6d4',
    'Vue': '#4fc08d',
    'Node.js': '#339933',
    '前端开发': '#ff6b6b',
    '后端开发': '#4ecdc4',
    '全栈开发': '#45b7d1',
    '工具': '#ffa726',
    '教程': '#ab47bc',
  }
  
  return colorMap[category] || '#6b7280'
}

// 加载所有文章
export async function loadAllPosts(): Promise<Article[]> {
  try {
    const articles: Article[] = []
    
    // 遍历所有导入的 Markdown 文件
    for (const [filePath, content] of Object.entries(postModules)) {
      try {
        const { frontMatter, content: markdownContent } = parseFrontMatter(content)
        
        // 从文件路径提取文件名作为默认标题
        const fileName = filePath.split('/').pop()?.replace('.md', '') || 'untitled'
        
        const article: Article = {
          id: generateId(frontMatter.title || fileName),
          title: frontMatter.title || fileName,
          slug: frontMatter.slug || generateId(frontMatter.title || fileName),
          content: markdownContent,
          excerpt: frontMatter.excerpt || generateExcerpt(markdownContent),
          author: {
            id: 'author-1',
            name: frontMatter.author || 'CodeBuddy',
            avatar: '/images/avatar.jpg',
            bio: '前端开发工程师，专注于现代化 Web 技术',
            email: 'codebuddy@example.com',
            website: 'https://codebuddy.dev',
          },
          category: {
            id: `category-${generateId(frontMatter.category || '技术教程')}`,
            name: frontMatter.category || '技术教程',
            slug: generateId(frontMatter.category || '技术教程'),
            articleCount: 1,
            color: getCategoryColor(frontMatter.category || '技术教程'),
          },
          tags: (frontMatter.tags || ['博客']).map((tag: string) => ({
            id: `tag-${generateId(tag)}`,
            name: tag,
            slug: generateId(tag),
            articleCount: 1,
            color: '#6b7280',
          })),
          publishedAt: frontMatter.publishedAt || new Date().toISOString().split('T')[0],
          updatedAt: frontMatter.updatedAt || new Date().toISOString().split('T')[0],
          readTime: frontMatter.readTime || calculateReadTime(markdownContent),
          viewCount: frontMatter.viewCount || 0,
          likeCount: frontMatter.likeCount || 0,
          coverImage: frontMatter.coverImage,
          isPublished: frontMatter.isPublished !== false,
        }
        
        articles.push(article)
      } catch (fileError) {
        console.error(`Error processing file ${filePath}:`, fileError)
      }
    }
    
    // 按发布日期排序（最新的在前）
    return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  } catch (error) {
    console.error('Error loading posts:', error)
    return []
  }
}

// 根据 ID 获取文章
export async function getPostById(id: string): Promise<Article | null> {
  const posts = await loadAllPosts()
  return posts.find(post => post.id === id || post.title === id) || null
}