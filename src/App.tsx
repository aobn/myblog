/**
 * 博客应用主组件
 * 
 * @author CodeBuddy
 * @date 2025-09-18
 */

import '@/styles/App.css'
import { Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="blog-ui-theme">
      <div className="min-h-screen">
        <Outlet />
      </div>
    </ThemeProvider>
  )
}

export default App
