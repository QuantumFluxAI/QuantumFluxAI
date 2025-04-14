import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-container">
        <img src="/logo.svg" alt="QuantumFluxAI Logo" className="logo" />
        <h1>QuantumFluxAI</h1>
      </div>
      <nav className="main-nav">
        <ul>
          <li><a href="/">Dashboard</a></li>
          <li><a href="/nodes">Nodes</a></li>
          <li><a href="/tasks">Tasks</a></li>
          <li><a href="/analytics">Analytics</a></li>
        </ul>
      </nav>
      <div className="user-controls">
        <button className="profile-btn">Profile</button>
        <button className="settings-btn">Settings</button>
      </div>
    </header>
  );
};

export default Header; 