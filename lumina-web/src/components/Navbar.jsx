import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Início' },
    { path: '/services', icon: 'search', label: 'Serviços' },
    { path: '/profile', icon: 'person', label: 'Perfil' },
  ];

  const icons = {
    home: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    search: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    person: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.icon}`}
          >
            <span className="navbar-icon">{icons[item.icon]}</span>
            <span className="navbar-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
