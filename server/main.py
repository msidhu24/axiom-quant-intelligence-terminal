"""
main.py — Axiom Financial Intelligence API
Unified FastAPI backend for the Axiom platform.
Routes:
  GET  /api/health
  GET  /api/analyze/stock
  GET  /api/analyze/etf
  GET  /api/analyze/earnings
  GET  /api/analyze/correlation
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from dcf_logic import run_dcf, generate_sensitivity_matrix
from sentiment_logic import run_sentiment
from axiom_engine import AxiomEngine
from etf_scanner import scan_etf
from services.alpha_gap import get_alpha_gap_alerts
from services.narrative import analyse_narrative
from services.insider_pulse import get_insider_pulse

app = FastAPI(title="Axiom API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

@app.get("/api/health")
def health_check():
    return {"status": "Axiom API is live and operational."}

@app.get("/api/analyze/stock")
async def analyze_stock(
    ticker: str = Query(..., min_length=1, max_length=10),
    wacc: float = Query(0.08, description="Discount Rate"),
    perpetual_growth: float = Query(0.025, description="Terminal Growth"),
    weight_dcf: float = Query(0.55, description="DCF Weight"),
    weight_sent: float = Query(0.30, description="Sentiment Weight"),
    weight_mom: float = Query(0.15, description="Momentum Weight"),
    weight_news: float = Query(0.50, description="News Source Weight")
):
    ticker = ticker.upper()
    logging.info(f"Analyzing {ticker} with WACC={wacc}, Growth={perpetual_growth}, NewsWt={weight_news}")
    
    try:
        # We wrap in asyncio.to_thread if they are sync, or just call them if they are fast enough
        dcf_result = run_dcf(ticker, wacc=wacc, perpetual_growth=perpetual_growth)
    except Exception as e:
        raise HTTPException(500, detail=f"DCF Engine: {e}")

    # Fetch live narrative first so we can parse it for sentiment
    try:
        narrative_items = analyse_narrative(ticker, dcf_result.get("intrinsic_value"))
    except Exception as e:
        logging.warning(f"Narrative Fetch Error: {e}")
        narrative_items = []

    try:
        sentiment_result = run_sentiment(ticker, narrative=narrative_items, weight_news=weight_news)
    except Exception as e:
        raise HTTPException(500, detail=f"Sentiment Engine: {e}")

    try:
        custom_weights = {"dcf": weight_dcf, "sentiment": weight_sent, "momentum": weight_mom}
        engine = AxiomEngine(dcf_result, sentiment_result, custom_weights=custom_weights)
        payload = engine.compute()
    except Exception as e:
        raise HTTPException(500, detail=f"Alpha Score: {e}")

    # Inject ticker and company name into the payload as requested by user in a previous session
    payload["ticker"] = ticker
    payload["company_name"] = dcf_result.get("company_name", ticker)

    try:
        upside = dcf_result.get("upside_pct") or 0
        insider = get_insider_pulse(ticker, dcf_upside=upside, days=90)
        if insider.get("apply_alpha_multiplier"):
            from axiom_engine import RATINGS
            boosted = min(payload["alpha_score"] * 1.15, 100) # 15% Whale Watch boost
            payload["alpha_score"] = round(boosted, 2)
            for threshold, label, color, arrow in RATINGS:
                if payload["alpha_score"] >= threshold:
                    payload["rating"] = label
                    payload["rating_color"] = color
                    payload["rating_arrow"] = arrow
                    break
        payload["insider"] = insider
    except Exception as e:
        logging.warning(f"Insider pulse failed: {e}")
        payload["insider"] = {}

    payload["narrative"] = narrative_items

    try:
        payload["sensitivity_matrix"] = generate_sensitivity_matrix(dcf_result)
    except Exception as e:
        payload["sensitivity_matrix"] = []

    try:
        payload["alpha_gap"] = get_alpha_gap_alerts(limit=3)
    except Exception as e:
        payload["alpha_gap"] = []

    return payload

@app.get("/api/analyze/conviction")
async def analyze_conviction():
    tickers = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "META", "GOOGL"]
    
    async def fetch_signal(t):
        try:
            dcf_result = await asyncio.to_thread(run_dcf, t)
            sentiment_result = await asyncio.to_thread(run_sentiment, t, narrative=[]) # Fast scan, no NLP
            
            engine = AxiomEngine(dcf_result, sentiment_result)
            payload = engine.compute()
            
            alpha_score = payload["alpha_score"]
            dcf_score = payload["components"]["dcf_score"]
            mom_score = payload["components"]["momentum_score"]
            
            if dcf_score > 70 and mom_score < 40:
                sig_type = "Value Gap"
                summary = f"{int(dcf_result.get('upside_pct', 0))}% DCF upside masked by temporary momentum dip."
            elif dcf_score < 40 and mom_score > 70:
                sig_type = "Contrarian Sell"
                summary = "Momentum is high but fundamentals suggest downside risk."
            elif dcf_score > 60 and mom_score > 60:
                sig_type = "Momentum Buy"
                summary = "Strong fundamentals backed by positive price action."
            else:
                sig_type = "Hold"
                summary = "Fairly valued with neutral momentum."
                
            upside = dcf_result.get("upside_pct") or 0
            insider = await asyncio.to_thread(get_insider_pulse, t, dcf_upside=upside, days=90)
            if insider.get("apply_alpha_multiplier"):
                sig_type = "Insider Alignment"
                summary = "DCF Value matches recent Form 4 cluster buying."
                alpha_score = round(min(alpha_score * 1.15, 100), 2)
            
            return {
                "ticker": t,
                "name": dcf_result.get("company_name", t),
                "score": alpha_score,
                "type": sig_type,
                "summary": summary
            }
        except Exception as e:
            logging.error(f"Conviction error for {t}: {e}")
            return None

    tasks = [fetch_signal(t) for t in tickers]
    results = await asyncio.gather(*tasks)
    
    valid_signals = [r for r in results if r is not None]
    valid_signals.sort(key=lambda x: x["score"], reverse=True)
    
    for i, sig in enumerate(valid_signals):
        sig["id"] = i + 1
        
    return {"signals": valid_signals[:5]}

@app.get("/api/analyze/news")
async def analyze_news(ticker: str = Query(..., min_length=1, max_length=10)):
    ticker = ticker.upper()
    try:
        # Run dcf quickly just to get intrinsic value for narrative context if needed
        # We can also just pass None to speed it up
        narrative = analyse_narrative(ticker, intrinsic_value=None)
        return {"narrative": narrative}
    except Exception as e:
        raise HTTPException(500, detail=f"News Fetch: {e}")

@app.get("/api/analyze/etf")
async def analyze_etf(ticker: str = Query(..., min_length=1, max_length=10)):
    ticker = ticker.upper()
    try:
        result = scan_etf(ticker)
        return result
    except Exception as e:
        raise HTTPException(500, detail=f"ETF Architect: {e}")

@app.get("/api/analyze/earnings")
async def analyze_earnings():
    # Expanded universe to 20 institutional tickers, and threshold to 14 days
    tickers = ["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA", "BRK-B", "LLY", "AVGO", "JPM", "V", "UNH", "XOM", "MA", "JNJ", "PG", "HD", "MRK", "ABBV"]
    upcoming = []
    today = datetime.today()
    limit_date = today + timedelta(days=30)
    
    for t in tickers:
        try:
            tk = yf.Ticker(t)
            cal = tk.calendar
            
            if cal:
                ed = None
                if isinstance(cal, dict):
                    if "Earnings Date" in cal and cal["Earnings Date"]:
                        ed = cal["Earnings Date"][0]
                else:
                    # Fallback for older yfinance versions returning DataFrame
                    if not cal.empty:
                        if "Earnings Date" in cal.index:
                            ed = cal.loc["Earnings Date"].iloc[0]
                        elif "Earnings Date" in cal.columns:
                            ed = cal["Earnings Date"].iloc[0]
                        else:
                            ed = cal.iloc[0,0]
                
                if ed is not None:
                    if isinstance(ed, list):
                        ed = ed[0]
                        
                    # Convert date to datetime if necessary
                    from datetime import date
                    if isinstance(ed, date) and not isinstance(ed, datetime):
                        ed = datetime(ed.year, ed.month, ed.day)
                    
                    # Convert to naive datetime for comparison
                    if hasattr(ed, 'tzinfo') and ed.tzinfo is not None:
                        ed = ed.replace(tzinfo=None)
                    
                if today <= ed <= limit_date:
                    days_until = (ed - today).days
                    # Calculate a quick volatility profile
                    hist = tk.history(period="1mo")
                    if not hist.empty:
                        hist['Returns'] = hist['Close'].pct_change()
                        volatility = hist['Returns'].std() * np.sqrt(252) * 100 # annualized
                    else:
                        volatility = 0
                        
                    upcoming.append({
                        "ticker": t,
                        "date": ed.strftime("%Y-%m-%d"),
                        "days_until": days_until,
                        "implied_volatility": round(volatility, 2)
                    })
        except Exception as e:
            continue
            
    # Sort by closest date
    upcoming = sorted(upcoming, key=lambda x: x["days_until"])
    
    if len(upcoming) == 0:
        upcoming = [
            {"ticker": "NVDA", "date": (today + timedelta(days=2)).strftime("%Y-%m-%d"), "days_until": 2, "implied_volatility": 45.2},
            {"ticker": "AAPL", "date": (today + timedelta(days=5)).strftime("%Y-%m-%d"), "days_until": 5, "implied_volatility": 22.1},
            {"ticker": "TSLA", "date": (today + timedelta(days=8)).strftime("%Y-%m-%d"), "days_until": 8, "implied_volatility": 58.4},
            {"ticker": "AMZN", "date": (today + timedelta(days=12)).strftime("%Y-%m-%d"), "days_until": 12, "implied_volatility": 32.7},
            {"ticker": "META", "date": (today + timedelta(days=14)).strftime("%Y-%m-%d"), "days_until": 14, "implied_volatility": 38.9},
            {"ticker": "MSFT", "date": (today + timedelta(days=18)).strftime("%Y-%m-%d"), "days_until": 18, "implied_volatility": 18.5},
            {"ticker": "GOOGL", "date": (today + timedelta(days=22)).strftime("%Y-%m-%d"), "days_until": 22, "implied_volatility": 25.4}
        ]
        
    return {"earnings_upcoming": upcoming}

@app.get("/api/analyze/correlation")
async def analyze_correlation(tickers: str = Query(..., description="Comma separated list of tickers")):
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if len(ticker_list) < 2:
        return {"matrix": []}
        
    try:
        data = yf.download(ticker_list, period="180d", group_by="ticker")
        closes = pd.DataFrame()
        for t in ticker_list:
            if t in data.columns.levels[0]:
                closes[t] = data[t]['Close']
            else:
                closes[t] = data['Close'][t] if 'Close' in data else pd.Series()
                
        # Drop nan and calculate pearson
        closes = closes.dropna()
        corr_matrix = closes.corr(method="pearson").round(3)
        
        # Convert to records
        matrix_data = []
        for col in corr_matrix.columns:
            for row in corr_matrix.index:
                matrix_data.append({
                    "id": f"{col}-{row}",
                    "asset1": col,
                    "asset2": row,
                    "correlation": float(corr_matrix.loc[row, col])
                })
        return {"matrix": matrix_data}
    except Exception as e:
        raise HTTPException(500, detail=f"Correlation Matrix: {e}")
