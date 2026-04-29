import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { getCorrelationMatrix } from '../services/api';

const PortfolioTab = () => {
  const { assets, removeAsset, totalValue, setTotalValue } = usePortfolio();
  const [smartSize, setSmartSize] = useState(false);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assets.length >= 2) {
      setLoading(true);
      const tickers = assets.map(a => a.ticker);
      getCorrelationMatrix(tickers)
        .then(res => setMatrix(res.matrix || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setMatrix([]);
    }
  }, [assets]);

  const computeKelly = (score) => {
    // p = win prob, q = 1-p. Kelly = p - (q/1)
    const p = score / 100;
    const q = 1 - p;
    let k = p - q;
    k = Math.max(0, k); // no shorting
    return k * 0.5; // Half-kelly for safety
  };

  const getHeatmapColor = (corr) => {
    if (corr >= 0.8) return '#FF1744';
    if (corr >= 0.5) return '#FF9500';
    if (corr <= -0.5) return '#00C853';
    return 'rgba(255,255,255,0.1)';
  };

  const calculatePortfolioHealth = () => {
    if (assets.length === 0) return 0;
    
    // Base score is the average Alpha Score
    const avgAlpha = assets.reduce((sum, a) => sum + a.alpha_score, 0) / assets.length;
    
    // Penalty for high correlation (r > 0.8)
    let penalty = 0;
    if (matrix.length > 0) {
        matrix.forEach(pair => {
            if (pair.asset1 !== pair.asset2 && pair.correlation > 0.8) {
                penalty += 2; // Subtract 2 points per high-correlation pair
            }
        });
        // Matrix contains duplicate pairs (A-B and B-A), so divide penalty by 2
        penalty = penalty / 2;
    }
    
    return Math.max(0, Math.round(avgAlpha - penalty));
  };

  const healthScore = calculatePortfolioHealth();
  const healthColor = healthScore >= 65 ? '#00C853' : (healthScore >= 45 ? '#FF9500' : '#FF1744');

  if (assets.length === 0) {
    return <div style={{ padding: '24px' }}><h3>Portfolio is empty. Analyze an asset to add it.</h3></div>;
  }

  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
            <h1 style={{ margin: '0 0 8px', fontSize: '32px' }}>Axiom Portfolio</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Portfolio Health Score:</span>
                <span style={{ fontWeight: 'bold', fontSize: '20px', color: healthColor }}>{healthScore}/100</span>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Total Value: </span>
            <input 
              type="number" 
              value={totalValue} 
              onChange={e => setTotalValue(Number(e.target.value))}
              style={{ background: 'transparent', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px' }}
            />
          </div>
          <button 
            className={smartSize ? "btn-primary" : "btn-secondary"} 
            onClick={() => setSmartSize(!smartSize)}
          >
            {smartSize ? 'Smart Size: ON' : 'Smart Size: OFF'}
          </button>
        </div>
      </div>

      <div className="portfolio-grid">
        {assets.map((asset, i) => {
          const kelly = computeKelly(asset.alpha_score);
          const recDollars = totalValue * kelly;
          
          return (
            <div key={i} className="glass-panel" style={{ position: 'relative' }}>
              <button 
                onClick={() => removeAsset(asset.ticker)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: '#FF1744', cursor: 'pointer' }}
              >
                ✕
              </button>
              <h3 style={{ margin: '0 0 4px' }}>{asset.ticker}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px', fontSize: '14px' }}>{asset.name}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)' }}>Alpha Score</p>
                  <span style={{ color: asset.rating_color || '#0A84FF', fontSize: '24px', fontWeight: 'bold' }}>
                    {asset.alpha_score}
                  </span>
                </div>
                
                {smartSize && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--accent-color)' }}>Recommended Size</p>
                    <span style={{ fontSize: '18px', fontWeight: '600' }}>
                      ${recDollars.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {assets.length >= 2 && (
        <div style={{ marginTop: '48px' }}>
          <h3>Risk Map (Pearson Correlation)</h3>
          {loading ? <p>Computing matrix...</p> : (
            <div className="glass-panel" style={{ marginTop: '16px', overflowX: 'auto' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: `100px repeat(${assets.length}, 80px)`,
                gap: '2px' 
              }}>
                <div />
                {assets.map(a => <div key={`h-${a.ticker}`} style={{ textAlign: 'center', fontWeight: 'bold' }}>{a.ticker}</div>)}
                
                {assets.map(rowAsset => (
                  <React.Fragment key={`r-${rowAsset.ticker}`}>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>{rowAsset.ticker}</div>
                    {assets.map(colAsset => {
                      const pair = matrix.find(m => m.asset1 === colAsset.ticker && m.asset2 === rowAsset.ticker);
                      const val = pair ? pair.correlation : (rowAsset.ticker === colAsset.ticker ? 1 : 0);
                      return (
                        <div key={`${rowAsset.ticker}-${colAsset.ticker}`} style={{
                          background: getHeatmapColor(val),
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          color: Math.abs(val) > 0.5 ? '#fff' : 'var(--text-secondary)'
                        }}>
                          {val.toFixed(2)}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioTab;
