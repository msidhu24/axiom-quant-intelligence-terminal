"""
services/alpha_gap.py — Axiom Alpha Gap Engine
Scrapes Polymarket to find prediction market dislocations vs traditional Wall Street sentiment.
"""

import requests
import logging

def get_alpha_gap_alerts(limit: int = 5) -> list:
    """
    Placeholder logic to demonstrate fetching crypto/macro event probabilities.
    In a true institutional setup, this connects to Polymarket/Kalshi order books.
    """
    url = "https://gamma-api.polymarket.com/events?closed=false&limit=20"
    headers = {
        "Accept": "application/json",
        "User-Agent": "Axiom-FIP/1.0 (educational; not for trading)",
    }
    alerts = []
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            for event in data[:limit]:
                title = event.get("title", "")
                if not title: continue
                alerts.append({
                    "title": title,
                    "id": event.get("id"),
                    "volume": float(event.get("volume", 0)),
                    "active": event.get("active", False)
                })
        else:
            # Fallback mock data
            alerts = [
                {"title": "Will the Federal Reserve cut rates in June?", "volume": 1500000},
                {"title": "Will Apple acquire an AI startup by EOY?", "volume": 500000},
                {"title": "Will Bitcoin break $100k in Q3?", "volume": 3200000}
            ]
    except Exception as e:
        logging.warning(f"Polymarket fetch failed: {e}")
        alerts = [
            {"title": "Will the Federal Reserve cut rates in June?", "volume": 1500000},
            {"title": "Will Apple acquire an AI startup by EOY?", "volume": 500000},
            {"title": "Will Bitcoin break $100k in Q3?", "volume": 3200000}
        ]
        
    return alerts
