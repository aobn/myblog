/**
 * 分类页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Link } from 'react-router-dom'
import { Folder, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/types/blog'


// 模拟分类数据
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'React',
    slug: 'react',
    description: '深入学习 React 框架，包括 Hooks、组件设计模式、性能优化等内容',
    color: '#61dafb',
    articleCount: 25
  },
  {
    id: '2',
    name: 'TypeScript',
    slug: 'typescript',
    description: '掌握 TypeScript 类型系统，提升代码质量和开发效率',
    color: '#3178c6',
    articleCount: 18
  },
  {
    id: '3',
    name: 'CSS',
    slug: 'css',
    description: '现代 CSS 技术，包括 Flexbox、Grid、动画和响应式设计',
    color: '#06b6d4',
    articleCount: 22
  },
  {
    id: '4',
    name: '前端工程化',
    slug: 'frontend-engineering',
    description: '构建工具、打包优化、CI/CD 等前端工程化实践',
    color: '#10b981',
    articleCount: 15
  },
  {
    id: '5',
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript 核心概念、ES6+ 新特性、异步编程等',
    color: '#f7df1e',
    articleCount: 32
  },
  {
    id: '6',
    name: '性能优化',
    slug: 'performance',
    description: '前端性能优化策略，包括加载优化、渲染优化、内存管理等',
    color: '#ef4444',
    articleCount: 12
  },
  {
    id: '7',
    name: 'Node.js',
    slug: 'nodejs',
    description: '服务端 JavaScript 开发，API 设计、数据库操作等',
    color: '#339933',
    articleCount: 14
  },
  {
    id: '8',
    name: '设计模式',
    slug: 'design-patterns',
    description: '软件设计模式在前端开发中的应用和实践',
    color: '#8b5cf6',
    articleCount: 9
  }
]

export default function Categories() {
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
          {mockCategories.map((category) => (
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
                    {mockCategories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">个分类</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {mockCategories.reduce((sum, cat) => sum + cat.articleCount, 0)}
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