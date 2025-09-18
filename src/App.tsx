import '@/styles/App.css'
import { Outlet } from 'react-router-dom'
import { ModeToggle } from '@/components/layout/mode-toggle'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container flex items-center justify-end py-4">
        <ModeToggle />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default App
