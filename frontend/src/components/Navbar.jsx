import React, { useState } from 'react'
import { FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa'

export default function Navbar({ onMenuClick, onLogout, username, role }){
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  return (
    <div className="navbar-agro py-2 px-3 d-flex align-items-center justify-content-between">
      <button className="btn btn-link text-dark d-lg-none" onClick={onMenuClick}><FaBars size={20}/></button>
      <div className="fw-semibold agro-accent">Smart Agro-Retail Inventory</div>
      <div className="dropdown">
        <button 
          className="btn btn-link text-dark dropdown-toggle d-flex align-items-center" 
          type="button" 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <FaUser className="me-2" size={16} />
          <span className="d-none d-sm-inline">{role === 'admin' ? 'Administrator' : 'User'}</span>
        </button>
        {dropdownOpen && (
          <ul className="dropdown-menu dropdown-menu-end show" style={{position: 'absolute', right: 0, top: '100%'}}>
            <li><button className="dropdown-item" onClick={onLogout}><FaSignOutAlt className="me-2"/>Logout</button></li>
          </ul>
        )}
      </div>
    </div>
  )
}
