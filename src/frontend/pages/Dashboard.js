import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeNodes: 0,
    pendingTasks: 0,
    completedTasks: 0,
    systemHealth: 'Good'
  });

  // Simulate fetching data
  useEffect(() => {
    // This would be replaced with actual API calls
    const mockData = {
      activeNodes: 24,
      pendingTasks: 15,
      completedTasks: 138,
      systemHealth: 'Excellent'
    };
    
    setTimeout(() => {
      setStats(mockData);
    }, 1000);
  }, []);

  return (
    <div className="dashboard-container">
      <Header />
      <main className="dashboard-content">
        <h1>QuantumFluxAI Dashboard</h1>
        
        <div className="stats-overview">
          <div className="stat-card">
            <h3>Active Nodes</h3>
            <p className="stat-value">{stats.activeNodes}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Tasks</h3>
            <p className="stat-value">{stats.pendingTasks}</p>
          </div>
          <div className="stat-card">
            <h3>Completed Tasks</h3>
            <p className="stat-value">{stats.completedTasks}</p>
          </div>
          <div className="stat-card">
            <h3>System Health</h3>
            <p className="stat-value">{stats.systemHealth}</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-log">
            <p>No recent activities to display.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard; 