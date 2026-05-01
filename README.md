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

This project was built using pair-programming with an advanced AI Agent (Google Gemini / Antigravity). The DRIVER framework was applied throughout the development process to ensure human-led, AI-assisted development.

---

### D — DISCOVER & DEFINE
> *Understand the problem thoroughly, define requirements, and plan the approach before engaging AI tools.*

**How I applied it:** Before touching a single line of code, I mapped out the full scope of the Axiom platform. I defined the core problem — that existing tools treat DCF and sentiment as separate silos — and specified requirements: a live FastAPI backend, a VADER NLP engine for scoring news and social media, adjustable alpha weight sliders, an Insider "Whale Watch" tracker via SEC Form 4 filings, and a real-time Conviction List on the dashboard. I ported my prior "Sentify" project as a knowledge reference and gave the AI precise architectural constraints before it wrote any code.

---

### R — REPRESENT
> *Visualize the solution structure, create frameworks, and identify which tasks benefit from AI vs. require human judgment.*

**How I applied it:** I mapped the full data pipeline architecture: `YFinance API → DCF Engine → NewsData/Twitter → VADER NLP → AxiomEngine → Alpha Score → React Dashboard`. I identified which tasks required my financial judgment (e.g., setting the WACC range, defining what constitutes a "Value Gap" signal, choosing the Kelly Criterion for position sizing) versus which could be AI-scaffolded (e.g., React component boilerplate, FastAPI route setup, CSS animations).

---

### I — IMPLEMENT
> *Execute the solution with AI collaboration, maintaining human oversight and direction throughout.*

**How I applied it:** I implemented the platform in iterative sprints, always acting as the director. I prompted the AI to build the `AxiomEngine`, `StockAnalyzer.jsx`, `Dashboard.jsx`, the ETF recursive scanner, and the VADER sentiment pipeline. At each step, I reviewed the code, corrected logical errors (such as the hardcoded news category filter that was blocking article throughput), and re-directed the agent when outputs didn't match my financial intent.

---

### V — VALIDATE
> *Verify all outputs against financial principles, cross-reference data sources, and apply business logic sanity tests.*

**How I applied it:** I manually validated the Alpha Score math by testing extreme parameter values through the engine calibration sliders. I cross-referenced the DCF intrinsic value outputs against known analyst targets for AAPL, NVDA, and MSFT. I also validated the Conviction List by confirming that stocks with high DCF scores and low momentum were correctly being flagged as "Value Gap" signals, and that the Insider Alignment multiplier (15% boost) was only applied when genuine SEC Form 4 cluster buying was detected.

---

### E — EVOLVE
> *Refine and optimize the solution based on validation findings and changing requirements.*

**How I applied it:** After validating the initial build, I evolved the platform in several critical ways. I added the Source Weighting (News vs. Social) NLP slider after realizing the flat sentiment score was ignoring source credibility. I expanded the Volatility Playbook from 3 hardcoded tickers to a live 20-ticker scan with real earnings calendar data. I replaced the static mock Conviction List with a live background-scanning endpoint that dynamically ranks best buys using real-time market logic.

---

### R — REFLECT
> *Document the process, capture learnings, and create reusable knowledge for future applications.*

**How I applied it:** Throughout development I reflected on failures and turned them into improvements. The most significant reflection was diagnosing the Volatility Playbook crash: when Apple's earnings date wasn't showing, I prompted the AI to reflect on the Python terminal error, and we discovered that `yfinance` had silently changed its `.calendar` return type from a Pandas DataFrame to a Python Dictionary — a breaking change with no deprecation warning. Reflecting on this taught me to always validate third-party API return types rather than assuming stability.

---

**Disclosure Statement:** **AI Disclosure**: The AI handled API integration, syntax debugging, and UI scaffolding. However, all quantitative logic, position sizing algorithms, and the fundamental thesis were strictly user-directed.

---

## ⚠️ Disclaimer: Not Financial Advice

**This project is for educational and academic purposes only.** 

The Axiom Quant Intelligence Terminal, including its Alpha Scores, Conviction Lists, Shadow Prices, and Kelly Criterion position sizing models, **does not constitute financial, investment, or legal advice.** 

The algorithmic signals and sentiment metrics generated by this platform are based on hypothetical, generalized mathematical models and highly volatile third-party data sources (e.g., social media sentiment, scraped earnings dates). They are inherently flawed and should not be used to make real-world trading decisions. Any capital deployed in financial markets is at risk of complete loss. The creator of this project is not a licensed financial advisor and assumes no liability for any financial losses incurred through the use of this software.
