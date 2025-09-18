/**
 * 标签页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { Tag, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BlogHeader } from '@/components/blog/blog-header'
import type { Tag as TagType } from '@/types/blog'
import { cn } from '@/lib/utils'

// 模拟标签数据
const mockTags: TagType[] = [
  { id: '1', name: 'JavaScript', slug: 'javascript', articleCount: 45 },
  { id: '2', name: 'React', slug: 'react', articleCount: 32 },
  { id: '3', name: 'TypeScript', slug: 'typescript', articleCount: 28 },
  { id: '4', name: 'CSS', slug: 'css', articleCount: 25 },
  { id: '5', name: 'Vue.js', slug: 'vuejs', articleCount: 18 },
  { id: '6', name: 'Node.js', slug: 'nodejs', articleCount: 16 },
  { id: '7', name: 'Webpack', slug: 'webpack', articleCount: 12 },
  { id: '8', name: 'Vite', slug: 'vite', articleCount: 11 },
  { id: '9', name: '性能优化', slug: 'performance', articleCount: 10 },
  { id: '10', name: 'Tailwind CSS', slug: 'tailwind', articleCount: 9 },
  { id: '11', name: '设计模式', slug: 'design-patterns', articleCount: 8 },
  { id: '12', name: 'Git', slug: 'git', articleCount: 7 },
  { id: '13', name: 'Docker', slug: 'docker', articleCount: 6 },
  { id: '14', name: 'GraphQL', slug: 'graphql', articleCount: 5 },
  { id: '15', name: 'PWA', slug: 'pwa', articleCount: 4 },
  { id: '16', name: 'WebAssembly', slug: 'webassembly', articleCount: 3 },
  { id: '17', name: 'Deno', slug: 'deno', articleCount: 2 },
  { id: '18', name: 'Rust', slug: 'rust', articleCount: 2 },
]

// 根据文章数量获取标签大小
const getTagSize = (count: number) => {
  if (count >= 30) return 'text-2xl'
  if (count >= 20) return 'text-xl'
  if (count >= 10) return 'text-lg'
  if (count >= 5) return 'text-base'
  return 'text-sm'
}

// 根据文章数量获取标签颜色
const getTagColor = (count: number) => {
  if (count >= 30) return 'bg-primary text-primary-foreground'
  if (count >= 20) return 'bg-blue-500 text-white'
  if (count >= 10) return 'bg-green-500 text-white'
  if (count >= 5) return 'bg-yellow-500 text-white'
  return 'bg-gray-500 text-white'
}

export default function Tags() {
  const [viewMode, setViewMode] = React.useState<'cloud' | 'list'>('cloud')

  // 按文章数量排序
  const sortedTags = [...mockTags].sort((a, b) => b.articleCount - a.articleCount)

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader siteName="技术博客" />
      
      <main className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">标签云</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            通过标签快速找到相关主题的文章
          </p>
        </div>

        {/* 视图切换 */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'cloud' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cloud')}
              className="rounded-r-none"
            >
              标签云
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              列表视图
            </Button>
          </div>
        </div>

        {/* 标签云视图 */}
        {viewMode === 'cloud' && (
          <Card className="mb-12">
            <CardContent className="pt-8">
              <div className="flex flex-wrap items-center justify-center gap-4 min-h-64">
                {sortedTags.map((tag) => (
                  <Link key={tag.id} to={`/tag/${tag.slug}`}>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md px-4 py-2",
                        getTagSize(tag.articleCount),
                        getTagColor(tag.articleCount)
                      )}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {tag.name}
                      <span className="ml-2 text-xs opacity-80">
                        {tag.articleCount}
                      </span>
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {sortedTags.map((tag) => (
              <Link key={tag.id} to={`/tag/${tag.slug}`}>
                <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {tag.name}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {tag.articleCount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">标签总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center text-primary">
                {mockTags.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">文章总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center text-primary">
                {mockTags.reduce((sum, tag) => sum + tag.articleCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">最热标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">
                  {sortedTags[0]?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {sortedTags[0]?.articleCount} 篇文章
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}