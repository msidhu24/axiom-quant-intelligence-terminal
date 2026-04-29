import React, { useState } from 'react';
import { analyzeETF, getNews } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';

const ETFScanner = () => {
  const [ticker, setTicker] = useState('SPY');
  const [data, setData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { assets, addAsset } = usePortfolio();

  const handleAnalyze = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const [res, newsRes] = await Promise.all([
        analyzeETF(ticker),
        getNews(ticker)
      ]);
      setData(res);
      setNews(newsRes.narrative || []);
    } catch (e) {
      setError("Failed to fetch ETF data.");
    } finally {
      setLoading(false);
    }
  };

  const isAdded = data && assets.some(a => a.ticker === data.etf_ticker);

  const handleAdd = () => {
    if (data && !isAdded) {
      addAsset({
        ticker: data.etf_ticker,
        name: data.etf_ticker + " ETF",
        alpha_score: data.etf_score,
        rating_color: data.etf_score >= 65 ? '#00C853' : (data.etf_score >= 45 ? '#FF9500' : '#FF1744')
      });
    }
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <div className="search-box" style={{ maxWidth: '600px', marginBottom: '24px' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Enter ETF Ticker (e.g. SPY, QQQ)" 
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
        />
        <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Deconstructing...' : 'Deconstruct ETF'}
        </button>
      </div>

      {error && <p style={{ color: '#FF1744' }}>{error}</p>}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 350px', gap: '24px', alignItems: 'start' }}>
          {/* Left: ETF Overview */}
          <div className="glass-panel">
            <h2>{data.etf_ticker}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Weighted Alpha Score</p>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '16px 0' }}>
              {data.etf_score}
            </div>
            <button 
              className={isAdded ? "btn-secondary" : "btn-primary"} 
              onClick={handleAdd}
              disabled={isAdded}
              style={{ width: '100%' }}
            >
              {isAdded ? '✓ Added to Portfolio' : '+ Add to Portfolio'}
            </button>
          </div>

          {/* Center: ETF Holdings */}
          <div className="glass-panel">
            <h3>Top {data.holdings_count} Holdings</h3>
            <div className="etf-holdings-list">
              {data.holdings.map((h, i) => {
                const isHoldingAdded = assets.some(a => a.ticker === h.ticker);
                return (
                  <div key={i} className="etf-holding-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{h.ticker}</strong> <span style={{ color: 'var(--text-secondary)', fontSize: '12px', marginLeft: '8px' }}>{h.name}</span>
                    </div>
                    <div style={{ width: '60px', textAlign: 'right', fontSize: '12px' }}>{h.weight}%</div>
                    <div style={{ width: '80px', textAlign: 'right', fontWeight: 'bold', color: h.rating_color }}>
                      {h.alpha_score} ({h.rating})
                    </div>
                    <button 
                      onClick={() => !isHoldingAdded && addAsset({
                        ticker: h.ticker, 
                        name: h.name, 
                        alpha_score: h.alpha_score, 
                        rating_color: h.rating_color
                      })}
                      disabled={isHoldingAdded}
                      style={{ 
                        marginLeft: '16px', 
                        background: 'transparent', 
                        border: '1px solid var(--border-color)', 
                        color: isHoldingAdded ? 'var(--text-secondary)' : 'white', 
                        borderRadius: '4px', 
                        cursor: isHoldingAdded ? 'default' : 'pointer',
                        padding: '2px 8px'
                      }}
                    >
                      {isHoldingAdded ? '✓' : '+'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: ETF Narrative Feed */}
          <div className="glass-panel" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
            <h3 style={{ position: 'sticky', top: 0, background: 'var(--panel-bg)', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', margin: '-24px -24px 16px', padding: '24px 24px 16px', zIndex: 10 }}>
                Impact 15 (ETF Narrative)
            </h3>
            {news && news.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {news.map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '500', fontSize: '14px', lineHeight: '1.4' }}>
                        {item.title}
                        </a>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span>{item.source}</span>
                        <span>{item.date}</span>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Scanning macro narrative...</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ETFScanner;
