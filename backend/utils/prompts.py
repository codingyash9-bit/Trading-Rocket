"""
AI Prompts - Master prompt for structured multi-section reports
"""

# Stage 1: Market Overview + Technical Analysis
STAGE1_PROMPT = """You are a professional Indian stock market analyst with 20+ years of experience.

STOCK: {symbol}
Current Price: ₹{current_price}
Price Change: {change_pct}% ({period})
52W High: ₹{year_high}
52W Low: ₹{year_low}
Sector: {sector}

TECHNICAL INDICATORS:
- RSI (14): {rsi}
- SMA 20: ₹{sma20}
- SMA 50: ₹{sma50}
- MACD: {macd}
- Trend: {trend}

Analyze and provide:

## 1. MARKET OVERVIEW
- Current price position relative to 52W range
- Key support and resistance levels
- Today's market sentiment

## 2. TECHNICAL ANALYSIS
- What the indicators suggest (bullish/bearish/neutral)
- Key pattern observations
- Volume analysis

Keep concise, max 200 words total."""


# Stage 2: Risk Analysis + Prediction
STAGE2_PROMPT = """Continue analysis for {symbol} at ₹{current_price}.

MARKET DATA:
- Beta: {beta}
- Volatility: {volatility}
- Market Cap: {market_cap}
- P/E Ratio: {pe}

Provide:

## 3. RISK ANALYSIS
- Key risk factors for this stock
- Volatility assessment (High/Medium/Low)
- External risks (currency, commodities, regulation)

## 4. PREDICTION INSIGHT
- Short-term outlook (1-4 weeks)
- Key price catalysts
- Probability assessment

Keep concise, max 200 words total."""


# Stage 3: Scenario Analysis + Recommendation + Summary
STAGE3_PROMPT = """Final analysis for {symbol} at ₹{current_price}.

NEWS CONTEXT:
{news_context}

Provide:

## 5. SCENARIO ANALYSIS
- Bull Case: Key upside triggers
- Bear Case: Key downside risks
- Base Case: Most likely outcome

## 6. FINAL RECOMMENDATION
- Decision: BUY / SELL / HOLD
- Confidence: 0-100%
- Entry price recommendation
- Target price (6-12 months)
- Stop loss level
- Risk/Reward ratio

## 7. BEGINNER-FRIENDLY SUMMARY
Explain in simple terms:
- What the company does
- Why this recommendation
- Key things to watch
- Suggested investment amount for beginners

## 8. SOURCES USED
List the news sources provided above with their titles and URLs.
{news_list}

Keep total output under 500 words. Be specific and data-driven."""


# Master prompt combining all stages
MASTER_PROMPT = """You are a professional Indian stock market analyst with 20+ years of experience.

Analyze {symbol} ({name}) and provide a comprehensive investment report.

## STOCK DATA
- Current Price: ₹{current_price}
- Change: {change_pct}% ({period})
- Year High: ₹{year_high}
- Year Low: ₹{year_low}
- Market Cap: {market_cap} Cr
- P/E: {pe}
- Beta: {beta}
- Sector: {sector}

## TECHNICAL INDICATORS
- RSI: {rsi}
- SMA 20: ₹{sma20}
- SMA 50: ₹{sma50}
- MACD: {macd}
- Trend: {trend}

## RECENT NEWS
{news_context}

---

## REQUIRED SECTIONS

### 1. MARKET OVERVIEW
Current price position, support/resistance levels, market sentiment. (100 words)

### 2. TECHNICAL ANALYSIS  
What indicators suggest, patterns, volume analysis. (150 words)

### 3. RISK ANALYSIS
Key risks, volatility assessment, external factors. (150 words)

### 4. PREDICTION INSIGHT
Short-term outlook, catalysts, probability. (100 words)

### 5. SCENARIO ANALYSIS
Bull/Bear/Base cases with triggers. (150 words)

### 6. FINAL RECOMMENDATION
- Decision: BUY/SELL/HOLD
- Confidence: XX%
- Entry: ₹XX
- Target: ₹XX (6-12 months)
- Stop Loss: ₹XX
- Risk/Reward: 1:X

### 7. BEGINNER SUMMARY
Simple explanation for new investors. (100 words)

### 8. SOURCES
{news_list}

Total report: ~800-1000 words. Be specific, data-driven, no hallucinations."""


# Simple prompt for quick analysis
QUICK_PROMPT = """You're a stock analyst. Provide quick analysis:

Stock: {symbol}
Price: ₹{current_price}
Change: {change_pct}%
RSI: {rsi}
Trend: {trend}

Reply format:
- Decision: BUY/SELL/HOLD  
- Confidence: XX%
- Entry: ₹XX, Target: ₹XX, Stop: ₹XX
- One line reason"""


def build_master_prompt(
    symbol: str,
    name: str,
    current_price: float,
    change_pct: float,
    period: str,
    year_high: float,
    year_low: float,
    market_cap: float,
    pe: float,
    beta: float,
    sector: str,
    rsi: float,
    sma20: float,
    sma50: float,
    macd: float,
    trend: str,
    news_context: str,
    news_list: str
) -> str:
    """Build the master prompt with all data"""
    return MASTER_PROMPT.format(
        symbol=symbol,
        name=name,
        current_price=current_price,
        change_pct=change_pct,
        period=period,
        year_high=year_high,
        year_low=year_low,
        market_cap=market_cap,
        pe=pe,
        beta=beta,
        sector=sector,
        rsi=rsi,
        sma20=sma20,
        sma50=sma50,
        macd=macd,
        trend=trend,
        news_context=news_context,
        news_list=news_list
    )


def build_quick_prompt(
    symbol: str,
    current_price: float,
    change_pct: float,
    rsi: float,
    trend: str
) -> str:
    """Build quick analysis prompt"""
    return QUICK_PROMPT.format(
        symbol=symbol,
        current_price=current_price,
        change_pct=change_pct,
        rsi=rsi,
        trend=trend
    )