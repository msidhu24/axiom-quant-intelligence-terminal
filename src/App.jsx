import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MacroMarquee from './components/MacroMarquee';
import StockAnalyzer from './components/StockAnalyzer';
import ETFScanner from './components/ETFScanner';
import PortfolioTab from './components/PortfolioTab';
import LexiconTab from './components/LexiconTab';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pulse':
        return <StockAnalyzer />;
      case 'etf':
        return <ETFScanner />;
      case 'portfolio':
        return <PortfolioTab />;
      case 'lexicon':
        return <LexiconTab />;
      default:
        return <Dashboard />;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pulse', label: 'Equity Pulse' },
    { id: 'etf', label: 'ETF Architect' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'lexicon', label: 'Axiom Lexicon' }
  ];

  return (
    <div className="app-container">
      <div className="sidebar">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="main-content">
        <MacroMarquee />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
