# backend/services/wargame_service.py
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
import json

from services.ai_service import analyze_with_ai

logger = logging.getLogger(__name__)


class WargameService:
    def __init__(self):
        self.max_retries = 2

    async def generate_scenarios(
        self,
        event_id: str,
        ticker: str,
        earnings_date: datetime,
        quarter: str,
        context: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        prompt = self._build_scenario_prompt(ticker, earnings_date, quarter, context)

        for attempt in range(self.max_retries + 1):
            try:
                ai_result = await analyze_with_ai(prompt)
                response = ai_result.get('analysis', '') if isinstance(ai_result, dict) else str(ai_result)
                scenarios = self._parse_and_validate_scenarios(response, context)

                if scenarios:
                    await self._save_scenarios(event_id, scenarios)
                    return scenarios

            except Exception as e:
                logger.warning(f"Scenario generation attempt {attempt + 1} failed: {str(e)}")
                if attempt == self.max_retries:
                    raise Exception("Failed to generate valid scenarios after retries")

        raise Exception("Failed to generate scenarios")

    def _build_scenario_prompt(
        self,
        ticker: str,
        earnings_date: datetime,
        quarter: str,
        context: Optional[Dict[str, Any]]
    ) -> str:
        base_prompt = f"""You are a pre-earnings scenario analyst for Indian NSE/BSE stocks.
Generate exactly 3 scenarios for {ticker} earnings on {earnings_date.strftime("%Y-%m-%d")} ({quarter}):

Return JSON with this exact structure:
{{
  "scenarios": [
    {{
      "type": "BULL",
      "probability": 35,
      "price_move_low": 5.0,
      "price_move_high": 12.0,
      "trigger": "Revenue growth exceeds 20% YoY",
      "killer_condition": "Disappointing margins despite revenue beat",
      "reasoning": "Strong demand in key segments and festive season sales"
    }},
    {{
      "type": "BASE",
      "probability": 45,
      "price_move_low": -2.0,
      "price_move_high": 4.0,
      "trigger": "EPS in line with estimates (±5%)",
      "killer_condition": "Guidance cuts or weak outlook",
      "reasoning": "Steady performance with mixed segmental results"
    }},
    {{
      "type": "BEAR",
      "probability": 20,
      "price_move_low": -8.0,
      "price_move_high": -3.0,
      "trigger": "Revenue misses by more than 10%",
      "killer_condition": "Sustained margin pressure and inventory buildup",
      "reasoning": "Competitive pressures and input cost inflation"
    }}
  ]
}}

RULES:
- Probabilities must sum to exactly 100
- BASE probability must be between 35-55
- BULL and BEAR minimum probability is 10 each
- Each price move range must be minimum 4 percentage points wide
- BULL low must be positive (above 0)
- BEAR high must be negative (below 0)
- BASE must straddle zero (low negative, high positive)
- Trigger names must be a specific metric and threshold
- NO hedging words: could, might, may, potentially
- Be specific and confident in all statements
- Use Indian market context (NSE/BSE)"""

        if context and context.get('recent_reactions'):
            reactions_text = "\n\nRecent earnings reactions (last 4 quarters):\n"
            for rx in context['recent_reactions']:
                reactions_text += f"- {rx['date']}: {rx['move']}% ({rx['result']})\n"
            base_prompt += reactions_text

        return base_prompt

    def _parse_and_validate_scenarios(
        self,
        response: str,
        context: Optional[Dict[str, Any]]
    ) -> Optional[List[Dict[str, Any]]]:
        try:
            if isinstance(response, str):
                data = json.loads(response)
            else:
                data = response

            scenarios = data.get('scenarios', [])

            if len(scenarios) != 3:
                logger.warning(f"Expected 3 scenarios, got {len(scenarios)}")
                return None

            for s in scenarios:
                s['type'] = s['type'].upper()

            types = [s['type'] for s in scenarios]
            if not all(t in ['BULL', 'BASE', 'BEAR'] for t in types):
                logger.warning("Invalid scenario types")
                return None

            prob_sum = sum(s['probability'] for s in scenarios)
            if abs(prob_sum - 100) > 1:
                logger.warning(f"Probabilities sum to {prob_sum}, expected 100")
                return None

            base_scenario = next((s for s in scenarios if s['type'] == 'BASE'), None)
            if not base_scenario or not (35 <= base_scenario['probability'] <= 55):
                logger.warning("BASE probability not in 35-55 range")
                return None

            for s in scenarios:
                if s['type'] in ['BULL', 'BEAR'] and s['probability'] < 10:
                    logger.warning(f"{s['type']} probability below 10")
                    return None

            bull = next((s for s in scenarios if s['type'] == 'BULL'), None)
            if bull and bull['price_move_low'] <= 0:
                logger.warning("BULL low must be positive")
                return None

            bear = next((s for s in scenarios if s['type'] == 'BEAR'), None)
            if bear and bear['price_move_high'] >= 0:
                logger.warning("BEAR high must be negative")
                return None

            for s in scenarios:
                price_range = abs(s['price_move_high'] - s['price_move_low'])
                if price_range < 4:
                    logger.warning(f"{s['type']} range {price_range} < 4")
                    return None

            base = next((s for s in scenarios if s['type'] == 'BASE'), None)
            if base and not (base['price_move_low'] < 0 and base['price_move_high'] > 0):
                logger.warning("BASE must straddle zero")
                return None

            return scenarios

        except Exception as e:
            logger.error(f"Parse error: {str(e)}")
            return None

    async def _save_scenarios(self, event_id: str, scenarios: List[Dict[str, Any]]):
        from db import create_wargame_scenarios

        await create_wargame_scenarios(event_id, scenarios)

    def get_earnings_context(self, ticker: str) -> Dict[str, Any]:
        import yfinance

        context = {
            'recent_reactions': [],
            'historical_volatility': None,
            'avg_volume': None
        }

        try:
            stock = yfinance.Ticker(ticker)
            history = stock.history(period="1y")

            if history is not None and not history.empty:
                context['avg_volume'] = float(history['Volume'].mean())

                returns = history['Close'].pct_change().dropna()
                context['historical_volatility'] = float(returns.std() * (252 ** 0.5) * 100)

            earnings_history = stock.earnings_history
            if earnings_history is not None and not earnings_history.empty:
                for idx, row in earnings_history.head(4).iterrows():
                    surprise = row.get(' Surprise', row.get('surprise', 0))
                    if surprise is not None:
                        move = float(surprise) * 100
                        result = "BEAT" if surprise > 0 else "MISS"
                        context['recent_reactions'].append({
                            'date': str(idx) if hasattr(idx, 'strftime') else str(idx),
                            'move': round(move, 2),
                            'result': result
                        })

        except Exception as e:
            logger.warning(f"Could not fetch earnings context for {ticker}: {str(e)}")

        return context