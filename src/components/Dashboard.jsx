import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, TrendingUp, AlertTriangle, Activity, Briefcase, Zap } from 'lucide-react';
import { getEarnings, getConvictionList } from '../services/api';

const CircularProgress = ({ score }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = '#FF9500'; // Amber (Caution)
  if (score >= 65) color = '#00C853'; // Green (Growth)
  if (score >= 80) color = '#0A84FF'; // Blue (Value/Strong)

  return (
    <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="44" height="44" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="22" cy="22" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
        <motion.circle 
          cx="22" cy="22" r={radius} 
          stroke={color} 
          strokeWidth="4" fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ position: 'absolute', fontSize: '12px', fontWeight: 'bold' }}>{score}</span>
    </div>
  );
};

const Dashboard = () => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loadingSignals, setLoadingSignals] = useState(true);

  useEffect(() => {
    getEarnings()
      .then(res => setEarnings(res.earnings_upcoming || []))
      .catch(console.error);

    getConvictionList()
      .then(res => {
        setSignals(res.signals || []);
        setLoadingSignals(false);
      })
      .catch(err => {
        console.error("Failed to fetch convictions", err);
        setLoadingSignals(false);
      });
  }, []);

  const getIconForType = (type) => {
    switch(type) {
      case 'Value Gap': return <Cpu size={24} color="#0A84FF"/>;
      case 'Contrarian Buy': return <Briefcase size={24} color="#00C853"/>;
      case 'Contrarian Sell': return <AlertTriangle size={24} color="#FF1744"/>;
      case 'Sentiment Surge': return <TrendingUp size={24} color="#FF9500"/>;
      case 'Momentum Buy': return <Activity size={24} color="#AC39FF"/>;
      case 'ETF Front-run': return <Activity size={24} color="#0A84FF"/>;
      case 'Insider Alignment': return <AlertTriangle size={24} color="#FF9500"/>;
      default: return <Activity size={24} color="#8E8E93"/>;
    }
  };

  const getPillColor = (type) => {
    switch(type) {
      case 'Value Gap': return 'rgba(10, 132, 255, 0.2)';
      case 'Contrarian Buy': return 'rgba(0, 200, 83, 0.2)';
      case 'Sentiment Surge': return 'rgba(255, 149, 0, 0.2)';
      case 'ETF Front-run': return 'rgba(172, 57, 255, 0.2)';
      case 'Insider Alignment': return 'rgba(255, 23, 68, 0.2)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const getPillBorder = (type) => {
    switch(type) {
      case 'Value Gap': return '1px solid #0A84FF';
      case 'Contrarian Buy': return '1px solid #00C853';
      case 'Sentiment Surge': return '1px solid #FF9500';
      case 'ETF Front-run': return '1px solid #AC39FF';
      case 'Insider Alignment': return '1px solid #FF1744';
      default: return '1px solid #fff';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '70% 30%', height: '100%' }}>
      
      {/* Left 70%: Divergence Radar */}
      <div style={{ padding: '32px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Axiom Signal Hub</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Institutional Synthesis: DCF + Sentiment + ETF Intelligence.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loadingSignals ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Scanning live market logic across tech universe...
            </div>
          ) : signals.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No strong conviction signals found today.
            </div>
          ) : signals.map((sig, idx) => (
            <motion.div 
              key={sig.id}
              className="glass-panel"
              style={{ cursor: 'pointer', padding: '16px 24px', display: 'flex', flexDirection: 'column' }}
              onClick={() => setExpandedRow(expandedRow === sig.id ? null : sig.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring" }}
              whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(10, 132, 255, 0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '200px' }}>
                  {getIconForType(sig.type)}
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {sig.ticker}
                      {sig.type === 'Insider Alignment' && <span title="Whale Watch Triggered">🐳</span>}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sig.name}</div>
                  </div>
                </div>
                
                <div style={{ width: '80px', display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress score={sig.score} />
                </div>
                
                <div style={{ width: '160px' }}>
                  <span style={{ 
                    background: getPillColor(sig.type), 
                    border: getPillBorder(sig.type),
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '12px', 
                    fontWeight: '600' 
                  }}>
                    {sig.type}
                  </span>
                </div>
                
                <div style={{ flex: 1, color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {sig.summary}
                </div>
              </div>

              {/* Shadow Price Slide-out */}
              <AnimatePresence>
                {expandedRow === sig.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ color: 'var(--accent-color)', marginBottom: '12px' }}>Shadow Price Sensitivity</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {/* Mock 3x3 Grid for demonstration, simulating ±1% Interest Rate / WACC changes */}
                        {[-1, 0, 1].map(waccShift => (
                          [-0.5, 0, 0.5].map(growthShift => {
                            // Rough simulation logic
                            const mockVal = 100 * (1 - (waccShift * 0.15) + (growthShift * 0.10));
                            const isBase = waccShift === 0 && growthShift === 0;
                            return (
                              <div key={`w${waccShift}-g${growthShift}`} style={{ 
                                background: isBase ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)', 
                                padding: '12px', 
                                borderRadius: '8px', 
                                textAlign: 'center',
                                border: isBase ? '1px solid var(--accent-color)' : '1px solid transparent'
                              }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  ΔWACC: {waccShift>0?'+':''}{waccShift}% | Δg: {growthShift>0?'+':''}{growthShift}%
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>
                                  ${mockVal.toFixed(2)}
                                </div>
                              </div>
                            )
                          })
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right 30%: Side Panel (Volatility Playbook) */}
      <div style={{ borderLeft: '1px solid var(--border-color)', background: 'rgba(5,5,5,0.7)', padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        <h3 style={{ margin: '0 0 24px', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#FF9500" />
            Volatility Playbook
        </h3>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Tracking upcoming earnings and implied volatility for institutional tickers to size positions effectively.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {earnings.map((e, i) => {
                // Heat calculation for gradient bar (Quiet = Blue -> Explosive = Purple/Red)
                const percent = Math.max(0, 100 - (e.days_until * 7));
                const gradient = `linear-gradient(90deg, #0A84FF 0%, #AC39FF ${percent}%, #FF1744 100%)`;

                return (
                    <div key={i} className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '16px' }}>{e.ticker}</strong>
                            <div style={{ textAlign: 'right' }}>
                                <div>{e.days_until === 0 ? 'Today' : `${e.days_until} Days`}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>IV: {e.implied_volatility}%</div>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ height: '100%', background: gradient }}
                            />
                        </div>
                    </div>
                );
            })}
            {earnings.length === 0 && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No near-term earnings detected in scan.</p>}
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
