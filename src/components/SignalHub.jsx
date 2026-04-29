import React, { useState, useEffect } from 'react';
import { getEarnings } from '../services/api';

const SignalHub = () => {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEarnings()
      .then(res => setEarnings(res.earnings_upcoming || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <h2>Volatility Playbook</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Tracking earnings within the next 14 days for the top 20 institutional tickers.
        </p>

        {loading ? (
          <p>Scanning upcoming earnings...</p>
        ) : (
          <div className="volatility-calendar">
            {earnings.length === 0 ? (
              <p>No major earnings in the next 14 days.</p>
            ) : (
              earnings.map((e, i) => {
                // Determine heat based on days until earnings
                const heatLevel = e.days_until <= 3 ? '#FF1744' : (e.days_until <= 7 ? '#FF9500' : 'rgba(255,255,255,0.05)');
                
                return (
                  <div key={i} className="volatility-item" style={{ borderLeft: `4px solid ${heatLevel}` }}>
                    <div style={{ flex: 1 }}>
                      <strong>{e.ticker}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{e.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold' }}>{e.days_until} Days</div>
                      <div style={{ fontSize: '12px', color: 'var(--accent-color)' }}>IV: {e.implied_volatility}%</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalHub;
