
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import HomePage from './pages/HomePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import './App.css'

function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('task-manager-theme') === 'dark' ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('task-manager-theme', theme)
    } catch {
      // Keep the selected theme for this session if storage is unavailable.
    }
  }, [theme])

  return (
    <AuthProvider>
      <div className="site-layout">
        <div className="site-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  theme={theme}
                  onToggleTheme={() =>
                    setTheme((currentTheme) => currentTheme === 'light' ? 'dark' : 'light')
                  }
                />
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/tasks" element={<TasksPage />} />
            </Route>
          </Routes>
        </div>
        <SiteFooter />
      </div>
    </AuthProvider>
  )
}

export default App
