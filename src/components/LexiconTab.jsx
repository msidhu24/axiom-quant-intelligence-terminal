import React from 'react';

const LexiconTab = () => {
  const definitions = [
    {
      term: "Axiom Alpha Score",
      def: "A proprietary 0-100 score blending DCF Intrinsic Upside (55%), NLP Sentiment (30%), and Momentum (15%)."
    },
    {
      term: "Whale Watch",
      def: "Detects Form 4 SEC cluster buying. If 3+ insiders buy within 30 days, it applies a 1.15x multiplier to the Alpha Score."
    },
    {
      term: "Smart Size (Kelly Criterion)",
      def: "Calculates optimal position sizing based on Win Probability (derived from the Alpha Score) to maximize geometric growth."
    },
    {
      term: "Risk Map",
      def: "A Pearson correlation heatmap over 180 days. Highlights pairs with r > 0.8 in red to warn against overlapping risk."
    },
    {
      term: "Volatility Playbook",
      def: "Scans the next 14 days for earnings dates across the top 20 institutional tickers and calculates implied volatility to alert for macro shocks."
    },
    {
      term: "ETF Architect",
      def: "Recursively deconstructs the top 20 holdings of an ETF, scoring each individual equity, to compute the true weighted Alpha Score of the fund."
    },
    {
      term: "Shadow Price Sensitivity",
      def: "A 3x3 matrix showing how the intrinsic value fluctuates given ±1% changes in WACC and ±0.5% changes in the perpetual growth rate."
    },
    {
      term: "Narrative Feed (Impact 15)",
      def: "Scrapes the top financial news and assesses if the current narrative justifies the alpha gap."
    },
    { term: 'Value Gap', def: 'A divergence where the calculated Intrinsic Value exceeds the current market price, while social/news sentiment remains neutral or bearish. Formula: (DCF > Price) ∩ (Sentiment ≈ Neutral).' },
    { term: 'Contrarian Buy', def: 'An extreme form of the Value Gap. DCF upside is significant (>20%), but current market sentiment is extremely bearish, indicating the market has overreacted to short-term news. Formula: (DCF_Upside > 20%) ∩ (Sentiment = Bearish).' },
    { term: 'Sentiment Surge', def: 'A rapid, anomalous spike in bullish sentiment (>30% velocity within 1 hour) while the underlying asset price remains relatively static, often preceding a breakout. Formula: (ΔSentiment > +30% in 1hr) ∩ (ΔPrice ≈ 0).' },
    { term: 'ETF Front-run', def: 'A statistical dislocation where the aggregate DCF valuation of an ETF\'s underlying constituents implies a higher NAV than the ETF is currently trading at. Formula: ∑(Underlying_DCF) > ETF_Price.' },
    { term: 'Insider Alignment', def: 'A structural confirmation signal where the DCF model indicates the asset is undervalued, and it is simultaneously corroborated by "Cluster Buying" (3+ insiders buying within 30 days via SEC Form 4). Formula: (DCF > Price) ∩ (Form 4 Cluster Buying).' }
  ];

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Axiom Lexicon</h2>
      <div className="lexicon-grid">
        {definitions.map((d, i) => (
          <div key={i} className="glass-panel">
            <h3 style={{ color: 'var(--accent-color)' }}>{d.term}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{d.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LexiconTab;
