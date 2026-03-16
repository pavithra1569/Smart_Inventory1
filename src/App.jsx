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
  const [role, setRole] = useState(() => localStorage.getItem('role'))
  const [username, setUsername] = useState(() => localStorage.getItem('username'))
  const login = (t, r, u) => { setToken(t); setRole(r); setUsername(u) }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username'); setToken(null); setRole(null); setUsername(null) }
  return { token, role, username, login, logout }
}

function Protected({ children }){
  const authed = !!localStorage.getItem('token')
  const loc = useLocation()
  if (!authed) return <Navigate to="/login" replace state={{ from: loc }} />
  return children
}

export default function App(){
  const { token, role, username, logout, login } = useAuth()
  const isAuthed = !!token
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => setSidebarOpen(v => !v)
  const defaultPath = role === 'admin' ? '/dashboard' : '/products'
  const layout = useMemo(() => (
    <div className="d-flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} username={username} />
      <div className="flex-grow-1 content-shift">
        <Navbar onMenuClick={toggleSidebar} onLogout={logout} username={username} role={role} />
        <div className="container py-4">
          <Routes>
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
            {role === 'admin' && <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />}
            <Route path="/products" element={<Protected><Products /></Protected>} />
            <Route path="/billing" element={<Protected><Billing /></Protected>} />
            <Route path="/inventory" element={<Protected><Inventory /></Protected>} />
            {role === 'admin' && <Route path="/analysis" element={<Protected><Analysis /></Protected>} />}
            <Route path="*" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  ), [sidebarOpen, role])
  return (
    <Routes>
      <Route path="/login" element={<Login onSuccess={(token, role, username) => login(token, role, username)} />} />
      <Route path="/*" element={isAuthed ? layout : <Navigate to="/login" replace />} />
    </Routes>
  )
}
