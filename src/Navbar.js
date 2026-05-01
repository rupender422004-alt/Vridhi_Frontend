import React, { useState } from 'react';
import './Navbar.css';
import logoImg from './Vridhi_logo.png'; 

function Navbar({ user, onLogout, toggleTheme, isDarkMode, setActiveTab, activeTab, toggleSidebar }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="main-navbar">
      <div className="nav-left">
        {/* 🔥 Yahan Menu button add kiya */}
        <button className="nav-menu-toggle" onClick={toggleSidebar} title="Toggle Sidebar">
          ☰
        </button>
        
        <div className="nav-logo" onClick={() => setActiveTab('new')}>
          <img src={logoImg} alt="Vridhi Logo" className="nav-logo-icon" />
        </div>
        
        <div className="nav-links">
          <a href="#products">Products</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>
      </div>

      <div className="nav-right">
        <button className="nav-theme-btn" onClick={toggleTheme}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>

        <div className="nav-profile-container" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="nav-profile">
            <div className="nav-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="nav-username">{user?.name || 'User'}</span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-name">{user?.name || 'User'}</p>
                <p className="dropdown-email">{user?.email || 'user@example.com'}</p>
              </div>
              <button className="dropdown-logout-btn" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;