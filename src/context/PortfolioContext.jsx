import React, { createContext, useContext, useState, useEffect } from 'react';

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [totalValue, setTotalValue] = useState(100000);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('axiom_portfolio');
      if (saved) {
        let parsed = JSON.parse(saved);
        // Schema validation: purge any assets that don't have a name
        parsed = parsed.filter(a => a.ticker && a.name);
        setAssets(parsed);
      }
    } catch (e) {
      console.error("Failed to load portfolio", e);
    }
  }, []);

  // Save to local storage whenever assets change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('axiom_portfolio', JSON.stringify(assets));
    }
  }, [assets]);

  const addAsset = (asset) => {
    // Prevent duplicates
    if (assets.some(a => a.ticker === asset.ticker)) return;
    
    // Ensure name is set
    const finalAsset = {
        ...asset,
        name: asset.name || asset.company_name || asset.ticker
    };
    
    setAssets(prev => [...prev, finalAsset]);
  };

  const removeAsset = (ticker) => {
    setAssets(prev => prev.filter(a => a.ticker !== ticker));
    if (assets.length === 1) {
        localStorage.removeItem('axiom_portfolio');
    }
  };

  return (
    <PortfolioContext.Provider value={{ assets, addAsset, removeAsset, totalValue, setTotalValue }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => useContext(PortfolioContext);
