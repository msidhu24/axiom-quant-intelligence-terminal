import React from 'react';

const MacroMarquee = () => {
  // Static mock for the marquee. In a production app, this would connect to a websocket.
  const data = [
    { symbol: 'SPY', price: 512.45, change: '+1.2%', color: '#00C853' },
    { symbol: 'QQQ', price: 445.12, change: '+1.5%', color: '#00C853' },
    { symbol: 'VIX', price: 13.40, change: '-4.2%', color: '#FF1744' },
    { symbol: 'DXY', price: 104.20, change: '+0.1%', color: '#FF9500' },
    { symbol: '10Y YIELD', price: 4.25, change: '+0.05', color: '#FF9500' },
    { symbol: 'BTC', price: 68420, change: '+5.4%', color: '#00C853' }
  ];

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {[...data, ...data].map((item, idx) => (
          <div key={idx} className="marquee-item">
            <span style={{ color: 'var(--text-secondary)' }}>{item.symbol}</span>
            <span>{item.price}</span>
            <span style={{ color: item.color }}>{item.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MacroMarquee;
