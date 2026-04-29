# Axiom Quant Intelligence Terminal

A full-stack, Apple-inspired financial platform that synthesizes live market data, discounted cash flow (DCF) modeling, and natural language processing (NLP) sentiment analysis into actionable trading signals.

## Project Description
The Axiom Quant Intelligence Terminal bridges the gap between fundamental valuation and modern narrative-driven trading. By aggregating data from Yahoo Finance, NewsData, and X (Twitter), the platform calculates real-time intrinsic value using a standard DCF model, and then overlays a VADER-powered sentiment score. The engine distills these disparate data points into a single "Alpha Score," surfacing the market's strongest "Value Gaps" and "Contrarian Buys" directly into a sleek, glassmorphic UI.

## Project Goals
- **API Integration**: Build a production-ready application integrating multiple external live APIs securely.
- **Dynamic Signal Generation**: Implement a dynamic, algorithmic "Conviction List" and risk alerts (e.g., Whale Watch insider alignment).
- **Adjustable Analytics**: Engineer an adjustable analytical backend that allows users to manipulate sensitivity variables like WACC, perpetual terminal growth, and NLP source weights to reflect different economic scenarios.

## Instructions for Running the Application

This project requires two active terminal instances (one for the backend, one for the frontend).

### 1. Backend (FastAPI)
Navigate to the `server` directory, install the Python dependencies, and run the server.

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 2. Frontend (React / Vite)
Open a second terminal instance, navigate to the root directory, install Node modules, and launch the dashboard.

```bash
npm install
npm run dev
```

## AI Usage Disclosure & DRIVER Workflow

This project was built using pair-programming with an advanced AI Agent (Google Gemini / Antigravity).

### DRIVER Workflow Implementation:

- **`/driver:define` (Tool: Antigravity Agent)**: I defined the initial system architecture, the glassmorphic Apple-inspired design language, and the scope of the quantitative logic (DCF and Sentiment combinations). I provided the agent with my previous "Sentify" legacy code and defined strict parameters for how the new platform should merge fundamental and sentiment data.
- **`/driver:evolve` (Tool: Antigravity Agent & IDE)**: During development, I actively evolved the project features. When the initial sentiment engine was just a price-momentum proxy, I prompted the AI to evolve the architecture by installing the `vaderSentiment` NLP engine and creating adjustable UI sliders to weight Professional News vs. Social Media, completely overhauling the sentiment pipeline.
- **`/driver:reflect` (Tool: Backend Terminal & Agent Debugging)**: I used reflection workflows to troubleshoot live data errors. For example, when the Volatility Playbook failed to identify Apple's upcoming earnings, I prompted the AI to reflect on the failure. Together, we analyzed the python terminal output and realized the `yfinance` library had fundamentally changed its data structure from a Pandas DataFrame to a standard Dictionary. We then fixed the backend parser to restore functionality.

**Disclosure Statement**: AI was extensively utilized for API integration, UI component scaffolding, and automated syntax debugging. However, all quantitative logic weighting choices, architectural decisions, and the overarching financial thesis (combining DCF with live NLP) were strictly user-directed.
