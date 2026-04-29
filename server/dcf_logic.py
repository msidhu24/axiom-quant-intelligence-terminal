"""
dcf_logic.py — Axiom DCF Engine
Implements the core Discounted Cash Flow valuation from the msidhu24/DCF-QUANT-AI-STOCK-ANALYSIS
methodology: FCF projection → Terminal Value → WACC discounting → Intrinsic Value per share.
Includes: generate_sensitivity_matrix() for the Shadow Price Heatmap.
"""

import yfinance as yf
import numpy as np
import logging

def run_dcf(ticker: str, wacc: float = 0.08, perpetual_growth: float = 0.025) -> dict:
    """
    Runs a simplified 10-year DCF model using yfinance data.
    Allows user-adjustable wacc and perpetual_growth for scenario testing.
    """
    tk = yf.Ticker(ticker)
    info = tk.info

    # Extract required inputs with robust fallbacks
    try:
        current_price = info.get('currentPrice', info.get('regularMarketPrice', 0))
        shares_out = info.get('sharesOutstanding', 1)
        free_cashflow = info.get('freeCashflow', 0)
        
        # If FCF is missing, approximate from Operating Cashflow - CapEx
        if not free_cashflow:
            cashflow = tk.cashflow
            if not cashflow.empty:
                op_cf = cashflow.loc['Operating Cash Flow'].iloc[0] if 'Operating Cash Flow' in cashflow.index else 0
                capex = cashflow.loc['Capital Expenditure'].iloc[0] if 'Capital Expenditure' in cashflow.index else 0
                free_cashflow = op_cf + capex # capex is usually negative

        total_debt = info.get('totalDebt', 0)
        total_cash = info.get('totalCash', 0)

        # Assumptions
        growth_rate_1_5 = 0.10  # 10% growth years 1-5
        growth_rate_6_10 = 0.05 # 5% growth years 6-10

        if free_cashflow <= 0 or current_price == 0:
            return {
                "error": "Negative FCF or missing price data",
                "current_price": current_price,
                "intrinsic_value": 0,
                "upside_pct": 0,
                "company_name": info.get("shortName", ticker)
            }

        # Project FCF
        fcf_projections = []
        cf = free_cashflow
        for year in range(1, 11):
            if year <= 5:
                cf *= (1 + growth_rate_1_5)
            else:
                cf *= (1 + growth_rate_6_10)
            fcf_projections.append(cf)

        # Discount FCF
        pv_fcf = sum([fcf / ((1 + wacc) ** i) for i, fcf in enumerate(fcf_projections, 1)])

        # Terminal Value
        terminal_value = (fcf_projections[-1] * (1 + perpetual_growth)) / (wacc - perpetual_growth)
        pv_tv = terminal_value / ((1 + wacc) ** 10)

        # Enterprise Value to Equity Value
        enterprise_value = pv_fcf + pv_tv
        equity_value = enterprise_value + total_cash - total_debt
        
        intrinsic_value = equity_value / shares_out
        upside_pct = ((intrinsic_value - current_price) / current_price) * 100

        return {
            "current_price": round(current_price, 2),
            "intrinsic_value": round(intrinsic_value, 2),
            "upside_pct": round(upside_pct, 2),
            "company_name": info.get("shortName", ticker),
            "wacc": wacc,
            "perpetual_growth": perpetual_growth,
            "fcf_base": free_cashflow
        }
    except Exception as e:
        logging.error(f"DCF Error for {ticker}: {str(e)}")
        raise e

def generate_sensitivity_matrix(dcf_result: dict) -> list:
    """
    Generates a 3x3 matrix varying WACC and Perpetual Growth Rate.
    Returns a list of dicts: [{wacc, growth, value, upside_pct}, ...]
    """
    if "error" in dcf_result or dcf_result.get("intrinsic_value", 0) == 0:
        return []

    base_wacc = dcf_result.get("wacc", 0.08)
    base_growth = dcf_result.get("perpetual_growth", 0.025)
    current_price = dcf_result.get("current_price", 1)
    intrinsic_value = dcf_result.get("intrinsic_value", 1)
    
    # We approximate the matrix around the base intrinsic value 
    # instead of re-running the whole loop for speed, 
    # using duration approximations or simple shifts.
    
    matrix = []
    wacc_shifts = [-0.01, 0.0, 0.01] # -1%, 0%, +1%
    growth_shifts = [-0.005, 0.0, 0.005] # -0.5%, 0%, +0.5%
    
    for ws in wacc_shifts:
        for gs in growth_shifts:
            # Very rough approximation of the price sensitivity to WACC and Growth
            # 1% change in WACC ~ -15% change in value
            # 0.5% change in growth ~ +10% change in value
            wacc_effect = -(ws / 0.01) * 0.15
            growth_effect = (gs / 0.005) * 0.10
            
            new_val = intrinsic_value * (1 + wacc_effect + growth_effect)
            upside = ((new_val - current_price) / current_price) * 100
            
            matrix.append({
                "wacc": round((base_wacc + ws) * 100, 1),
                "growth": round((base_growth + gs) * 100, 1),
                "value": round(new_val, 2),
                "upside_pct": round(upside, 1)
            })
            
    return matrix
