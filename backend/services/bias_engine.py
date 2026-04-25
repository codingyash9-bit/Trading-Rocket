import uuid
from datetime import datetime

from models.prediction import Prediction, Direction, PredictionStatus, MarketCapCategory
from models.outcome import Outcome, Verdict
from models.bias_profile import BiasProfile
from services.autopsy_engine import autopsy_engine

def update_bias_profile(user_id: str, sector: str, market_cap_category: MarketCapCategory):
    all_preds = autopsy_engine.get_predictions()
    closed_preds = [p for p in all_preds if 
                    p.user_id == user_id and 
                    p.sector == sector and 
                    p.market_cap_category == market_cap_category and 
                    p.status == PredictionStatus.RESOLVED]
    
    if not closed_preds:
        return
        
    total_cases = len(closed_preds)
    all_outcomes = autopsy_engine.get_outcomes()
    all_scores = autopsy_engine.get_accuracy_scores()
    
    confirmed_partial = 0
    time_error_sum = 0
    range_hits = 0
    bullish_calls = 0
    over_bullish_invalidated = 0
    speed_underestimates = 0
    
    for p in closed_preds:
        outcome = next((o for o in all_outcomes if o.prediction_id == p.id), None)
        score = next((s for s in all_scores if s.prediction_id == p.id), None)
        
        if outcome and score:
            if outcome.verdict in [Verdict.CONFIRMED, Verdict.PARTIAL]:
                confirmed_partial += 1
            time_error_sum += (outcome.actual_days_to_resolve - p.time_horizon_days)
            if score.range_score == 30:
                range_hits += 1
            if outcome.actual_days_to_resolve < p.time_horizon_days:
                speed_underestimates += 1
                
        if p.direction == Direction.BULLISH:
            bullish_calls += 1
            if outcome and outcome.verdict == Verdict.INVALIDATED:
                over_bullish_invalidated += 1
                
    direction_accuracy_rate = confirmed_partial / total_cases
    avg_time_error_days = time_error_sum / total_cases
    range_hit_rate = range_hits / total_cases
    over_bullish_rate = (over_bullish_invalidated / bullish_calls) if bullish_calls > 0 else 0.0
    speed_underestimate_rate = speed_underestimates / total_cases
    
    profiles = autopsy_engine.get_bias_profiles()
    existing_profile = next((bp for bp in profiles if 
                             bp.user_id == user_id and 
                             bp.sector == sector and 
                             bp.market_cap_category == market_cap_category), None)
    
    profile_id = existing_profile.id if existing_profile else str(uuid.uuid4())
    
    updated_profile = BiasProfile(
        id=profile_id,
        user_id=user_id,
        sector=sector,
        market_cap_category=market_cap_category,
        total_cases=total_cases,
        direction_accuracy_rate=direction_accuracy_rate,
        avg_time_error_days=avg_time_error_days,
        range_hit_rate=range_hit_rate,
        over_bullish_rate=over_bullish_rate,
        speed_underestimate_rate=speed_underestimate_rate,
        last_updated=datetime.now().isoformat()
    )
    
    autopsy_engine.save_bias_profile(updated_profile)
