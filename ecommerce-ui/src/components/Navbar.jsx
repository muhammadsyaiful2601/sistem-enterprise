// src/components/Navbar.jsx
// Menu navigasi dan pemilih user. Belum ada login, jadi user dipilih manual.

import { NavLink } from 'react-router-dom'

const USERS = [1, 2, 3, 4, 5]

export default function Navbar({ userId, onUserChange }) {
  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Navigasi utama">
        <NavLink className="brand" to="/" end>
          <span className="brand-mark" aria-hidden="true">T</span>
          Toko Online
        </NavLink>
        <div className="nav-actions">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} to="/" end>Jelajahi</NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} to="/cart">
            <svg className="nav-cart-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 1.9-1.4L21 9H6" />
              <circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" />
            </svg>
            Keranjang
          </NavLink>
          <label className="user-select">
            <span className="user-avatar" aria-hidden="true">U</span>
            <span className="sr-only">Pilih user</span>
            <select value={userId} aria-label="Pilih user" onChange={(e) => onUserChange(Number(e.target.value))}>
              {USERS.map((id) => <option key={id} value={id}>User {id}</option>)}
            </select>
          </label>
        </div>
      </nav>
    </header>
  )
}