import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>QuantumFluxAI</h3>
          <p>Distributed computing platform for AI workloads</p>
        </div>
        <div className="footer-section">
          <h3>Links</h3>
          <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: info@quantumfluxai.com</p>
          <p>GitHub: github.com/QuantumFluxAI</p>
        </div>
      </div>
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} QuantumFluxAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 