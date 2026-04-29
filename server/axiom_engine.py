"""
axiom_engine.py — Alpha Score Controller
Merges DCF + Sentiment outputs into a single 0–100 Alpha Score
following the Axiom framework: fundamentals × sentiment × momentum.
"""

import math
from typing import Optional

# ─────────────────────────────────────────────────────────────
# Alpha Score Formula
# ─────────────────────────────────────────────────────────────
# Alpha = (DCF_Upside_Component × 0.55) + (Sentiment_Component × 0.30) + (Momentum_Component × 0.15)
# Each component is normalised 0–100, then blended.

WEIGHTS = {
    "dcf": 0.55,
    "sentiment": 0.30,
    "momentum": 0.15,
}

RATINGS = [
    (85, "STRONG BUY", "#00C853", "⬆️"),
    (65, "BUY", "#64DD17", "↑"),
    (45, "HOLD", "#FF9500", "→"),
    (25, "SELL", "#FF5722", "↓"),
    (0,  "STRONG SELL", "#FF1744", "⬇️"),
]

class AxiomEngine:
    """
    Merges the DCF Engine and Sentiment Engine outputs into a single Alpha Score.

    Usage:
        engine = AxiomEngine(dcf_result, sentiment_result, custom_weights={"dcf": 0.6})
        payload = engine.compute()
    """

    def __init__(self, dcf: dict, sentiment: dict, custom_weights: Optional[dict] = None):
        self.dcf = dcf
        self.sentiment = sentiment
        self.weights = WEIGHTS.copy()
        if custom_weights:
            self.weights.update(custom_weights)

    # ── component scorers ────────────────────────────────────

    def _dcf_component(self) -> float:
        """
        Map DCF upside % → 0–100 score.
        upside ≥ +50%  →  100
        upside =   0%  →   50
        upside ≤ -50%  →    0
        Linear interpolation between anchors.
        """
        upside = self.dcf.get("upside_pct")
        if upside is None:
            return 50.0  # neutral if DCF failed
        # Clamp to ±100 range then remap
        upside = max(min(upside, 100), -100)
        return round((upside + 100) / 2, 2)  # [-100,100] → [0,100]

    def _sentiment_component(self) -> float:
        """
        Map VADER compound [-1, 1] → 0–100.
        Boosted by 2× if correlation > 0.6 (Sentify pattern).
        """
        compound = self.sentiment.get("compound_score", 0.0)
        correlation = self.sentiment.get("correlation") or 0.0
        boost = 1.5 if abs(correlation) > 0.6 else 1.0
        boosted = compound * boost
        boosted = max(min(boosted, 1.0), -1.0)
        return round((boosted + 1.0) / 2.0 * 100, 2)  # [-1,1] → [0,100]

    def _momentum_component(self) -> float:
        """
        Derive momentum score from the prediction probability already computed
        in sentiment_logic.py.
        """
        prediction = self.sentiment.get("prediction", {})
        prob = prediction.get("probability", 50)
        return float(prob)

    # ── main compute ─────────────────────────────────────────

    def compute(self) -> dict:
        """Return the full Axiom payload including Alpha Score and rating."""
        dcf_score = self._dcf_component()
        sent_score = self._sentiment_component()
        mom_score = self._momentum_component()

        # Normalize weights in case user inputs don't add up to 1.0
        total_w = self.weights["dcf"] + self.weights["sentiment"] + self.weights["momentum"]
        if total_w == 0: total_w = 1

        alpha = (
            dcf_score * (self.weights["dcf"] / total_w)
            + sent_score * (self.weights["sentiment"] / total_w)
            + mom_score * (self.weights["momentum"] / total_w)
        )

        alpha = round(max(min(alpha, 100), 0), 2)

        # Determine rating
        rating, label, color, arrow = "HOLD", "HOLD", "#FF9500", "→"
        for threshold, r_label, r_color, r_arrow in RATINGS:
            if alpha >= threshold:
                rating, label, color, arrow = r_label, r_label, r_color, r_arrow
                break

        return {
            "alpha_score": alpha,
            "rating": rating,
            "rating_color": color,
            "rating_arrow": arrow,
            "components": {
                "dcf_score": dcf_score,
                "sentiment_score": sent_score,
                "momentum_score": mom_score,
            },
            "weights": self.weights,
            "dcf": self.dcf,
            "sentiment": self.sentiment,
        }

# ─────────────────────────────────────────────────────────────
# ETF Score Helper
# ─────────────────────────────────────────────────────────────

def compute_etf_score(holdings: list) -> float:
    """
    ETF_Score = Σ (holding_weight_i × (dcf_upside_i + sentiment_adj_i))
    Normalised to 0–100.
    """
    total_weight = sum(h.get("weight", 0) for h in holdings)
    if total_weight == 0:
        return 50.0

    weighted_sum = 0.0
    for h in holdings:
        w = h.get("weight", 0) / total_weight  # normalise weights
        alpha = h.get("alpha_score", 50.0)
        weighted_sum += w * alpha

    return round(max(min(weighted_sum, 100), 0), 2)
