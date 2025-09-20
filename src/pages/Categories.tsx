/**
 * 分类页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { Folder, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Category, Article } from '@/types/blog'
import { loadAllPosts } from '@/lib/simple-post-loader'

// 分类描述映射
const categoryDescriptions: Record<string, string> = {
  'React': '深入学习 React 框架，包括 Hooks、组件设计模式、性能优化等内容',
  'TypeScript': '掌握 TypeScript 类型系统，提升代码质量和开发效率',
  'JavaScript': 'JavaScript 核心概念、ES6+ 新特性、异步编程等',
  'CSS': '现代 CSS 技术，包括 Flexbox、Grid、动画和响应式设计',
  'Vue.js': 'Vue.js 框架学习，包括组合式 API、状态管理等',
  'Node.js': '服务端 JavaScript 开发，API 设计、数据库操作等',
  '前端开发': '前端开发技术栈，包括框架、工具、最佳实践等',
  '技术教程': '各种技术教程和实践指南，帮助提升开发技能',
  '博客': '博客搭建、写作技巧、内容管理等相关内容',
  'Vite': '现代前端构建工具 Vite 的使用和配置',
  '工具分享': '开发工具、效率工具、实用插件等分享',
  '性能优化': '前端性能优化策略，包括加载优化、渲染优化等',
  '设计模式': '软件设计模式在前端开发中的应用和实践'
}

// 处理分类数据 - 只基于 category 字段
const processCategoriesData = (articles: Article[]): Category[] => {
  const categoryMap = new Map<string, { color: string; count: number }>()
  
  // 只统计 category 字段
  articles
    .filter(article => article.isPublished && article.category)
    .forEach(article => {
      const categoryName = article.category.name
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          color: article.category.color || '#6b7280',
          count: 0
        })
      }
      categoryMap.get(categoryName)!.count++
    })
  
  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    id: `category-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: categoryDescriptions[name] || `${name} 相关的技术文章和实践经验`,
    color: data.color,
    articleCount: data.count
  })).sort((a, b) => b.articleCount - a.articleCount)
}

export default function Categories() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const articles = await loadAllPosts()
        const processedCategories = processCategoriesData(articles)
        setCategories(processedCategories)
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-lg text-muted-foreground">加载分类中...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2">
            <Folder className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">文章分类</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            按主题浏览文章，找到你感兴趣的技术内容
          </p>
        </div>

        {/* 分类网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className="w-fit"
                    style={{ 
                      backgroundColor: category.color + '20', 
                      color: category.color 
                    }}
                  >
                    {category.articleCount} 篇文章
                  </Badge>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-16 text-center">
          <Card className="inline-block">
            <CardContent className="pt-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">个分类</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {categories.reduce((sum, cat) => sum + cat.articleCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">篇文章</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}