"""
Autopsy Service: Analyzes failed trades and portfolios.
"""
from services.ai_service import analyze_with_ai
from services.market_data_engine import get_market_data_async
from typing import Dict, Any

class AutopsyService:
    async def create_from_wargame(self, wargame_event, position, outcome):
        """Maps wargame fields to autopsy prediction schema and saves it."""
        try:
            from services.autopsy_engine import autopsy_engine
            from models.prediction import Prediction, PredictionStatus, Direction, MarketCapCategory
            import uuid
            from datetime import datetime
            
            # Map wargame direction to prediction direction
            direction = Direction.BULLISH if position.paper_position_direction == "LONG" else Direction.BEARISH
            
            prediction = Prediction(
                id=str(uuid.uuid4()),
                case_id=autopsy_engine.generate_case_id(),
                ticker=wargame_event.ticker,
                user_id=wargame_event.user_id,
                direction=direction,
                confidence_score=75, # Default for wargame
                price_at_call=position.price_at_seal,
                predicted_range_low=position.price_at_seal * 0.9, # Approximate
                predicted_range_high=position.price_at_seal * 1.1,
                time_horizon_days=7,
                falsification_condition="Wargame Resolved",
                falsification_price=position.price_at_seal * 0.8,
                sector="Wargame",
                market_cap_category=MarketCapCategory.LARGE, # Default
                sealed_at=position.sealed_at,
                status=PredictionStatus.RESOLVED,
                source="WARGAME",
                epitaph=f"Wargame {wargame_event.event_id} resolved. Winning scenario: {outcome.winning_scenario}."
            )
            autopsy_engine.save_prediction(prediction)
            
            # Also save outcome for autopsy
            from models.outcome import Outcome, Verdict
            aut_outcome = Outcome(
                id=str(uuid.uuid4()),
                prediction_id=prediction.id,
                actual_move_percent=outcome.actual_price_move,
                actual_days_to_resolve=1,
                verdict=Verdict.CONFIRMED if position.chosen_scenario == outcome.winning_scenario else Verdict.INVALIDATED,
                resolved_at=outcome.resolved_at,
                falsification_closest_price=outcome.actual_close_price
            )
            autopsy_engine.save_outcome(aut_outcome)
            
        except Exception as e:
            # log failures silently as per spec
            print(f"Silently failing autopsy creation from wargame: {str(e)}")

autopsy_service = AutopsyService()
