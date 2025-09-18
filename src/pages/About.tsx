/**
 * 关于页面组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Github, Twitter, Mail, Globe, Heart, Code, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'


// 技能标签
const skills = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js',
  'CSS', 'Tailwind CSS', 'Sass', 'Webpack', 'Vite',
  'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL'
]

// 统计数据
const stats = [
  { label: '文章总数', value: '120+', icon: Code },
  { label: '代码行数', value: '50K+', icon: Github },
  { label: '咖啡杯数', value: '∞', icon: Coffee },
  { label: '开源项目', value: '25+', icon: Heart }
]

export default function About() {
  return (
    <div className="bg-background">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* 个人介绍卡片 */}
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20"></div>
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-12">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face" 
                    alt="作者头像" 
                  />
                  <AvatarFallback className="text-2xl">张三</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">张三</h1>
                    <p className="text-lg text-muted-foreground">前端架构师 & 技术博主</p>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    热爱技术，专注于前端开发和用户体验设计。拥有 8 年的前端开发经验，
                    擅长 React、Vue.js 生态系统，对性能优化和工程化有深入研究。
                    喜欢分享技术心得，帮助更多开发者成长。
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default" size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      联系我
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Globe className="h-4 w-4" />
                      个人网站
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <stat.icon className="h-8 w-8 text-primary" />
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 技能标签 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                技术栈
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 博客介绍 */}
          <Card>
            <CardHeader>
              <CardTitle>关于这个博客</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                这个博客是我分享技术心得和学习笔记的地方。我会定期更新关于前端开发、
                JavaScript、React、TypeScript 等技术的文章，希望能够帮助到正在学习
                这些技术的朋友们。
              </p>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">内容方向</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 前端框架深度解析</li>
                    <li>• JavaScript 核心概念</li>
                    <li>• 性能优化实践</li>
                    <li>• 工程化工具使用</li>
                    <li>• 最佳实践分享</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">更新频率</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 每周 2-3 篇技术文章</li>
                    <li>• 月度技术总结</li>
                    <li>• 不定期工具推荐</li>
                    <li>• 开源项目分享</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 联系方式 */}
          <Card>
            <CardHeader>
              <CardTitle>联系我</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                如果你有任何问题、建议或者想要交流技术，欢迎通过以下方式联系我：
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">邮箱</div>
                    <div className="text-sm text-muted-foreground">zhangsan@example.com</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Github className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-sm text-muted-foreground">@zhangsan</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Twitter className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">Twitter</div>
                    <div className="text-sm text-muted-foreground">@zhangsan_dev</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">个人网站</div>
                    <div className="text-sm text-muted-foreground">zhangsan.dev</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 致谢 */}
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <span>感谢你的阅读</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>让我们一起成长</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}