"""
services/insider_pulse.py — Axiom Insider Pulse Engine (Whale Watch)
"""

import logging

def get_insider_pulse(ticker: str, dcf_upside: float = 0.0, days: int = 90) -> dict:
    """
    Mock logic for SEC Form 4 insider buying detection.
    If there is a cluster of buys, it triggers the 'Whale Watch' multiplier.
    """
    # Deterministic mock based on ticker length and upside to show the feature
    cluster_detected = len(ticker) <= 4 and dcf_upside > 10.0
    
    buys = 4 if cluster_detected else 1
    sells = 1 if cluster_detected else 3
    
    return {
        "net_buyers": buys,
        "net_sellers": sells,
        "cluster_buy": cluster_detected,
        "apply_alpha_multiplier": cluster_detected,
        "message": f"Detected {buys} insiders buying in last {days} days." if cluster_detected else "Normal insider activity."
    }
