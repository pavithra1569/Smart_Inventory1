import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { FaSeedling, FaBoxes, FaCashRegister, FaChartLine, FaSignOutAlt, FaWarehouse } from 'react-icons/fa'

export default function Sidebar({ open, onClose, role, username }){
  const loc = useLocation()
  const nav = useNavigate()
  const handleLogout = (e) => {
    e.preventDefault()
    localStorage.removeItem('token')
    onClose?.()
    nav('/login', { replace: true })
  }
  return (
    <aside className={`sidebar p-3 ${open ? 'open' : ''}`}>
      <div className="d-flex align-items-center mb-4">
        <div className="me-2 rounded-circle agro-bg d-flex align-items-center justify-content-center" style={{width:40,height:40}}>
          <FaSeedling />
        </div>
        <div>
          <div className="fw-bold">Smart Agro</div>
          <div className="small">Retail System</div>
        </div>
      </div>
      <nav className="nav flex-column gap-1">
        {role === 'admin' && <NavLink className={({isActive})=>`nav-link px-3 py-2 ${isActive?'active':''}`} to="/dashboard" onClick={onClose}><FaChartLine className="me-2"/>Dashboard</NavLink>}
        <NavLink className={({isActive})=>`nav-link px-3 py-2 ${isActive?'active':''}`} to="/products" onClick={onClose}><FaBoxes className="me-2"/>Products</NavLink>
        <NavLink className={({isActive})=>`nav-link px-3 py-2 ${isActive?'active':''}`} to="/billing" onClick={onClose}><FaCashRegister className="me-2"/>Billing</NavLink>
        <NavLink className={({isActive})=>`nav-link px-3 py-2 ${isActive?'active':''}`} to="/inventory" onClick={onClose}><FaWarehouse className="me-2"/>Inventory</NavLink>
        {role === 'admin' && <NavLink className={({isActive})=>`nav-link px-3 py-2 ${isActive?'active':''}`} to="/analysis" onClick={onClose}><FaChartLine className="me-2"/>Analysis</NavLink>}
        <a className={`nav-link px-3 py-2 ${loc.pathname==='/login'?'active':''}`} href="/login" onClick={handleLogout}><FaSignOutAlt className="me-2"/>Logout</a>
      </nav>
    </aside>
  )
}
