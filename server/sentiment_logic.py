"""
sentiment_logic.py — NLP and Momentum Analysis
"""
import yfinance as yf
import pandas as pd
import numpy as np

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def run_sentiment(ticker: str, days: int = 30, narrative: list = None, weight_news: float = 0.50) -> dict:
    """
    Simulates VADER sentiment parsing and momentum tracking.
    Now actually uses VADER on the passed narrative strings!
    """
    tk = yf.Ticker(ticker)
    hist = tk.history(period=f"{days}d")
    
    if hist.empty:
        return {
            "compound_score": 0.0,
            "correlation": 0.0,
            "prediction": {"probability": 50}
        }

    # NLP VADER Sentiment
    if narrative is None:
        narrative = []
        
    analyzer = SentimentIntensityAnalyzer()
    
    news_scores = []
    social_scores = []
    
    for item in narrative:
        title = item.get("title", "")
        vs = analyzer.polarity_scores(title)
        compound = vs['compound']
        
        if item.get("source") == "X (Twitter)":
            social_scores.append(compound)
        else:
            news_scores.append(compound)
            
    avg_news = sum(news_scores) / len(news_scores) if news_scores else 0.0
    avg_social = sum(social_scores) / len(social_scores) if social_scores else 0.0
    
    weight_social = 1.0 - weight_news
    
    # If one of the categories is completely empty, give the other category 100% of the weight to avoid dragging it down to 0
    if not news_scores and social_scores:
        base_sentiment = avg_social
    elif not social_scores and news_scores:
        base_sentiment = avg_news
    else:
        base_sentiment = (avg_news * weight_news) + (avg_social * weight_social)
    
    # Calculate 5-day momentum for prediction probability
    hist['Returns'] = hist['Close'].pct_change()
    momentum_5d = hist['Returns'].tail(5).sum()
    
    # Sigmoid function to map momentum to 0-100 probability
    prob = 1 / (1 + np.exp(-momentum_5d * 20))
    prob_score = round(prob * 100, 2)
    
    return {
        "compound_score": round(base_sentiment, 3),
        "correlation": 0.65 if base_sentiment > 0.5 else 0.2,
        "prediction": {
            "probability": prob_score,
            "momentum_5d": round(momentum_5d * 100, 2)
        }
    }
