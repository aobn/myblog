/**
 * 主题切换组件 - 涟漪扩散效果
 * 
 * @author CodeBuddy
 * @date 2024-01-18
 */

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

/**
 * 主题切换组件
 * 实现涟漪扩散效果，从按钮位置向外扩散新主题颜色
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    // 添加涟漪动画样式
    const styleId = 'ripple-theme-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        /* 涟漪遮罩层 */
        .theme-ripple-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }
        
        /* 涟漪圆形 */
        .theme-ripple-circle {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          opacity: 1;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* 涟漪展开动画 */
        .theme-ripple-circle.expanding {
          transform: scale(1);
          opacity: 0.9;
        }
        
        /* 涟漪消失动画 */
        .theme-ripple-circle.fading {
          opacity: 0;
        }
        
        /* 按钮点击效果 */
        .theme-toggle-pressed {
          transform: scale(0.95);
          transition: transform 0.1s ease;
        }
        
        /* 主题切换时的平滑过渡 */
        html, body {
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .bg-background, .bg-card, .bg-muted {
          transition: background-color 0.3s ease;
        }
        
        .text-foreground, .text-muted-foreground {
          transition: color 0.3s ease;
        }
        
        .border {
          transition: border-color 0.3s ease;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const createRippleEffect = () => {
    if (!buttonRef.current) return

    // 获取按钮位置
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const centerX = buttonRect.left + buttonRect.width / 2
    const centerY = buttonRect.top + buttonRect.height / 2

    // 计算需要覆盖整个屏幕的圆形半径
    const maxDistance = Math.sqrt(
      Math.pow(Math.max(centerX, window.innerWidth - centerX), 2) +
      Math.pow(Math.max(centerY, window.innerHeight - centerY), 2)
    )

    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.className = 'theme-ripple-overlay'

    // 创建涟漪圆形
    const ripple = document.createElement('div')
    ripple.className = 'theme-ripple-circle'
    
    // 设置新主题的背景色
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    const rippleColor = newTheme === 'dark' 
      ? 'hsl(222.2 84% 4.9%)' // dark theme background
      : 'hsl(0 0% 100%)'      // light theme background

    ripple.style.backgroundColor = rippleColor
    ripple.style.left = `${centerX}px`
    ripple.style.top = `${centerY}px`
    ripple.style.width = `${maxDistance * 2}px`
    ripple.style.height = `${maxDistance * 2}px`
    ripple.style.marginLeft = `-${maxDistance}px`
    ripple.style.marginTop = `-${maxDistance}px`

    overlay.appendChild(ripple)
    document.body.appendChild(overlay)

    // 按钮按下效果
    buttonRef.current.classList.add('theme-toggle-pressed')

    // 开始涟漪动画
    requestAnimationFrame(() => {
      ripple.classList.add('expanding')
    })

    // 在涟漪扩散到一半时切换主题
    setTimeout(() => {
      setTheme(newTheme)
    }, 200)

    // 动画结束后清理
    setTimeout(() => {
      ripple.classList.add('fading')
      buttonRef.current?.classList.remove('theme-toggle-pressed')
      
      setTimeout(() => {
        document.body.removeChild(overlay)
        setIsAnimating(false)
      }, 300)
    }, 400)
  }

  const toggleTheme = () => {
    if (isAnimating) return

    setIsAnimating(true)
    createRippleEffect()
  }

  return (
    <Button 
      ref={buttonRef}
      variant="ghost" 
      size="sm" 
      onClick={() => toggleTheme()}
      disabled={isAnimating}
      className="relative overflow-hidden"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}