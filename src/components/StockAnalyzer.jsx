import React, { useState } from 'react';
import { analyzeStock } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';

const StockAnalyzer = () => {
  const [ticker, setTicker] = useState('AAPL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Adjustable Parameters
  const [showSettings, setShowSettings] = useState(false);
  const [wacc, setWacc] = useState(0.08);
  const [growth, setGrowth] = useState(0.025);
  const [weightDcf, setWeightDcf] = useState(0.55);
  const [weightSent, setWeightSent] = useState(0.30);
  const [weightMom, setWeightMom] = useState(0.15);
  const [weightNews, setWeightNews] = useState(0.50);

  const { assets, addAsset } = usePortfolio();

  const handleAnalyze = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeStock(ticker, {
        wacc: wacc,
        perpetual_growth: growth,
        weight_dcf: weightDcf,
        weight_sent: weightSent,
        weight_mom: weightMom,
        weight_news: weightNews
      });
      setData(res);
    } catch (e) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const isAdded = data && assets.some(a => a.ticker === data.ticker);

  const handleAdd = () => {
    if (data && !isAdded) {
      addAsset({
        ticker: data.ticker,
        name: data.company_name,
        alpha_score: data.alpha_score,
        rating_color: data.rating_color,
        is_whale: data.insider && data.insider.apply_alpha_multiplier
      });
    }
  };

  return (
    <div className="stock-analyzer-layout" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="left-panel" style={{ overflowY: 'auto', paddingBottom: '100px', height: '100%', paddingRight: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="search-box" style={{ margin: 0, flex: 1, marginRight: '12px' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Enter Ticker (e.g. NVDA)" 
              value={ticker}
              onChange={e => setTicker(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
              {loading ? '...' : 'Synthesize'}
            </button>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255,255,255,0.05)',
              border: showSettings ? '1px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              padding: '12px 16px',
              borderRadius: '24px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            ⚙️ Parameters
          </button>
        </div>

        {showSettings && (
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--accent-color)' }}>Engine Calibration</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>Valuation (DCF)</h4>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Discount Rate (WACC)</span>
                    <span>{(wacc * 100).toFixed(1)}%</span>
                  </div>
                  <input type="range" min="0.05" max="0.15" step="0.005" value={wacc} onChange={e => setWacc(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Terminal Growth Rate</span>
                    <span>{(growth * 100).toFixed(1)}%</span>
                  </div>
                  <input type="range" min="0.0" max="0.05" step="0.005" value={growth} onChange={e => setGrowth(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>Alpha Weights</h4>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>DCF (Fundamentals)</span>
                    <span>{Math.round(weightDcf * 100)}%</span>
                  </div>
                  <input type="range" min="0.0" max="1.0" step="0.05" value={weightDcf} onChange={e => setWeightDcf(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Sentiment (NLP)</span>
                    <span>{Math.round(weightSent * 100)}%</span>
                  </div>
                  <input type="range" min="0.0" max="1.0" step="0.05" value={weightSent} onChange={e => setWeightSent(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Momentum (Price Action)</span>
                    <span>{Math.round(weightMom * 100)}%</span>
                  </div>
                  <input type="range" min="0.0" max="1.0" step="0.05" value={weightMom} onChange={e => setWeightMom(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>

                <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)' }}>Source Weighting (NLP)</h4>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>News vs Social</span>
                    <span>{Math.round(weightNews * 100)}% News / {Math.round((1 - weightNews) * 100)}% Social</span>
                  </div>
                  <input type="range" min="0.0" max="1.0" step="0.05" value={weightNews} onChange={e => setWeightNews(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Adjust parameters and click Synthesize to recalculate Intrinsic Value and Alpha Score dynamically.
            </div>
          </div>
        )}

        {error && <p style={{ color: '#FF1744' }}>{error}</p>}

        {data && (
          <>
            <div className="glass-panel" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 8px' }}>{data.company_name} ({data.ticker})</h2>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '48px', fontWeight: 'bold', color: data.rating_color }}>
                      {data.alpha_score}
                    </span>
                    <span style={{ fontSize: '24px', color: data.rating_color }}>{data.rating_arrow}</span>
                  </div>
                </div>
                <button 
                  className={isAdded ? "btn-secondary" : "btn-primary"} 
                  onClick={handleAdd}
                  disabled={isAdded}
                >
                  {isAdded ? '✓ Added' : '+ Add'}
                </button>
              </div>

              {data.insider && data.insider.apply_alpha_multiplier && (
                <div style={{ marginTop: '16px', background: 'rgba(10, 132, 255, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid var(--accent-color)' }}>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>🐳</span>
                  <strong style={{ color: 'var(--accent-color)' }}>Whale Watch Triggered:</strong>
                  <span style={{ marginLeft: '8px' }}>{data.insider.message}</span>
                </div>
              )}
            </div>

            <div className="signal-grid" style={{ marginBottom: '24px' }}>
              <div className="glass-panel">
                <h3>Fundamentals (DCF)</h3>
                <p>Intrinsic Value: ${data.dcf.intrinsic_value}</p>
                <p>Upside: {data.dcf.upside_pct}%</p>
                <p>Score Contribution: {data.components.dcf_score}</p>
              </div>
              <div className="glass-panel">
                <h3>Sentiment & Momentum</h3>
                <p>Compound NLP: {data.sentiment.compound_score}</p>
                <p>Momentum (5D): {data.sentiment.prediction?.momentum_5d}%</p>
                <p>Score Contribution: {data.components.sentiment_score}</p>
              </div>
            </div>
            
            {data.sensitivity_matrix && data.sensitivity_matrix.length > 0 && (
                <div className="glass-panel" style={{ marginBottom: '24px' }}>
                    <h3>Shadow Price Sensitivity</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
                        {data.sensitivity_matrix.map((cell, i) => (
                            <div key={i} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>W: {cell.wacc}% | G: {cell.growth}%</div>
                                <div style={{ fontWeight: 'bold', color: cell.upside_pct > 0 ? '#00C853' : '#FF1744' }}>${cell.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}
      </div>

      <div className="right-panel glass-panel" style={{ overflowY: 'auto', height: '100%', position: 'relative' }}>
        <h3 style={{ position: 'sticky', top: '-24px', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', margin: '-24px -24px 16px', padding: '24px 24px 16px', zIndex: 10 }}>
            Impact 15 (Narrative)
        </h3>
        {data && data.narrative && data.narrative.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '100px' }}>
            {data.narrative.map((item, i) => (
              <div key={i} className="narrative-item" style={{ padding: 0, border: 'none' }}>
                <a href={item.link} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>
                  {item.title}
                </a>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {item.source} • {item.date}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginTop: '24px' }}>Synthesize an asset to view narrative feed.</p>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;
