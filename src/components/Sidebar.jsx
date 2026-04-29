import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pulse', label: 'Equity Pulse' },
    { id: 'etf', label: 'ETF Architect' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'lexicon', label: 'Axiom Lexicon' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        Axiom
      </div>
      <div className="sidebar-nav">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
