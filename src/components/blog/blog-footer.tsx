/**
 * 博客底部组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import { Link } from 'react-router-dom'
import { Heart, Github, Mail, Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'


/**
 * 博客底部组件
 * 包含版权信息、ICP备案号、友情链接等
 */
export function BlogFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-transparent mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 网站信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">我的博客</h3>
            <p className="text-sm text-muted-foreground">
              分享技术心得，记录成长足迹。专注于前端开发、全栈技术和编程思考。
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="mailto:contact@example.com">
                  <Mail className="h-4 w-4" />
                  <span className="sr-only">邮箱</span>
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/rss">
                  <Rss className="h-4 w-4" />
                  <span className="sr-only">RSS订阅</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* 快速导航 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">快速导航</h3>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                首页
              </Link>
              <Link 
                to="/categories" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                分类
              </Link>
              <Link 
                to="/tags" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                标签
              </Link>
              <Link 
                to="/archive" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                归档
              </Link>
              <Link 
                to="/about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                关于
              </Link>
            </nav>
          </div>

          {/* 技术栈 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">技术栈</h3>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <span>React 19</span>
              <span>TypeScript</span>
              <span>Tailwind CSS</span>
              <span>Vite</span>
              <span>shadcn/ui</span>
            </div>
          </div>

          {/* 友情链接 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">友情链接</h3>
            <nav className="flex flex-col space-y-2">
              <a 
                href="https://react.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                React 官网
              </a>
              <a 
                href="https://www.typescriptlang.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                TypeScript
              </a>
              <a 
                href="https://tailwindcss.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tailwind CSS
              </a>
              <a 
                href="https://ui.shadcn.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                shadcn/ui
              </a>
            </nav>
          </div>
        </div>



        {/* 底部版权和备案信息 */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* 版权信息 */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>© {currentYear} 我的博客</span>
            <span>•</span>
            <span className="flex items-center">
              Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> by xxh
            </span>
          </div>

          {/* ICP备案信息 */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-muted-foreground">
            {/* ICP备案号 */}
            <a 
              href="https://beian.miit.gov.cn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              桂ICP备2025066931号-1
            </a>
            
            {/* 公安备案号 */}
            <div className="flex items-center space-x-1">
              <img 
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" 
                alt="公安备案" 
                className="w-3 h-3"
              />
              <a 
                href="http://www.beian.gov.cn/portal/registerSystemInfo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                京公网安备 11010802012345号
              </a>
            </div>
          </div>
        </div>

        {/* 额外的法律声明 */}
        <div className="mt-4 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            本站内容仅供学习交流使用，如有侵权请联系删除 | 
            <Link to="/privacy" className="hover:text-foreground transition-colors ml-1">
              隐私政策
            </Link>
            <span className="mx-1">|</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              使用条款
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}