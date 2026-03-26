import React, { useMemo, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Billing from './pages/Billing'
import Inventory from './pages/Inventory'
import Analysis from './pages/Analysis'

function useAuth(){
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const login = (t) => { localStorage.setItem('token', t); setToken(t) }
  const logout = () => { localStorage.removeItem('token'); setToken(null) }
  return { token, login, logout }
}

function Protected({ children }){
  const authed = !!localStorage.getItem('token')
  const loc = useLocation()
  if (!authed) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}

export default function App(){
  const { token, logout, login } = useAuth()
  const isAuthed = !!token
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen(v => !v)
  const layout = useMemo(() => (
    <div className="d-flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-grow-1 content-shift">
        <Navbar onMenuClick={toggleSidebar} onLogout={logout} />
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/products" element={<Protected><Products /></Protected>} />
            <Route path="/billing" element={<Protected><Billing /></Protected>} />
            <Route path="/inventory" element={<Protected><Inventory /></Protected>} />
            <Route path="/analysis" element={<Protected><Analysis /></Protected>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  ), [sidebarOpen])
  return (
    <Routes>
      <Route path="/login" element={<Login onSuccess={() => login('demo-token')} />} />
      <Route path="/*" element={isAuthed ? layout : <Navigate to="/login" replace />} />
    </Routes>
  )
}
