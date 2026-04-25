# backend/services/graveyard_service.py
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class GraveyardService:
    def __init__(self):
        pass

    async def generate_epitaph(
        self,
        ticker: str,
        predicted_direction: Optional[str],
        confidence: Optional[float],
        invalidation_reason: Optional[str],
        actual_move: Optional[float],
        source: str = "SIGNAL"
    ) -> str:
        from services.ai_service import analyze_with_ai

        direction = (predicted_direction or "BULLISH/BEARISH").upper()
        conf = confidence or 50

        prompt = f"""Write epitaph for failed trading signal.
Ticker: {ticker}
Predicted: {direction}
Confidence: {conf}%
Invalidation: {invalidation_reason or 'unknown reason'}
Actual Move: {actual_move}%

RULES:
- One sentence only
- Past tense
- Brutally honest, no hedging
- Format: '[Ticker] called [BULLISH/BEARISH] at [confidence]% confidence — killed by [reason].'
- Maximum 20 words
- Be direct and cutting"""

        try:
            ai_result = await analyze_with_ai(prompt)
            response = ai_result.get('analysis', '') if isinstance(ai_result, dict) else str(ai_result)
            epitaph = self._parse_epitaph(response, ticker, direction, conf, invalidation_reason)
            return epitaph
        except Exception as e:
            logger.error(f"Epitaph generation failed: {str(e)}")
            return self._fallback_epitaph(ticker, direction, conf, invalidation_reason)

    def _parse_epitaph(
        self,
        response: str,
        ticker: str,
        direction: str,
        confidence: float,
        reason: Optional[str]
    ) -> str:
        if not response or len(response.strip()) == 0:
            return self._fallback_epitaph(ticker, direction, confidence, reason)

        epitaph = response.strip()

        if len(epitaph.split()) > 25:
            epitaph = ' '.join(epitaph.split()[:20]) + '.'

        return epitaph

    def _fallback_epitaph(
        self,
        ticker: str,
        direction: str,
        confidence: float,
        reason: Optional[str]
    ) -> str:
        reason_text = reason or "market forces"
        return f"{ticker} called {direction} at {confidence}% confidence — killed by {reason_text}."