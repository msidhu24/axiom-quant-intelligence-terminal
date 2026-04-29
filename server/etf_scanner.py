"""
etf_scanner.py — Axiom ETF-to-Equity Recursive Scanner
Deconstructs ETF holdings and runs DCF + Sentiment on each constituent.
ETF_Score = Σ (holding_weight_i × alpha_score_i)
"""

import yfinance as yf
import pandas as pd
from typing import Optional
from dcf_logic import run_dcf
from sentiment_logic import run_sentiment
from axiom_engine import AxiomEngine, compute_etf_score

def _get_holdings_yfinance(etf_ticker: str) -> list:
    """
    Mock holdings fetcher using yfinance info. 
    yfinance funds_data API can be unreliable, so we mock a realistic portfolio.
    """
    # For a real implementation, you would parse the CSV or use a robust API
    # Here we mock top 20 holdings for SPY / QQQ
    mock_holdings = [
        {"ticker": "AAPL", "weight": 7.0, "name": "Apple Inc."},
        {"ticker": "MSFT", "weight": 6.5, "name": "Microsoft Corp."},
        {"ticker": "NVDA", "weight": 5.0, "name": "NVIDIA Corp."},
        {"ticker": "AMZN", "weight": 3.4, "name": "Amazon.com Inc."},
        {"ticker": "META", "weight": 2.1, "name": "Meta Platforms Inc."},
        {"ticker": "GOOGL", "weight": 2.0, "name": "Alphabet Inc. A"},
        {"ticker": "BRK-B", "weight": 1.7, "name": "Berkshire Hathaway B"},
        {"ticker": "LLY", "weight": 1.4, "name": "Eli Lilly & Co."},
        {"ticker": "AVGO", "weight": 1.3, "name": "Broadcom Inc."},
        {"ticker": "JPM", "weight": 1.2, "name": "JPMorgan Chase"},
        {"ticker": "V", "weight": 1.1, "name": "Visa Inc."},
        {"ticker": "UNH", "weight": 1.0, "name": "UnitedHealth Group"},
        {"ticker": "XOM", "weight": 0.9, "name": "Exxon Mobil Corp."},
        {"ticker": "MA", "weight": 0.8, "name": "Mastercard Inc."},
        {"ticker": "JNJ", "weight": 0.8, "name": "Johnson & Johnson"},
        {"ticker": "PG", "weight": 0.7, "name": "Procter & Gamble"},
        {"ticker": "HD", "weight": 0.7, "name": "Home Depot"},
        {"ticker": "MRK", "weight": 0.6, "name": "Merck & Co."},
        {"ticker": "ABBV", "weight": 0.6, "name": "AbbVie Inc."},
        {"ticker": "COST", "weight": 0.5, "name": "Costco Wholesale"}
    ]
    return mock_holdings

def scan_etf(ticker: str, max_holdings: int = 20) -> dict:
    """
    Recursively scans ETF holdings and computes the aggregate Alpha Score.
    """
    holdings = _get_holdings_yfinance(ticker)[:max_holdings]
    analysed_holdings = []
    
    for h in holdings:
        t = h["ticker"]
        try:
            dcf_result = run_dcf(t)
            sent_result = run_sentiment(t, days=14)
            engine = AxiomEngine(dcf_result, sent_result)
            analysis = engine.compute()
            
            analysed_holdings.append({
                "ticker": t,
                "name": h["name"],
                "weight": h["weight"],
                "alpha_score": analysis["alpha_score"],
                "rating": analysis["rating"],
                "rating_color": analysis["rating_color"]
            })
        except Exception as e:
            print(f"Failed to analyze {t}: {e}")
            continue
            
    # Sort by weight descending
    analysed_holdings = sorted(analysed_holdings, key=lambda x: x["weight"], reverse=True)
    
    # Compute weighted ETF score
    etf_score = compute_etf_score(analysed_holdings)
    
    return {
        "etf_ticker": ticker,
        "etf_score": etf_score,
        "holdings_count": len(analysed_holdings),
        "holdings": analysed_holdings
    }
