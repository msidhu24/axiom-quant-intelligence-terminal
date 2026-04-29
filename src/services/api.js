const API_BASE = "http://127.0.0.1:8001/api";

export const analyzeStock = async (ticker, params = {}) => {
    let url = `${API_BASE}/analyze/stock?ticker=${ticker}`;
    if (params.wacc !== undefined) url += `&wacc=${params.wacc}`;
    if (params.perpetual_growth !== undefined) url += `&perpetual_growth=${params.perpetual_growth}`;
    if (params.weight_dcf !== undefined) url += `&weight_dcf=${params.weight_dcf}`;
    if (params.weight_sent !== undefined) url += `&weight_sent=${params.weight_sent}`;
    if (params.weight_mom !== undefined) url += `&weight_mom=${params.weight_mom}`;
    if (params.weight_news !== undefined) url += `&weight_news=${params.weight_news}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to analyze stock");
    return res.json();
};

export const analyzeETF = async (ticker) => {
    const res = await fetch(`${API_BASE}/analyze/etf?ticker=${ticker}`);
    if (!res.ok) throw new Error("Failed to analyze ETF");
    return res.json();
};

export const getEarnings = async () => {
    const res = await fetch(`${API_BASE}/analyze/earnings`);
    if (!res.ok) throw new Error("Failed to fetch earnings");
    return res.json();
};

export const getConvictionList = async () => {
    const res = await fetch(`${API_BASE}/analyze/conviction`);
    if (!res.ok) throw new Error("Failed to fetch conviction list");
    return res.json();
};

export const getCorrelationMatrix = async (tickers) => {
    const res = await fetch(`${API_BASE}/analyze/correlation?tickers=${tickers.join(',')}`);
    if (!res.ok) throw new Error("Failed to compute correlation");
    return res.json();
};

export const getNews = async (ticker) => {
    const res = await fetch(`${API_BASE}/analyze/news?ticker=${ticker}`);
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
};
